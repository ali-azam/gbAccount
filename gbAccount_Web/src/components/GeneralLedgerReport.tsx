"use client";

import React, { useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { useAccounts } from "@/lib/useAccounts";
import { accountsAtLevel } from "@/lib/reportAccounts";
import {
  childOffices,
  officeLabel,
  useOffices,
  type OfficeOption,
} from "@/lib/useOffices";
import {
  REPORT_TYPES,
  apiFormat,
  downloadReport,
  fetchReport,
  formatAmount,
  formatApiDate,
  formatLabel,
  toApiDate,
} from "@/lib/reportFile";

/** One posting, as returned by /api/general-ledger-reports. */
interface LedgerRow {
  trxDate: string;
  voucherNo: string;
  descripton: string;
  debit: number;
  credit: number;
  balance: number;
}

/** The postings for one account, with its opening position. */
interface LedgerAccount {
  accCode: string;
  accName: string;
  openingDebit: number;
  openingCredit: number;
  openingBalance: number;
  rows: LedgerRow[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

interface LedgerReport {
  companyName: string;
  officeName: string;
  reportTitle: string;
  dateFrom: string;
  dateTo: string;
  accounts: LedgerAccount[];
  totalDebit: number;
  totalCredit: number;
}

const LEDGER_PATH = "/api/general-ledger-reports";

const COLUMN_COUNT = 6;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDateString = (rawDate: string) => {
  if (!rawDate) return "";
  const parts = rawDate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day.padStart(2, "0")}-${MONTHS[monthIndex]}-${year}`;
    }
  }
  return rawDate;
};

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

// A ledger over a single day is almost always empty, so the range opens on
// the first of January the way the legacy report's own range does.
const startOfYear = () => `01-Jan-${new Date().getFullYear()}`;

/** Right-aligned cell style for the amount columns. */
const amountCell: React.CSSProperties = {
  textAlign: "right",
  whiteSpace: "nowrap",
};

export default function GeneralLedgerReport() {
  const { offices, loading: officesLoading, error: officesError } = useOffices();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();

  const [zoneCode, setZoneCode] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [dateFrom, setDateFrom] = useState(startOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [accLevel, setAccLevel] = useState("3");
  const [accountCode, setAccountCode] = useState("");
  const [reportType, setReportType] = useState("pdf");
  const [report, setReport] = useState<LedgerReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  // The organisation runs a single head office, so it is shown but never
  // chosen — everything below it cascades from there.
  const headOffice = useMemo(
    () => offices.find((office) => office.officeLevel === 1) ?? null,
    [offices]
  );

  const zoneOptions = useMemo(
    () => childOffices(offices, 2, headOffice?.officeCode ?? ""),
    [offices, headOffice]
  );

  const areaOptions = useMemo(
    () => childOffices(offices, 3, zoneCode),
    [offices, zoneCode]
  );

  const officeOptions = useMemo(
    () => childOffices(offices, 4, areaCode),
    [offices, areaCode]
  );

  /**
   * The deepest office chosen. The API reports an office together with
   * everything beneath it, so picking a zone reports the whole zone and
   * leaving all three empty reports the whole organisation.
   */
  const selectedOffice: OfficeOption | null = useMemo(() => {
    const byCode = (level: number, code: string) =>
      code
        ? offices.find(
            (office) =>
              office.officeLevel === level && office.officeCode === code
          ) ?? null
        : null;

    return (
      byCode(4, officeCode) ??
      byCode(3, areaCode) ??
      byCode(2, zoneCode) ??
      headOffice
    );
  }, [offices, officeCode, areaCode, zoneCode, headOffice]);

  // Account Code options follow the selected Account Level, matching the
  // cascading behaviour of the Chart of Accounts.
  const accountCodeOptions = useMemo(
    () => accountsAtLevel(accounts, accLevel),
    [accounts, accLevel]
  );

  // An empty list is either still loading, a failed load, or a level that
  // genuinely holds no accounts — say which, rather than showing a bare
  // placeholder that looks like the filter is broken.
  const accountCodePlaceholder = accountsLoading
    ? "Loading accounts..."
    : accountsError
      ? "Accounts could not be loaded"
      : accountCodeOptions.length === 0
        ? `No accounts at level ${accLevel}`
        : "All Accounts";

  /**
   * The query string both endpoints take, or null when the form is not
   * filled in well enough to send. The message is put on screen by the
   * caller.
   */
  const buildParams = (): URLSearchParams | null => {
    const apiDateFrom = toApiDate(dateFrom);
    const apiDateTo = toApiDate(dateTo);

    if (!apiDateFrom) {
      setError("Please select a valid Date From.");
      return null;
    }

    if (!apiDateTo) {
      setError("Please select a valid Date To.");
      return null;
    }

    if (apiDateFrom > apiDateTo) {
      setError("Date From cannot be greater than Date To.");
      return null;
    }

    const params = new URLSearchParams();

    params.append("DateFrom", apiDateFrom);
    params.append("DateTo", apiDateTo);

    if (selectedOffice) {
      params.append("OfficeId", String(selectedOffice.officeId));
    }

    // Account Level always goes along: with a code it selects that account
    // and everything beneath it, and on its own it decides which ancestor
    // the postings are grouped under.
    params.append("AccLevel", accLevel);

    if (accountCode) {
      params.append("AccCode", accountCode);
    }

    return params;
  };

  /** GET /api/general-ledger-reports — the ledger on screen. */
  const handleView = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const params = buildParams();

    if (!params) return;

    try {
      setLoading(true);

      setReport(
        await fetchReport<LedgerReport>(LEDGER_PATH, params, "general ledger")
      );
    } catch (err) {
      console.error("GENERAL LEDGER ERROR:", err);

      setReport(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the general ledger."
      );
    } finally {
      setLoading(false);
    }
  };

  /** GET /api/general-ledger-reports/export — the same ledger as a file. */
  const handleExport = async () => {
    setError("");

    const params = buildParams();

    if (!params) return;

    const format = apiFormat(reportType);

    if (!format) {
      setError("Please select a Report Type.");
      return;
    }

    params.append("Format", format);

    try {
      setGenerating(true);

      await downloadReport(
        `${LEDGER_PATH}/export`,
        params,
        reportType,
        "general-ledger",
        "general ledger"
      );
    } catch (err) {
      console.error("GENERAL LEDGER EXPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the general ledger report."
      );
    } finally {
      setGenerating(false);
    }
  };

  const busy = loading || generating;
  const outputLabel = formatLabel(reportType);
  const hasRows = report?.accounts.some((account) => account.rows.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card" style={{ maxWidth: "100%" }}>
        <form onSubmit={handleView} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Head Office */}
          <div className="form-group">
            <label htmlFor="headOffice" className="form-label">
              Head Office
            </label>
            <select
              id="headOffice"
              value={headOffice?.officeCode ?? ""}
              onChange={() => {}}
              disabled
              className="form-select bg-disabled"
            >
              <option value="">
                {officesLoading
                  ? "Loading offices..."
                  : officesError
                    ? "Offices could not be loaded"
                    : "No head office found"}
              </option>
              {headOffice && (
                <option value={headOffice.officeCode}>
                  {officeLabel(headOffice)}
                </option>
              )}
            </select>
            {officesError && (
              <span style={{ fontSize: "12px", color: "#b91c1c" }}>
                {officesError}
              </span>
            )}
          </div>

          {/* Zone Office */}
          <div className="form-group">
            <label htmlFor="zoneOffice" className="form-label">
              Zone Office
            </label>
            <select
              id="zoneOffice"
              value={zoneCode}
              onChange={(e) => {
                setZoneCode(e.target.value);
                setAreaCode("");
                setOfficeCode("");
              }}
              className="form-select"
              disabled={officesLoading}
            >
              <option value="">All Zones</option>
              {zoneOptions.map((zone) => (
                <option key={zone.officeId} value={zone.officeCode}>
                  {officeLabel(zone)}
                </option>
              ))}
            </select>
          </div>

          {/* Area Office */}
          <div className="form-group">
            <label htmlFor="areaOffice" className="form-label">
              Area Office
            </label>
            <select
              id="areaOffice"
              value={areaCode}
              onChange={(e) => {
                setAreaCode(e.target.value);
                setOfficeCode("");
              }}
              className="form-select"
              disabled={!zoneCode}
            >
              <option value="">
                {zoneCode ? "All Areas" : "Select a Zone Office first"}
              </option>
              {areaOptions.map((area) => (
                <option key={area.officeId} value={area.officeCode}>
                  {officeLabel(area)}
                </option>
              ))}
            </select>
          </div>

          {/* Office */}
          <div className="form-group">
            <label htmlFor="office" className="form-label">
              Office
            </label>
            <select
              id="office"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
              className="form-select"
              disabled={!areaCode}
            >
              <option value="">
                {areaCode ? "All Offices" : "Select an Area Office first"}
              </option>
              {officeOptions.map((branch) => (
                <option key={branch.officeId} value={branch.officeCode}>
                  {officeLabel(branch)}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="form-group">
            <label htmlFor="dateFrom" className="form-label">
              Date From
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
                style={{ paddingRight: "36px" }}
              />
              <button
                type="button"
                onClick={() => fromPickerRef.current?.showPicker()}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  zIndex: 10,
                  width: "20px",
                  height: "20px",
                }}
              >
                <Calendar size={16} />
              </button>
              <input
                type="date"
                ref={fromPickerRef}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 0,
                  height: 0,
                  opacity: 0,
                  border: "none",
                  padding: 0,
                  pointerEvents: "none",
                }}
                onChange={(e) => {
                  if (e.target.value) setDateFrom(formatDateString(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="form-group">
            <label htmlFor="dateTo" className="form-label">
              Date To
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input"
                style={{ paddingRight: "36px" }}
              />
              <button
                type="button"
                onClick={() => toPickerRef.current?.showPicker()}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  zIndex: 10,
                  width: "20px",
                  height: "20px",
                }}
              >
                <Calendar size={16} />
              </button>
              <input
                type="date"
                ref={toPickerRef}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 0,
                  height: 0,
                  opacity: 0,
                  border: "none",
                  padding: 0,
                  pointerEvents: "none",
                }}
                onChange={(e) => {
                  if (e.target.value) setDateTo(formatDateString(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Acc Level */}
          <div className="form-group">
            <label htmlFor="accLevel" className="form-label">
              Acc Level
            </label>
            <select
              id="accLevel"
              value={accLevel}
              onChange={(e) => {
                setAccLevel(e.target.value);
                setAccountCode("");
              }}
              className="form-select"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Account Code */}
          <div className="form-group">
            <label htmlFor="accountCode" className="form-label">
              Account Code
            </label>
            <select
              id="accountCode"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              className="form-select"
              disabled={accountsLoading}
            >
              <option value="">{accountCodePlaceholder}</option>
              {accountCodeOptions.map((account) => (
                <option key={account.id} value={account.newCode}>
                  {account.newCode} - {account.accountHead}
                </option>
              ))}
            </select>
            {accountsError && (
              <span style={{ fontSize: "12px", color: "#b91c1c" }}>
                {accountsError}
              </span>
            )}
          </div>

          {/* Report Type */}
          <div className="form-group">
            <label htmlFor="reportType" className="form-label">
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select"
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "4px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-actions" style={{ gap: "12px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
              disabled={busy}
            >
              {loading ? "Loading..." : "View"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
              disabled={busy}
            >
              {generating ? `Generating ${outputLabel}...` : "Export"}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {report && (
        <div className="card" style={{ maxWidth: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
              {report.companyName}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
              {report.officeName}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
              {report.reportTitle}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
              Date From {formatApiDate(report.dateFrom)} To{" "}
              {formatApiDate(report.dateTo)}
            </p>
          </div>

          {hasRows ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>VoucherNo</th>
                    <th>Descripton</th>
                    <th style={amountCell}>Debit</th>
                    <th style={amountCell}>Credit</th>
                    <th style={amountCell}>Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {report.accounts.map((account) => (
                    <React.Fragment key={account.accCode}>
                      <tr>
                        <td colSpan={COLUMN_COUNT} style={{ fontWeight: 600 }}>
                          {account.accCode}
                          {account.accName ? `  ${account.accName}` : ""}
                        </td>
                      </tr>

                      <tr>
                        <td />
                        <td />
                        <td>Opening</td>
                        <td style={amountCell}>
                          {formatAmount(account.openingDebit)}
                        </td>
                        <td style={amountCell}>
                          {formatAmount(account.openingCredit)}
                        </td>
                        <td style={amountCell}>
                          {formatAmount(account.openingBalance)}
                        </td>
                      </tr>

                      {account.rows.map((row, index) => (
                        <tr key={`${account.accCode}-${index}`}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {formatApiDate(row.trxDate)}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {row.voucherNo}
                          </td>
                          <td>{row.descripton}</td>
                          <td style={amountCell}>{formatAmount(row.debit)}</td>
                          <td style={amountCell}>{formatAmount(row.credit)}</td>
                          <td style={amountCell}>{formatAmount(row.balance)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* The report totals the debit and credit columns and
                      leaves Balance empty — a sum of running balances
                      would not mean anything. */}
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={2} />
                    <td style={{ textAlign: "center" }}>Total</td>
                    <td style={amountCell}>{formatAmount(report.totalDebit)}</td>
                    <td style={amountCell}>
                      {formatAmount(report.totalCredit)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              No general ledger entries found for the selected criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
