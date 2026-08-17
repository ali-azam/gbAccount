"use client";

import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";
import { VoucherData } from "./VoucherForm";

interface VoucherReportProps {
  vouchers: VoucherData[];
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

const today = () => formatDateString(new Date().toISOString().split("T")[0]);

export default function VoucherReport({ vouchers }: VoucherReportProps) {
  const [trxDate, setTrxDate] = useState(today);
  const [trxDateTo, setTrxDateTo] = useState(today);
  const [voucherType, setVoucherType] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [viewAll, setViewAll] = useState(false);
  const [results, setResults] = useState<VoucherData[] | null>(null);

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  // Voucher numbers available for the currently selected type
  const voucherNumbers = Array.from(
    new Set(
      vouchers
        .filter((v) => !voucherType || v.voucherType === voucherType)
        .map((v) => v.autoVoucher)
        .filter((n): n is string => Boolean(n))
    )
  );

  const handleView = (e: React.FormEvent) => {
    e.preventDefault();

    if (viewAll) {
      setResults(vouchers);
      return;
    }

    setResults(
      vouchers.filter((v) => {
        if (voucherType && v.voucherType !== voucherType) return false;
        if (voucherNo && v.autoVoucher !== voucherNo) return false;
        return true;
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card" style={{ maxWidth: "100%" }}>
        <form onSubmit={handleView} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* TrxDate */}
          <div className="form-group">
            <label htmlFor="trxDate" className="form-label">
              TrxDate
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                id="trxDate"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                disabled={viewAll}
                className="form-input"
                style={{ paddingRight: "36px" }}
              />
              <button
                type="button"
                onClick={() => fromPickerRef.current?.showPicker()}
                disabled={viewAll}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: viewAll ? "default" : "pointer",
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
                  if (e.target.value) setTrxDate(formatDateString(e.target.value));
                }}
              />
            </div>
          </div>

          {/* TrxDateTo */}
          <div className="form-group">
            <label htmlFor="trxDateTo" className="form-label">
              TrxDateTo
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                id="trxDateTo"
                value={trxDateTo}
                onChange={(e) => setTrxDateTo(e.target.value)}
                disabled={viewAll}
                className="form-input"
                style={{ paddingRight: "36px" }}
              />
              <button
                type="button"
                onClick={() => toPickerRef.current?.showPicker()}
                disabled={viewAll}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: viewAll ? "default" : "pointer",
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
                  if (e.target.value) setTrxDateTo(formatDateString(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Voucher Type */}
          <div className="form-group">
            <label htmlFor="voucherType" className="form-label">
              Voucher Type
            </label>
            <select
              id="voucherType"
              value={voucherType}
              onChange={(e) => {
                setVoucherType(e.target.value);
                setVoucherNo("");
              }}
              disabled={viewAll}
              className="form-select"
            >
              <option value="">Please Select</option>
              <option value="CDebit">Cash(Debit)</option>
              <option value="Credit">Cash(Credit)</option>
              <option value="BDebit">Bank(Debit)</option>
              <option value="BCredit">Bank(Credit)</option>
              <option value="BCash">Bank(Cash)</option>
              <option value="BtoB">BankToBank</option>
              <option value="Journal">Journal</option>
            </select>
          </div>

          {/* Voucher No */}
          <div className="form-group">
            <label htmlFor="voucherNo" className="form-label">
              Voucher No
            </label>
            <select
              id="voucherNo"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              disabled={viewAll}
              className="form-select"
            >
              <option value=""></option>
              {voucherNumbers.map((no) => (
                <option key={no} value={no}>
                  {no}
                </option>
              ))}
            </select>
          </div>

          {/* View All Voucher */}
          <label className="form-checkbox-container" style={{ marginTop: "8px" }}>
            <input
              type="checkbox"
              checked={viewAll}
              onChange={(e) => setViewAll(e.target.checked)}
              className="form-checkbox"
            />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              View All Voucher
            </span>
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              View
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="card" style={{ maxWidth: "100%" }}>
          {results.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b" }}>No vouchers found for the selected criteria.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Voucher No</th>
                    <th>Trx Date</th>
                    <th>Type</th>
                    <th>Account</th>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Debit</th>
                    <th style={{ textAlign: "right" }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((v, i) => (
                    <tr key={v.id}>
                      <td>{i + 1}</td>
                      <td>{v.autoVoucher || "-"}</td>
                      <td>{v.trxDate}</td>
                      <td>{v.voucherType}</td>
                      <td>{v.account}</td>
                      <td>{v.description}</td>
                      <td style={{ textAlign: "right" }}>{v.debit.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>{v.credit.toFixed(2)}</td>
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
