"use client";

import React, { useMemo, useState, useRef } from "react";
import { Calendar } from "lucide-react";
import { useAccounts } from "@/lib/useAccounts";

interface TrialBalanceRow {
  accountCode: string;
  accountHead: string;
  debit: number;
  credit: number;
}

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

const REPORT_TYPES = [
  { value: "detail", label: "Detail" },
  { value: "summary", label: "Summary" },
];

type ViewMode = "office" | "account-code" | null;

export default function TrialBalanceReportWithAccCode() {
  const { accounts, loading: accountsLoading } = useAccounts();

  const [accLevel, setAccLevel] = useState("3");
  const [accountCode, setAccountCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [results, setResults] = useState<TrialBalanceRow[] | null>(null);

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  // Account Code options are filtered to the currently selected Account Level,
  // matching the cascading behaviour of the Chart of Accounts.
  const accountCodeOptions = useMemo(
    () => accounts.filter((a) => String(a.level) === accLevel),
    [accounts, accLevel]
  );

  // const runReport = (mode: ViewMode) => () => {
  //   setViewMode(mode);
  //   // No trial balance data source wired yet
  //   setResults([]);
  // };
  const runReport = (mode: ViewMode) => () => {
  setViewMode(mode);

  const hardCodedResults: TrialBalanceRow[] = [
    {
      accountCode: "1001",
      accountHead: "Cash",
      debit: 25000,
      credit: 0,
    },
    {
      accountCode: "1002",
      accountHead: "Bank Account",
      debit: 50000,
      credit: 0,
    },
    {
      accountCode: "2001",
      accountHead: "Accounts Payable",
      debit: 0,
      credit: 30000,
    },
    {
      accountCode: "3001",
      accountHead: "Capital",
      debit: 0,
      credit: 45000,
    },
    {
      accountCode: "4001",
      accountHead: "Sales Revenue",
      debit: 0,
      credit: 40000,
    },
    {
      accountCode: "5001",
      accountHead: "Office Expenses",
      debit: 15000,
      credit: 0,
    },
  ];

  setResults(hardCodedResults);
};

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
              <option value="">Please Select</option>
              {accountCodeOptions.map((a) => (
                <option key={a.id} value={a.newCode}>
                  {a.newCode} - {a.accountHead}
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
              <option value="">-- Select --</option>
              {REPORT_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons - full width, stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
            <button
              type="button"
              onClick={runReport("office")}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px 20px" }}
            >
              View Office Wise
            </button>
            <button
              type="button"
              onClick={runReport("account-code")}
              className="btn btn-success"
              style={{ width: "100%", padding: "10px 20px" }}
            >
              View Account Code Wise
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="card" style={{ maxWidth: "100%" }}>
          {results.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              No trial balance entries found for the selected criteria
              {viewMode === "office" ? " (Office Wise)" : viewMode === "account-code" ? " (Account Code Wise)" : ""}.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Head</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row.accountCode}>
                      <td>{row.accountCode}</td>
                      <td>{row.accountHead}</td>
                      <td>TEST DEBIT</td>
                      <td>TEST CREDIT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
