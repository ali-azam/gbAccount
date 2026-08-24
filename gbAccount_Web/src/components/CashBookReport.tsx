"use client";

import React, { useMemo, useState } from "react";

import DateField from "./DateField";
import { today } from "@/lib/reportDates";
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
  formatApiDate,
  formatLabel,
  toApiDate,
} from "@/lib/reportFile";

/** One cash or bank movement, as returned by /api/cash-book-reports. */
interface CashBookRow {
  voucherNo: string;
  accountName: string;
  description: string;
  cashReceipt: number;
  cashPayment: number;
  bankReceipt: number;
  bankPayment: number;
}

interface CashBookReportData {
  companyName: string;
  companyAddress: string;
  reportTitle: string;
  officeName: string;
  dateFrom: string;
  dateTo: string;
  openingCash: number;
  openingBank: number;
  rows: CashBookRow[];
  totalCashReceipt: number;
  totalCashPayment: number;
  totalBankReceipt: number;
  totalBankPayment: number;
  closingCash: number;
  closingBank: number;
}

const CASH_BOOK_PATH = "/api/cash-book-reports";

const ACC_LEVELS = ["1", "2", "3", "4", "5"];

const COLUMN_COUNT = 7;

/**
 * The Cash Book is the one report here that groups thousands — "19,677.00"
 * — so it cannot use the shared formatAmount. Negatives are wrapped in
 * parentheses, the way the printed report shows them.
 */
const formatAmount = (value: number) => {
  const text = Math.abs(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (value ?? 0) < 0 ? `(${text})` : text;
};

/** Right-aligned cell style for the amount columns. */
const amountCell: React.CSSProperties = {
  textAlign: "right",
  whiteSpace: "nowrap",
};

/**
 * An Opening or Closing Balance figure sits across a Receipt/Payment pair,
 * because it is neither one.
 */
const balanceCell: React.CSSProperties = {
  textAlign: "center",
  whiteSpace: "nowrap",
  fontWeight: 600,
};

export default function CashBookReport() {
  const { offices, loading: officesLoading, error: officesError } = useOffices();

  const [zoneCode, setZoneCode] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [accLevel, setAccLevel] = useState("3");
  const [reportType, setReportType] = useState("pdf");
  const [report, setReport] = useState<CashBookReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

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

    // Acc Level decides which ancestor account each movement is listed
    // under, the same way it does on the other report screens.
    params.append("AccLevel", accLevel);

    return params;
  };

  /** GET /api/cash-book-reports — the cash book on screen. */
  const handleView = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const params = buildParams();

    if (!params) return;

    try {
      setLoading(true);

      setReport(
        await fetchReport<CashBookReportData>(
          CASH_BOOK_PATH,
          params,
          "cash book"
        )
      );
    } catch (err) {
      console.error("CASH BOOK ERROR:", err);

      setReport(null);
      setError(
        err instanceof Error ? err.message : "Unable to load the cash book."
      );
    } finally {
      setLoading(false);
    }
  };

  /** GET /api/cash-book-reports/export — the same cash book as a file. */
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
        `${CASH_BOOK_PATH}/export`,
        params,
        reportType,
        "cash-book",
        "cash book"
      );
    } catch (err) {
      console.error("CASH BOOK EXPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the cash book report."
      );
    } finally {
      setGenerating(false);
    }
  };

  const busy = loading || generating;
  const outputLabel = formatLabel(reportType);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card" style={{ maxWidth: "100%" }}>
        <form
          onSubmit={handleView}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
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

          <DateField
            id="dateFrom"
            label="Date From"
            value={dateFrom}
            onChange={setDateFrom}
          />

          <DateField
            id="dateTo"
            label="Date To"
            value={dateTo}
            onChange={setDateTo}
          />

          {/* Acc Level */}
          <div className="form-group">
            <label htmlFor="accLevel" className="form-label">
              Acc Level
            </label>
            <select
              id="accLevel"
              value={accLevel}
              onChange={(e) => setAccLevel(e.target.value)}
              className="form-select"
            >
              {ACC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
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

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
              disabled={busy}
            >
              {loading ? "Loading..." : "View"}
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
            {report.companyAddress && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {report.companyAddress}
              </p>
            )}
            <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: 700 }}>
              {report.reportTitle}
            </p>
            {/* The printed report heads the cash book with the closing cash
                position, so the screen does too. */}
            <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 700 }}>
              Cash In Hand: {formatAmount(report.closingCash)}
            </p>
            <p
              style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}
            >
              {report.officeName}
            </p>
            <p
              style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}
            >
              Date: From {formatApiDate(report.dateFrom)} To{" "}
              {formatApiDate(report.dateTo)}
            </p>
          </div>

          {/* The form keeps to the eight fields the legacy screen has, so
              the file formats live with the report they export. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <select
              aria-label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select"
              style={{ width: "auto" }}
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-primary"
              style={{ padding: "8px 20px", whiteSpace: "nowrap" }}
              disabled={busy}
            >
              {generating ? `Generating ${outputLabel}...` : "Export"}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              {/* Cash and Bank each head a Receipt/Payment pair, so the
                  headings take two rows the way the printed report's do. */}
              <thead>
                <tr>
                  <th rowSpan={2}>Voucher No</th>
                  <th rowSpan={2}>Account Name</th>
                  <th rowSpan={2}>Description</th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    Cash
                  </th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    Bank
                  </th>
                </tr>
                <tr>
                  <th style={amountCell}>Receipt</th>
                  <th style={amountCell}>Payment</th>
                  <th style={amountCell}>Receipt</th>
                  <th style={amountCell}>Payment</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={2} />
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    Opening Balance
                  </td>
                  <td colSpan={2} style={balanceCell}>
                    {formatAmount(report.openingCash)}
                  </td>
                  <td colSpan={2} style={balanceCell}>
                    {formatAmount(report.openingBank)}
                  </td>
                </tr>

                {report.rows.length > 0 ? (
                  report.rows.map((row, index) => (
                    <tr key={`${row.voucherNo}-${index}`}>
                      <td style={{ whiteSpace: "nowrap" }}>{row.voucherNo}</td>
                      <td>{row.accountName}</td>
                      <td>{row.description}</td>
                      <td style={amountCell}>{formatAmount(row.cashReceipt)}</td>
                      <td style={amountCell}>{formatAmount(row.cashPayment)}</td>
                      <td style={amountCell}>{formatAmount(row.bankReceipt)}</td>
                      <td style={amountCell}>{formatAmount(row.bankPayment)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={COLUMN_COUNT}
                      style={{ color: "#64748b", fontSize: "13px" }}
                    >
                      No cash or bank entries were posted in this date range
                      for the selected office.
                    </td>
                  </tr>
                )}

                <tr style={{ fontWeight: 700 }}>
                  <td colSpan={2} />
                  <td style={{ textAlign: "right" }}>Sum of Transaction</td>
                  <td style={amountCell}>
                    {formatAmount(report.totalCashReceipt)}
                  </td>
                  <td style={amountCell}>
                    {formatAmount(report.totalCashPayment)}
                  </td>
                  <td style={amountCell}>
                    {formatAmount(report.totalBankReceipt)}
                  </td>
                  <td style={amountCell}>
                    {formatAmount(report.totalBankPayment)}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} />
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    Closing Balance
                  </td>
                  <td colSpan={2} style={balanceCell}>
                    {formatAmount(report.closingCash)}
                  </td>
                  <td colSpan={2} style={balanceCell}>
                    {formatAmount(report.closingBank)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
