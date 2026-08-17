"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { VoucherData } from "./VoucherForm";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Calendar } from "lucide-react";

interface ReconcileVoucherProps {
  vouchers: VoucherData[];
  onUpdateVouchers: (updatedVouchers: VoucherData[]) => void;
  onDeleteVoucher: (id: string) => void;
}

type SortField =
  | "voucherNo"
  | "trxDate"
  | "transactionType"
  | "description"
  | "reference"
  | "debit"
  | "credit"
  | "autoVoucher"
  | "received";

export default function ReconcileVoucher({
  vouchers,
  onUpdateVouchers,
  onDeleteVoucher,
}: ReconcileVoucherProps) {
  // Search Form State
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterBy, setFilterBy] = useState("View All");
  const [filterText, setFilterText] = useState("");
  const [selectedZone, setSelectedZone] = useState("01 - Magura Zone");
  const [typePurpose, setTypePurpose] = useState("");
  const [typeVoucherType, setTypeVoucherType] = useState("");

  // Initialize Date From / To automatically based on the range of loaded vouchers
  useEffect(() => {
    if (vouchers.length > 0 && !dateFrom && !dateTo) {
      const dates = vouchers.map((v) => v.trxDate).filter(Boolean);
      if (dates.length > 0) {
        const minDate = dates.reduce((a, b) => (a < b ? a : b));
        const maxDate = dates.reduce((a, b) => (a > b ? a : b));
        setDateFrom(minDate);
        setDateTo(maxDate);
      }
    }
  }, [vouchers, dateFrom, dateTo]);

  // Table sorting & pagination
  const [sortField, setSortField] = useState<SortField>("voucherNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(20);

  // Temporary local state for checkboxes before clicking "Send"
  const [pendingReceived, setPendingReceived] = useState<Record<string, boolean>>({});

  // Custom modal notification state
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Custom delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  // Trigger search filters
  const handleSearch = () => {
    setPage(1);
  };

  // Trigger saving the checked received states
  const handleSend = () => {
    const updated = vouchers.map((v) => {
      if (v.id in pendingReceived) {
        return { ...v, received: pendingReceived[v.id] };
      }
      return v;
    });
    onUpdateVouchers(updated);
    setModalMessage("Voucher status updated successfully!");
    setShowModal(true);
    setPendingReceived({});
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setPendingReceived((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtered and sorted vouchers (Instantly reactive to inputs)
  const processedVouchers = useMemo(() => {
    let result = vouchers.map((v) => ({
      ...v,
      // If there's a pending change in checkbox state, use it. Otherwise use the saved status.
      isReceived: v.id in pendingReceived ? pendingReceived[v.id] : !!v.received,
    }));

    // Filter by Date From
    if (dateFrom) {
      result = result.filter((v) => v.trxDate >= dateFrom);
    }
    // Filter by Date To
    if (dateTo) {
      result = result.filter((v) => v.trxDate <= dateTo);
    }
    // Filter by 'Filter By' dropdown + text input
    if (filterBy !== "View All") {
      const isRec = filterBy === "Received";
      result = result.filter((v) => v.isReceived === isRec);
    }
    if (filterText) {
      const text = filterText.toLowerCase();
      result = result.filter(
        (v) =>
          v.voucherNo.toLowerCase().includes(text) ||
          v.description.toLowerCase().includes(text) ||
          (v.reference && v.reference.toLowerCase().includes(text))
      );
    }
    // Filter by Purpose
    if (typePurpose) {
      const purpose = typePurpose.toLowerCase();
      result = result.filter(
        (v) =>
          v.description.toLowerCase().includes(purpose) ||
          v.voucherType.toLowerCase().includes(purpose)
      );
    }
    // Filter by Voucher Type
    if (typeVoucherType) {
      const vtype = typeVoucherType.toLowerCase();
      result = result.filter((v) => v.voucherType.toLowerCase().includes(vtype));
    }
    // Filter by Selected Zone
    if (selectedZone) {
      const zoneCode = selectedZone.substring(0, 2);
      result = result.filter((v) => v.zoneCode === zoneCode);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField] ?? "";
      let bVal: any = b[sortField] ?? "";

      if (sortField === "received") {
        aVal = a.isReceived ? 1 : 0;
        bVal = b.isReceived ? 1 : 0;
      } else {
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vouchers, dateFrom, dateTo, filterBy, filterText, typePurpose, typeVoucherType, selectedZone, sortField, sortDirection, pendingReceived]);

  const totalPages = Math.max(1, Math.ceil(processedVouchers.length / rowCount));
  const paginatedVouchers = useMemo(() => {
    const startIndex = (page - 1) * rowCount;
    return processedVouchers.slice(startIndex, startIndex + rowCount);
  }, [processedVouchers, page, rowCount]);

  const columns: { field: SortField; label: string }[] = [
    { field: "voucherNo", label: "Voucher No" },
    { field: "trxDate", label: "Trx Date" },
    { field: "transactionType", label: "Type" },
    { field: "description", label: "Purpose" },
    { field: "description", label: "Description" },
    { field: "reference", label: "Reference" },
    { field: "debit", label: "Debit" },
    { field: "credit", label: "Credit" },
    { field: "autoVoucher", label: "Auto Voucher" },
  ];

  return (
    <div className="card">
      {/* Search Filters Section (High fidelity from screenshot) */}
      <div className="filter-panel">
        <div style={{ display: "grid", gridTemplateColumns: "38fr 31fr 31fr", gap: "16px 24px" }}>
          {/* Row 1: Date Row */}
          {/* Date From */}
          <div className="filter-group">
            <label className="form-label">Date From:</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Type Search Text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
                style={{ paddingRight: "32px" }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => dateFromRef.current?.showPicker()}
                style={{
                  position: "absolute",
                  right: "8px",
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
                  height: "20px"
                }}
              >
                <Calendar size={15} />
              </button>
              <input
                type="date"
                ref={dateFromRef}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 0,
                  height: 0,
                  opacity: 0,
                  border: "none",
                  padding: 0,
                  pointerEvents: "none"
                }}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="filter-group">
            <label className="form-label">Date To:</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                 type="text"
                 placeholder="Type Search Text"
                 value={dateTo}
                 onChange={(e) => setDateTo(e.target.value)}
                 className="form-input"
                 style={{ paddingRight: "32px" }}
                 autoComplete="off"
               />
              <button
                type="button"
                onClick={() => dateToRef.current?.showPicker()}
                style={{
                  position: "absolute",
                  right: "8px",
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
                  height: "20px"
                }}
              >
                <Calendar size={15} />
              </button>
              <input
                type="date"
                ref={dateToRef}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 0,
                  height: 0,
                  opacity: 0,
                  border: "none",
                  padding: 0,
                  pointerEvents: "none"
                }}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Column 3 (Empty) */}
          <div>&nbsp;</div>

          {/* Row 2: Filter By Row (Spans Column 1 and 2, left padded to align label under "From:") */}
          <div style={{ gridColumn: "1 / 3", display: "flex", alignItems: "center", gap: "12px", paddingLeft: "38px", marginTop: "4px" }}>
            <label className="form-label" style={{ margin: 0, fontWeight: "bold", whiteSpace: "nowrap" }}>
              Filter By:
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="form-select"
              style={{ width: "160px" }}
            >
              <option value="View All">View All</option>
              <option value="Received">Received</option>
              <option value="Not Received">Not Received</option>
            </select>
            <input
              type="text"
              placeholder="Type Search Text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="form-input"
              style={{ width: "260px" }}
            />
          </div>

          {/* Column 3 (Empty) */}
          <div>&nbsp;</div>

          {/* Horizontal separator line spanning across all columns */}
          <div style={{ gridColumn: "1 / -1", margin: "4px 0" }}>
            <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: 0 }} />
          </div>

          {/* Row 3: Zone / Purpose / VoucherType Row */}
          {/* Select Zone */}
          <div className="filter-group">
            <label className="form-label">Select Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="form-select"
            >
              <option value="01 - Magura Zone">01 - Magura Zone</option>
              <option value="02 - Dhaka Zone">02 - Dhaka Zone</option>
              <option value="03 - Chittagong Zone">03 - Chittagong Zone</option>
            </select>
          </div>

          {/* Type Purpose */}
          <div className="filter-group">
            <label className="form-label">Type Purpose:</label>
            <input
              type="text"
              placeholder="Type Search Text"
              value={typePurpose}
              onChange={(e) => setTypePurpose(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Type VoucherType */}
          <div className="filter-group">
            <label className="form-label">Type VoucherType:</label>
            <input
              type="text"
              placeholder="Type Search Text"
              value={typeVoucherType}
              onChange={(e) => setTypeVoucherType(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="filter-panel-footer" style={{ borderTop: "none", marginTop: "24px", padding: 0 }}>
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            Search
          </button>
          <button
            onClick={handleSend}
            className="btn btn-info"
          >
            Send
          </button>
        </div>
      </div>

      {/* Voucher List Section */}
      <div>
        {/* Empty Grey Bar to match screenshot exactly */}
        <div style={{ backgroundColor: "#eaeaea", border: "1px solid #dddddd", height: "36px", borderRadius: "4px", marginBottom: "16px" }}></div>

        {/* Voucher List Heading */}
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "16px 0 12px 4px" }}>Voucher List</h3>

        {/* Table Container */}
        <div className="table-wrapper" style={{ marginTop: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={`${col.field}-${index}`}
                    onClick={() => handleSort(col.field)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                      <span>{col.label}</span>
                      {sortField === col.field ? (
                        sortDirection === "asc" ? (
                          <ChevronUp size={12} style={{ color: "white" }} />
                        ) : (
                          <ChevronDown size={12} style={{ color: "white" }} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Delete Column Header */}
                <th className="text-center">
                  Delete
                </th>

                {/* SPECIAL RECEIVED COLUMN HEADER */}
                <th
                  onClick={() => handleSort("received")}
                  className="reconcile-header-received text-center"
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <span>Received</span>
                    {sortField === "received" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={12} style={{ color: "#1e293b" }} />
                      ) : (
                        <ChevronDown size={12} style={{ color: "#1e293b" }} />
                      )
                    ) : (
                      <ChevronsUpDown size={12} style={{ color: "rgba(30, 41, 59, 0.4)" }} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {paginatedVouchers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center" style={{ padding: "24px 0", color: "#64748b" }}>
                    No data available!
                  </td>
                </tr>
              ) : (
                paginatedVouchers.map((vch) => {
                  const currentVal = vch.isReceived;
                  return (
                    <tr key={vch.id}>
                      {/* Voucher No */}
                      <td className="font-mono-bold">
                        {vch.voucherNo}
                      </td>
                      {/* Trx Date */}
                      <td className="whitespace-nowrap">
                        {vch.trxDate}
                      </td>
                      {/* Type */}
                      <td className="text-center">
                        {vch.transactionType}
                      </td>
                      {/* Purpose */}
                      <td>
                        {vch.voucherType === "Debit" ? "Debit Voucher" : "Credit Voucher"}
                      </td>
                      {/* Description */}
                      <td>
                        {vch.description}
                      </td>
                      {/* Reference */}
                      <td style={{ color: "#64748b" }}>
                        {vch.reference || "-"}
                      </td>
                      {/* Debit */}
                      <td className="text-right" style={{ fontFamily: "monospace" }}>
                        {vch.debit > 0 ? vch.debit.toFixed(2) : "-"}
                      </td>
                      {/* Credit */}
                      <td className="text-right" style={{ fontFamily: "monospace" }}>
                        {vch.credit > 0 ? vch.credit.toFixed(2) : "-"}
                      </td>
                      {/* Auto Voucher */}
                      <td className="text-center" style={{ fontFamily: "monospace" }}>
                        {vch.autoVoucher || "No"}
                      </td>
                      {/* Delete */}
                      <td className="text-center">
                        <button
                          onClick={() => {
                            setVoucherToDelete(vch.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="btn-link text-danger"
                        >
                          <Trash2 size={13} className="inline" />
                        </button>
                      </td>
                      {/* RECEIVED CHECKBOX */}
                      <td className="reconcile-cell-received text-center">
                        <input
                          type="checkbox"
                          checked={currentVal}
                          onChange={(e) => handleCheckboxChange(vch.id, e.target.checked)}
                          className="form-checkbox"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "12px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}>
            <span>Show</span>
            <select
              value={rowCount}
              onChange={(e) => {
                setRowCount(Number(e.target.value));
                setPage(1);
              }}
              className="form-select"
              style={{ width: "auto", minWidth: "80px" }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Showing {processedVouchers.length > 0 ? (page - 1) * rowCount + 1 : 0}–{Math.min(page * rowCount, processedVouchers.length)} of {processedVouchers.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              Prev
            </button>
            <span style={{ fontSize: "13px", color: "#475569", padding: "0 6px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Custom Modal Popup in Center */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "28px 24px 24px 24px",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "360px",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            {/* Green Checkmark Circle */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 8px 0",
              }}
            >
              Success!
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              {modalMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "10px 0",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "28px 24px 24px 24px",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "380px",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            {/* Warning Icon (Red Circle) */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 8px 0",
              }}
            >
              Delete Voucher
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete this voucher? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVoucherToDelete(null);
                }}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (voucherToDelete) {
                    onDeleteVoucher(voucherToDelete);
                  }
                  setShowDeleteConfirm(false);
                  setVoucherToDelete(null);
                }}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  backgroundColor: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
