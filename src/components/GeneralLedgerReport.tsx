"use client";

import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";

interface GeneralLedgerRow {
  accountCode: string;
  accountHead: string;
  debit: number;
  credit: number;
  balance: number;
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

const today = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function GeneralLedgerReport() {
  const [headOffice] = useState("0001 BURO Bangladesh");
  const [zoneOffice, setZoneOffice] = useState("Z001 Tangail Zone");
  const [areaOffice, setAreaOffice] = useState("A001 Tangail Area");
  const [office, setOffice] = useState("0003 Local Branch");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [accLevel, setAccLevel] = useState("1");
  const [accountCode, setAccountCode] = useState("");
  const [results, setResults] = useState<GeneralLedgerRow[] | null>(null);

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  const handleView = (e: React.FormEvent) => {
    e.preventDefault();
    // No ledger data source wired yet — show the empty state.
    setResults([]);
  };

  const handleExport = () => {
    // Export target not defined yet.
  };

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
              value={headOffice}
              onChange={() => {}}
              disabled
              className="form-select bg-disabled"
            >
              <option value="0001 BURO Bangladesh">0001 BURO Bangladesh</option>
            </select>
          </div>

          {/* Zone Office */}
          <div className="form-group">
            <label htmlFor="zoneOffice" className="form-label">
              Zone Office
            </label>
            <select
              id="zoneOffice"
              value={zoneOffice}
              onChange={(e) => setZoneOffice(e.target.value)}
              className="form-select"
            >
              <option value="Z001 Tangail Zone">Z001 Tangail Zone</option>
            </select>
          </div>

          {/* Area Office */}
          <div className="form-group">
            <label htmlFor="areaOffice" className="form-label">
              Area Office
            </label>
            <select
              id="areaOffice"
              value={areaOffice}
              onChange={(e) => setAreaOffice(e.target.value)}
              className="form-select"
            >
              <option value="A001 Tangail Area">A001 Tangail Area</option>
            </select>
          </div>

          {/* Office */}
          <div className="form-group">
            <label htmlFor="office" className="form-label">
              Office
            </label>
            <select
              id="office"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="form-select"
            >
              <option value="0003 Local Branch">0003 Local Branch</option>
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
              onChange={(e) => setAccLevel(e.target.value)}
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
            >
              <option value="">Select None</option>
              <option value="pro&asset">1 - Property & Assets</option>
              <option value="fund&liabi">3 - Fund & Liabilities</option>
              <option value="expenditure">5 - Expenditure</option>
              <option value="income">9 - Income</option>
            </select>
          </div>

          <div className="form-actions" style={{ gap: "12px" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              View
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
            >
              Export
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="card" style={{ maxWidth: "100%" }}>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            No general ledger entries found for the selected criteria.
          </p>
        </div>
      )}
    </div>
  );
}
