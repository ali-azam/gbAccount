"use client";

/**
 * Reports ▸ Office Trial Balance — the legacy AccTrialBalance/IndexByOffice
 * screen.
 *
 * The same accounts as Trial Balance, but broken out into a block per
 * office rather than consolidated, so a zone's branches can be compared
 * against one another in a single report.
 *
 * The form is deliberately the four fields the legacy screen has — one
 * office, a date range and an account level. Trial Balance is the screen
 * that filters down the office hierarchy and carries the Except and
 * Report View options; this one names its office outright. The table, the
 * column arithmetic and the fetching are shared with it.
 */

import React, { useMemo, useState } from "react";

import DateField from "./DateField";
import TrialBalanceTable from "./TrialBalanceTable";
import { today } from "@/lib/reportDates";
import { officeLabel, useOffices } from "@/lib/useOffices";
import {
  REPORT_TYPES,
  apiFormat,
  formatAmount,
  formatLabel,
} from "@/lib/trialBalanceExport";
import {
  appendDateRange,
  useTrialBalanceReport,
} from "@/lib/useTrialBalanceReport";

/** Matches the heading the PDF and Excel exports print. */
const REPORT_TITLE = "Account Head-wise Trial Balance";

const ACC_LEVELS = ["1", "2", "3", "4", "5"];

export default function TrialBalanceReportOffice() {
  const {
    offices,
    loading: officesLoading,
    error: officesError,
  } = useOffices();

  const [officeId, setOfficeId] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [accLevel, setAccLevel] = useState("3");
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
  } = useTrialBalanceReport("office");

  /**
   * One flat list, the way the legacy screen shows it. Sorting by level
   * puts the head office first — which reports the whole organisation, as
   * the API includes everything beneath whichever office is named — then
   * the zones, the areas and the branches.
   */
  const officeOptions = useMemo(
    () =>
      [...offices].sort(
        (a, b) =>
          a.officeLevel - b.officeLevel ||
          a.officeCode.localeCompare(b.officeCode)
      ),
    [offices]
  );

  const selectedOffice = useMemo(
    () =>
      officeOptions.find((office) => String(office.officeId) === officeId) ??
      officeOptions[0] ??
      null,
    [officeOptions, officeId]
  );

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

    // The legacy screen has no Report View, so it always lists the
    // accounts themselves rather than rolling them up to their head.
    params.append("DetailLevel", "Detail");

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
      detail: true,
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
          {/* Office */}
          <div className="form-group">
            <label htmlFor="office" className="form-label">
              Office
            </label>
            <select
              id="office"
              value={selectedOffice ? String(selectedOffice.officeId) : ""}
              onChange={(e) => setOfficeId(e.target.value)}
              className="form-select"
              disabled={officesLoading || officeOptions.length === 0}
            >
              {officeOptions.length === 0 && (
                <option value="">
                  {officesLoading
                    ? "Loading offices..."
                    : officesError
                      ? "Offices could not be loaded"
                      : "No offices found"}
                </option>
              )}
              {officeOptions.map((office) => (
                <option key={office.officeId} value={office.officeId}>
                  {officeLabel(office)}
                </option>
              ))}
            </select>
            {officesError && (
              <span style={{ fontSize: "12px", color: "#b91c1c" }}>
                {officesError}
              </span>
            )}
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
              Acc Level {heading.accLevel}
            </p>
          </div>

          {report.rows.length > 0 ? (
            <>
              {/* The form keeps to the four fields the legacy screen has,
                  so the file formats live with the report they export. */}
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
