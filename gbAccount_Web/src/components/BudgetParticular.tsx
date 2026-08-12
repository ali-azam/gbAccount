"use client";

import React, { useState } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit } from "lucide-react";

export interface BudgetParticularData {
  id: string;
  particularName: string;
}

interface BudgetParticularProps {
  particulars: BudgetParticularData[];
  onSaveParticular: (name: string) => void;
  onDeleteParticular: (id: string) => void;
  onUpdateParticular: (id: string, name: string) => void;
}

type SortField = "particularName";

export default function BudgetParticular({
  particulars,
  onSaveParticular,
  onDeleteParticular,
  onUpdateParticular,
}: BudgetParticularProps) {
  const [particularName, setParticularName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [sortField, setSortField] = useState<SortField>("particularName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedParticulars = [...particulars].sort((a, b) => {
    let aVal = a.particularName.toLowerCase();
    let bVal = b.particularName.toLowerCase();
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedParticulars.length / rowCount));
  const paginatedParticulars = sortedParticulars.slice(
    (page - 1) * rowCount,
    page * rowCount
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!particularName.trim()) {
      setError("Particular Name is required");
      return;
    }
    setError("");

    if (editingId) {
      onUpdateParticular(editingId, particularName);
      setEditingId(null);
    } else {
      onSaveParticular(particularName);
    }
    setParticularName("");
  };

  const handleEdit = (item: BudgetParticularData) => {
    setParticularName(item.particularName);
    setEditingId(item.id);
    setError("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this particular?")) {
      onDeleteParticular(id);
      if (editingId === id) {
        setEditingId(null);
        setParticularName("");
      }
    }
  };

  // Inline styles for pagination buttons matching the screenshot
  const paginationBtnStyle = (disabled: boolean, active: boolean) => ({
    padding: "4px 8px",
    border: "1px solid #d1d5db",
    backgroundColor: active ? "#337ab7" : disabled ? "#f3f4f6" : "#fff",
    color: active ? "#fff" : disabled ? "#9ca3af" : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    borderRadius: "4px",
    fontWeight: active ? ("bold" as const) : ("normal" as const),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "28px",
  });

  return (
    <div className="card" style={{ maxWidth: "100%", position: "relative" }}>
      {/* Particular Create Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        <h2 className="page-title" style={{ fontSize: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          Particular Create
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <label htmlFor="particularName" className="form-label" style={{ fontWeight: "bold", margin: 0, whiteSpace: "nowrap" }}>
              Particular Name
            </label>
            <input
              type="text"
              id="particularName"
              value={particularName}
              onChange={(e) => setParticularName(e.target.value)}
              className="form-input"
              style={{ width: "320px" }}
            />
          </div>
          {error && <p className="error-message" style={{ marginTop: "-8px" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ padding: "8px 24px" }}>
            {editingId ? "Save" : "Save"}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-wrapper" style={{ marginTop: "24px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("particularName")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Particular Name</span>
                  {sortField === "particularName" ? (
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
              <th style={{ width: "120px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Edit</span>
                  <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </div>
              </th>
              <th style={{ width: "120px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Delete</span>
                  <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedParticulars.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "10px 12px", color: "#333", fontSize: "12px" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              paginatedParticulars.map((item) => (
                <tr key={item.id}>
                  <td>{item.particularName}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="btn-link"
                      style={{ color: "#3b82f6" }}
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="btn-link text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="pagination-container" style={{ padding: "10px 12px", borderTop: "1px solid var(--border-color)", backgroundColor: "#fff", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(1)}
                style={paginationBtnStyle(page === 1, false)}
              >
                {"<<"}
              </button>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={paginationBtnStyle(page === 1, false)}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={paginationBtnStyle(false, page === i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={paginationBtnStyle(page === totalPages, false)}
              >
                {">"}
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                style={paginationBtnStyle(page === totalPages, false)}
              >
                {">>"}
              </button>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", marginLeft: "12px", color: "#475569" }}>
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

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", marginLeft: "12px", color: "#475569" }}>
                Row count:
                <select
                  value={rowCount}
                  onChange={(e) => {
                    setRowCount(Number(e.target.value));
                    setPage(1);
                  }}
                  className="pagination-select"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>
            Showing {particulars.length > 0 ? (page - 1) * rowCount + 1 : 0}-{Math.min(page * rowCount, particulars.length)} of {particulars.length}
          </div>
        </div>
      </div>
    </div>
  );
}
