"use client";

import React, { useState } from "react";
import { VoucherData } from "./VoucherForm";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit } from "lucide-react";

interface VoucherListProps {
  vouchers: VoucherData[];
  loading?: boolean;
  error?: string | null;
  onSearch?: (filterBy: string, searchText: string) => void;
  onCreateNew: () => void;
  onEditVoucher?: (voucher: VoucherData) => void;
  onDeleteVoucher?: (id: string) => void;
}

type SortField =
  | "voucherNo"
  | "trxDate"
  | "transactionType"
  | "description"
  | "reference"
  | "debit"
  | "credit"
  | "autoVoucher";

export default function VoucherList({
  vouchers,
  loading,
  error,
  onSearch,
  onCreateNew,
  onEditVoucher,
  onDeleteVoucher,
}: VoucherListProps) {
  const [sortField, setSortField] = useState<SortField>("voucherNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(20);

  const [filterBy, setFilterBy] = useState("View All");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Custom delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchText);
    setPage(1);
    if (onSearch) {
      onSearch(filterBy, searchText);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter logic
  const filteredVouchers = React.useMemo(() => {
    if (onSearch) return vouchers; // Skip client-side filtering if server handled it

    return vouchers.filter((vch) => {
      if (!activeSearch.trim()) return true;
      const query = activeSearch.toLowerCase();

      if (filterBy === "Voucher No") return vch.voucherNo.toLowerCase().includes(query);
      if (filterBy === "Description") return vch.description.toLowerCase().includes(query);
      if (filterBy === "Reference") return (vch.reference || "").toLowerCase().includes(query);
      if (filterBy === "Type") return vch.transactionType.toLowerCase().includes(query);

      // View All
      return (
        vch.voucherNo.toLowerCase().includes(query) ||
        vch.description.toLowerCase().includes(query) ||
        (vch.reference || "").toLowerCase().includes(query) ||
        vch.transactionType.toLowerCase().includes(query)
      );
    });
  }, [vouchers, filterBy, activeSearch, onSearch]);

  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    let aVal: any = a[sortField] ?? "";
    let bVal: any = b[sortField] ?? "";

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedVouchers.length / rowCount));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * rowCount;
  const paginatedVouchers = sortedVouchers.slice(startIndex, startIndex + rowCount);

  const columns: { field: SortField; label: string }[] = [
    { field: "voucherNo", label: "Voucher No" },
    { field: "trxDate", label: "Trx Date" },
    { field: "transactionType", label: "Type" },
    { field: "description", label: "Description" },
    { field: "reference", label: "Reference" },
    { field: "debit", label: "Debit" },
    { field: "credit", label: "Credit" },
    { field: "autoVoucher", label: "Auto Voucher" },
  ];

  return (
    <div className="card">
      {/* Top Header Row matching screenshot */}
      <div className="flex-between-header">
        <h2 className="page-title">
          Voucher List
        </h2>
        <button
          onClick={onCreateNew}
          className="btn btn-info"
        >
          Add New
        </button>
      </div>

      {/* Filter By & Search Bar matching style */}
      <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "12px 0" }}>
        <span className="form-label" style={{ margin: 0 }}>Filter By:</span>

        {/* Dropdown Select */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="form-select"
          style={{ width: "auto", minWidth: "180px" }}
        >
          <option value="View All">View All</option>
          <option value="Voucher No">Voucher No</option>
          <option value="Description">Description</option>
          <option value="Reference">Reference</option>
          <option value="Type">Type</option>
        </select>

        {/* Search Input Box */}
        <input
          type="text"
          placeholder="Type Search Text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="form-input"
          style={{ width: "auto", minWidth: "240px" }}
        />

        {/* Search Button */}
        <button
          type="submit"
          className="btn btn-primary"
        >
          Search
        </button>
      </form>

      {/* Data Table matching exact screenshot design */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                    <span>{col.label}</span>
                    {sortField === col.field ? (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} style={{ color: "white" }} />
                      ) : (
                        <ChevronDown size={14} style={{ color: "white" }} />
                      )
                    ) : (
                      <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    )}
                  </div>
                </th>
              ))}
              <th className="text-center">
                Edit
              </th>
              <th className="text-center">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center" style={{ padding: "32px 0", color: "#64748b" }}>
                  Loading vouchers...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="text-center" style={{ padding: "24px 0", color: "#ef4444" }}>
                  Error: {error}
                </td>
              </tr>
            ) : paginatedVouchers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center" style={{ padding: "24px 0", color: "#64748b" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              paginatedVouchers.map((vch) => (
                <tr key={vch.id}>
                  <td className="font-mono-bold">
                    {vch.voucherNo}
                  </td>
                  <td>
                    {vch.trxDate}
                  </td>
                  <td>
                    {vch.transactionType}
                  </td>
                  <td>
                    {vch.description}
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {vch.reference || "-"}
                  </td>
                  <td className="text-right" style={{ fontFamily: "monospace" }}>
                    {vch.debit.toFixed(2)}
                  </td>
                  <td className="text-right" style={{ fontFamily: "monospace" }}>
                    {vch.credit.toFixed(2)}
                  </td>
                  <td className="text-center">
                    {vch.autoVoucher || "No"}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onEditVoucher && onEditVoucher(vch)}
                      className="btn-link"
                    >
                      <Edit size={14} className="inline" />
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => {
                        setVoucherToDelete(vch.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="btn-link text-danger"
                    >
                      <Trash2 size={14} className="inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching screenshot */}
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
          </select>
          <span>
            Showing {sortedVouchers.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + rowCount, sortedVouchers.length)} of {sortedVouchers.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            Prev
          </button>
          <span style={{ fontSize: "13px", color: "#475569", padding: "0 6px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            Last
          </button>
        </div>
      </div>

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
                  if (voucherToDelete && onDeleteVoucher) {
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
