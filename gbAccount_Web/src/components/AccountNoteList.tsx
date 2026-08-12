"use client";

import React, { useState } from "react";
import { AccountNoteData } from "./AccountNoteForm";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

interface AccountNoteListProps {
  accountNotes: AccountNoteData[];
  onCreateNew: () => void;
}

type SortField = "sl" | "noteNo" | "noteName" | "isActive";

export default function AccountNoteList({ accountNotes, onCreateNew }: AccountNoteListProps) {
  const [sortField, setSortField] = useState<SortField>("noteNo");
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

  const sortedNotes = [...accountNotes].sort((a, b) => {
    let aVal: any = a[sortField] ?? "";
    let bVal: any = b[sortField] ?? "";

    if (sortField === "sl") {
      aVal = a.sl || 0;
      bVal = b.sl || 0;
    } else if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    } else if (typeof aVal === "boolean") {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedNotes.length / rowCount));
  const paginatedNotes = sortedNotes.slice((page - 1) * rowCount, page * rowCount);

  const columns: { field: SortField; label: string }[] = [
    { field: "sl", label: "SL" },
    { field: "noteNo", label: "Note No" },
    { field: "noteName", label: "Note Name" },
    { field: "isActive", label: "Is Active" },
  ];

  return (
    <div className="card">
      {/* Top Header Row matching screenshot */}
      <div className="flex-between-header" style={{ marginBottom: "16px" }}>
        <h2 className="page-title" style={{ fontSize: "22px" }}>
          Account Note List
        </h2>
        <button
          onClick={onCreateNew}
          className="btn btn-info"
          style={{ padding: "6px 16px" }}
        >
          Add New
        </button>
      </div>

      {/* Data Table matching screenshot styling */}
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
            </tr>
          </thead>
          <tbody>
            {paginatedNotes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "10px 12px", color: "#333", fontSize: "12px" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              paginatedNotes.map((note, index) => (
                <tr key={note.id}>
                  <td className="text-center">
                    {(page - 1) * rowCount + index + 1}
                  </td>
                  <td>
                    {note.noteNo}
                  </td>
                  <td>
                    {note.noteName}
                  </td>
                  <td className="text-center">
                    {note.isActive ? (
                      <span className="text-success" style={{ fontWeight: 600 }}>Yes</span>
                    ) : (
                      <span className="text-danger" style={{ fontWeight: 600 }}>No</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer inside table border container matching screenshot */}
        <div className="pagination-container" style={{ padding: "10px 12px", borderTop: "1px solid var(--border-color)", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <label className="flex-gap-2 items-center" style={{ display: "flex", fontSize: "12px", color: "#374151" }}>
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

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary"
                style={{ padding: "2px 8px", fontSize: "11px" }}
              >
                Prev
              </button>
              <span style={{ fontSize: "12px", display: "flex", alignItems: "center", color: "#374151" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-secondary"
                style={{ padding: "2px 8px", fontSize: "11px" }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
