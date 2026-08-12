"use client";

import React, { useState, useMemo, useRef } from "react";
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

  // Active filters applied on clicking "Search"
  const [searchParams, setSearchParams] = useState({
    dateFrom: "",
    dateTo: "",
    filterBy: "View All",
    filterText: "",
    selectedZone: "01 - Magura Zone",
    typePurpose: "",
    typeVoucherType: "",
  });

  // Table sorting & pagination
  const [sortField, setSortField] = useState<SortField>("voucherNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(20);

  // Temporary local state for checkboxes before clicking "Send"
  const [pendingReceived, setPendingReceived] = useState<Record<string, boolean>>({});

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  // Trigger search filters
  const handleSearch = () => {
    setSearchParams({
      dateFrom,
      dateTo,
      filterBy,
      filterText,
      selectedZone,
      typePurpose,
      typeVoucherType,
    });
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
    alert("Voucher status updated successfully!");
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

  // Filtered and sorted vouchers
  const processedVouchers = useMemo(() => {
    let result = vouchers.map((v) => ({
      ...v,
      // If there's a pending change in checkbox state, use it. Otherwise use the saved status.
      isReceived: v.id in pendingReceived ? pendingReceived[v.id] : !!v.received,
    }));

    // Filter by Date From
    if (searchParams.dateFrom) {
      result = result.filter((v) => v.trxDate >= searchParams.dateFrom);
    }
    // Filter by Date To
    if (searchParams.dateTo) {
      result = result.filter((v) => v.trxDate <= searchParams.dateTo);
    }
    // Filter by 'Filter By' dropdown + text input
    if (searchParams.filterBy !== "View All") {
      const isRec = searchParams.filterBy === "Received";
      result = result.filter((v) => v.isReceived === isRec);
    }
    if (searchParams.filterText) {
      const text = searchParams.filterText.toLowerCase();
      result = result.filter(
        (v) =>
          v.voucherNo.toLowerCase().includes(text) ||
          v.description.toLowerCase().includes(text) ||
          (v.reference && v.reference.toLowerCase().includes(text))
      );
    }
    // Filter by Purpose
    if (searchParams.typePurpose) {
      const purpose = searchParams.typePurpose.toLowerCase();
      result = result.filter(
        (v) =>
          v.description.toLowerCase().includes(purpose) ||
          v.voucherType.toLowerCase().includes(purpose)
      );
    }
    // Filter by Voucher Type
    if (searchParams.typeVoucherType) {
      const vtype = searchParams.typeVoucherType.toLowerCase();
      result = result.filter((v) => v.voucherType.toLowerCase().includes(vtype));
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
  }, [vouchers, searchParams, sortField, sortDirection, pendingReceived]);

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
                            if (confirm("Are you sure you want to delete this voucher?")) {
                              onDeleteVoucher(vch.id);
                            }
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
        <div className="pagination-container">
          <label className="flex-gap-2 items-center" style={{ display: "flex" }}>
            Go to page:
            <select
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="pagination-select"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          <label className="flex-gap-2 items-center" style={{ display: "flex" }}>
            Row count:
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="pagination-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
