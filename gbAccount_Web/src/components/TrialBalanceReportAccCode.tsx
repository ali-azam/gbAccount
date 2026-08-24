"use client";

import React, { useMemo, useState, useRef } from "react";
import { Calendar } from "lucide-react";
import { useAccounts } from "@/lib/useAccounts";
import { accountsAtLevel } from "@/lib/reportAccounts";
import {
  REPORT_TYPES,
  apiFormat,
  downloadTrialBalance,
  formatLabel,
  toApiDate,
  type TrialBalanceEndpoint,
} from "@/lib/trialBalanceExport";

const formatDateString = (rawDate: string) => {
  if (!rawDate) return "";
  const parts = rawDate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day.padStart(2, "0")}-${months[monthIndex]}-${year}`;
    }
  }
  return rawDate;
};

type ViewMode = "office" | "account-code";

const ENDPOINTS: Record<ViewMode, TrialBalanceEndpoint> = {
  office: "office-wise",
  "account-code": "acc-code-wise",
};

export default function TrialBalanceReportWithAccCode() {
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();

  const [accLevel, setAccLevel] = useState("3");
  const [accountCode, setAccountCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("pdf");
  const [generating, setGenerating] = useState<ViewMode | null>(null);
  const [error, setError] = useState("");

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  // Account Code options are filtered to the currently selected Account Level,
  // matching the cascading behaviour of the Chart of Accounts.
  const accountCodeOptions = useMemo(
    () => accountsAtLevel(accounts, accLevel),
    [accounts, accLevel]
  );

  // An empty list is either still loading, a failed load, or a level that
  // genuinely holds no accounts — say which, rather than showing a bare
  // "Please Select" that looks like the filter is broken.
  const accountCodePlaceholder = accountsLoading
    ? "Loading accounts..."
    : accountsError
      ? "Accounts could not be loaded"
      : accountCodeOptions.length === 0
        ? `No accounts at level ${accLevel}`
        : "Please Select";

  /**
   * Calls
   *
   * GET /api/trial-balance-reports/{office-wise|acc-code-wise}/export
   *
   * and hands the result to the browser: a PDF opens in a new tab, an
   * Excel workbook downloads.
   */
  const runReport = (mode: ViewMode) => async () => {
    setError("");

    const apiDateTo = toApiDate(dateTo);

    if (!apiDateTo) {
      setError("Please select a valid Date To.");
      return;
    }

    // Date From is optional; the API falls back to the latest snapshot
    // on or before Date To.
    const apiDateFrom = toApiDate(dateFrom);

    if (dateFrom && !apiDateFrom) {
      setError("Date From is not a valid date.");
      return;
    }

    if (apiDateFrom && apiDateFrom > apiDateTo) {
      setError("Date From cannot be greater than Date To.");
      return;
    }

    const format = apiFormat(reportType);

    if (!format) {
      setError("Please select a Report Type.");
      return;
    }

    const params = new URLSearchParams();

    if (apiDateFrom) {
      params.append("DateFrom", apiDateFrom);
    }

    params.append("DateTo", apiDateTo);

    if (accountCode) {
      params.append("AccCode", accountCode);
    }

    params.append("Format", format);

    // Account Level is intentionally not sent. In OLRSTrailBalance the
    // acc_level column records the level the whole snapshot was rolled
    // up to, not the depth of an individual account, so sending it as a
    // row filter would empty the report. Here the dropdown drives the
    // Account Code list.

    try {
      setGenerating(mode);

      await downloadTrialBalance(ENDPOINTS[mode], params, reportType);
    } catch (err) {
      console.error("TRIAL BALANCE EXPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the trial balance report."
      );
    } finally {
      setGenerating(null);
    }
  };

  const busy = generating !== null;
  const outputLabel = formatLabel(reportType);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card" style={{ maxWidth: "560px" }}>
        <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Account Level */}
          <div className="form-group">
            <label htmlFor="accLevel" className="form-label">
              Account Level
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
              {accountCodeOptions.map((a) => (
                <option key={a.id} value={a.newCode}>
                  {a.newCode} - {a.accountHead}
                </option>
              ))}
            </select>
            {accountsError && (
              <span style={{ fontSize: "12px", color: "#b91c1c" }}>
                {accountsError}
              </span>
            )}
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

          {/* Action Buttons - full width, stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
            <button
              type="button"
              onClick={runReport("office")}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px 20px" }}
              disabled={busy}
            >
              {generating === "office"
                ? `Generating ${outputLabel}...`
                : "View Office Wise"}
            </button>
            <button
              type="button"
              onClick={runReport("account-code")}
              className="btn btn-success"
              style={{ width: "100%", padding: "10px 20px" }}
              disabled={busy}
            >
              {generating === "account-code"
                ? `Generating ${outputLabel}...`
                : "View Account Code Wise"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
