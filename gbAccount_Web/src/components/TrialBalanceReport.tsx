"use client";

/**
 * Reports ▸ Trial Balance — the legacy AccTrialBalance/Index screen.
 *
 * The accounts consolidated across whichever offices are in scope, built
 * from the vouchers so any date range and any office in the hierarchy can
 * be asked for.
 *
 * This is the screen that filters down the office hierarchy. Office Trial
 * Balance names a single office instead and shows the same figures broken
 * out office by office; the table, the column arithmetic and the fetching
 * are shared with it.
 */

import React, { useMemo, useState } from "react";

import DateField from "./DateField";
import TrialBalanceTable from "./TrialBalanceTable";
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
  formatAmount,
  formatLabel,
} from "@/lib/trialBalanceExport";
import { REPORT_VIEWS } from "@/lib/trialBalance";
import {
  appendDateRange,
  useTrialBalanceReport,
} from "@/lib/useTrialBalanceReport";

/** Matches the heading the PDF and Excel exports print. */
const REPORT_TITLE = "Account Head-wise Trial Balance";

const ACC_LEVELS = ["1", "2", "3", "4", "5"];

export default function TrialBalanceReport() {
  const {
    offices,
    loading: officesLoading,
    error: officesError,
  } = useOffices();

  const [zoneCode, setZoneCode] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [accLevel, setAccLevel] = useState("3");
  const [exceptHeadOffice, setExceptHeadOffice] = useState(false);
  const [exceptProjectOffice, setExceptProjectOffice] = useState(false);
  const [reportView, setReportView] = useState("Detail");
  const [reportType, setReportType] = useState("pdf");

  const {
    report,
    heading,
    sections,
    loading,
    generating,
    busy,
    error,
    setError,
    view,
    exportFile,
  } = useTrialBalanceReport("account-code");

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
   * The query string, or null when the form is not filled in well enough
   * to send. The message goes on screen.
   */
  const buildParams = (): URLSearchParams | null => {
    const params = new URLSearchParams();
    const dateError = appendDateRange(params, dateFrom, dateTo);

    if (dateError) {
      setError(dateError);
      return null;
    }

    if (selectedOffice) {
      params.append("OfficeId", String(selectedOffice.officeId));
    }

    // Everything before Date From makes up the opening balance and
    // everything within the range the movement, so Acc Level decides which
    // account the postings are gathered under rather than filtering them.
    params.append("AccLevel", accLevel);
    params.append("ExceptHeadOffice", String(exceptHeadOffice));
    params.append("ExceptProjectOffice", String(exceptProjectOffice));
    params.append("DetailLevel", reportView);

    return params;
  };

  const handleView = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const params = buildParams();

    if (!params) return;

    view(params, {
      officeName: selectedOffice ? officeLabel(selectedOffice) : "All Offices",
      dateFrom,
      dateTo,
      accLevel,
      detail: reportView === "Detail",
    });
  };

  const handleExport = () => {
    setError("");

    const params = buildParams();

    if (!params) return;

    const format = apiFormat(reportType);

    if (!format) {
      setError("Please select a Report Type.");
      return;
    }

    params.append("Format", format);

    exportFile(params, reportType);
  };

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

          {/* Except HeadOffice */}
          <div className="form-group">
            <label
              className="form-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: 0,
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={exceptHeadOffice}
                onChange={(e) => setExceptHeadOffice(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Except HeadOffice
            </label>
          </div>

          {/* Except ProjectOffice */}
          <div className="form-group">
            <label
              className="form-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: 0,
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={exceptProjectOffice}
                onChange={(e) => setExceptProjectOffice(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Except ProjectOffice
            </label>
          </div>

          {/* Report View */}
          <div className="form-group">
            <label htmlFor="reportView" className="form-label">
              Report View
            </label>
            <select
              id="reportView"
              value={reportView}
              onChange={(e) => setReportView(e.target.value)}
              className="form-select"
            >
              {REPORT_VIEWS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
      {report && heading && (
        <div className="card" style={{ maxWidth: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
              {REPORT_TITLE}
            </h2>
            <p
              style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}
            >
              {heading.officeName}
            </p>
            <p
              style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}
            >
              Date From {heading.dateFrom} To {heading.dateTo}
            </p>
            <p
              style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}
            >
              Acc Level {heading.accLevel} &middot;{" "}
              {heading.detail ? "Detail" : "Summary"}
            </p>
          </div>

          {report.rows.length > 0 ? (
            <>
              <TrialBalanceTable sections={sections} totals={report.totals} />

              {/* Worth saying out loud: a trial balance that does not
                  balance is the point of running one. */}
              {!report.totals.isBalanced && (
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#b45309",
                  }}
                >
                  Debit and credit closing totals differ by{" "}
                  {formatAmount(report.totals.balanceDifference)}.
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              No vouchers were posted in this date range for the selected
              office and Acc Level.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
