"use client";

import React, { useState } from "react";
import { BudgetData } from "./BudgetForm";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit, Check } from "lucide-react";

interface BudgetListProps {
  budgets: BudgetData[];
  onCreateNew: () => void;
  onEditBudget?: (budget: BudgetData) => void;
  onDeleteBudget?: (id: string) => void;
}

type SortField = "sl" | "budgetYear" | "accountCode" | "amount";

export default function BudgetList({
  budgets,
  onCreateNew,
  onEditBudget,
  onDeleteBudget,
}: BudgetListProps) {
  const [filterBy, setFilterBy] = useState("View All");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>("budgetYear");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);

  const handleDelete = (id: string) => {
    if (onDeleteBudget) {
      onDeleteBudget(id);
      setToastMessage("Budget record deleted successfully!");
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchText);
    setPage(1);
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
  const filteredBudgets = budgets.filter((b) => {
    if (!activeSearch.trim()) return true;
    const query = activeSearch.toLowerCase();

    if (filterBy === "Year") return b.budgetYear.toLowerCase().includes(query);
    if (filterBy === "Account Code") return b.accountCode.toLowerCase().includes(query);
    if (filterBy === "Amount") return b.amount.toString().includes(query);

    // View All
    return (
      b.budgetYear.toLowerCase().includes(query) ||
      b.accountCode.toLowerCase().includes(query) ||
      b.amount.toString().includes(query)
    );
  });

  // Sort logic
  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    let aVal: any = a[sortField as keyof BudgetData] ?? "";
    let bVal: any = b[sortField as keyof BudgetData] ?? "";

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedBudgets.length / rowCount));
  const paginatedBudgets = sortedBudgets.slice((page - 1) * rowCount, page * rowCount);

  const columns: { field: SortField; label: string }[] = [
    { field: "sl", label: "SL" },
    { field: "budgetYear", label: "Year" },
    { field: "accountCode", label: "Account Code" },
    { field: "amount", label: "Amount" },
  ];

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="toast-container" style={{ marginBottom: "16px" }}>
          <div className="toast-content">
            <div className="toast-icon">
              <Check size={14} />
            </div>
            <p className="toast-message">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Top Header Row matching screenshot */}
      {/* Top Header Row matching screenshot */}
      <div className="flex-between-header" style={{ marginBottom: "16px" }}>
        <h2 className="page-title" style={{ fontSize: "22px" }}>
          Budget List
        </h2>
        <button
          onClick={onCreateNew}
          className="btn btn-info"
          style={{ padding: "6px 16px" }}
        >
          Add New
        </button>
      </div>

      {/* Filter By & Search Bar matching screenshot */}
      <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <span className="form-label" style={{ margin: 0, fontWeight: "bold" }}>Filter By:</span>

        {/* Dropdown Select */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="form-select"
          style={{ width: "auto", minWidth: "180px" }}
        >
          <option value="View All">View All</option>
          <option value="Year">Year</option>
          <option value="Account Code">Account Code</option>
          <option value="Amount">Amount</option>
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

      {/* Data Table matching screenshot styling */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={col.field === "amount" ? "text-right" : ""}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: col.field === "amount" ? "flex-end" : "space-between", gap: "4px" }}>
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
              <th className="text-center" onClick={() => handleSort("sl")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <span>Edit</span>
                  <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </div>
              </th>
              <th className="text-center" onClick={() => handleSort("sl")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <span>Delete</span>
                  <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedBudgets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "10px 12px", color: "#333", fontSize: "12px" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              paginatedBudgets.map((budget, index) => (
                <tr key={budget.id}>
                  <td className="text-center">
                    {(page - 1) * rowCount + index + 1}
                  </td>
                  <td>
                    {budget.budgetYear}
                  </td>
                  <td className="font-mono-bold">
                    {budget.accountCode}
                  </td>
                  <td className="text-right" style={{ fontFamily: "monospace" }}>
                    {budget.amount.toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onEditBudget && onEditBudget(budget)}
                      className="btn-link"
                    >
                      <Edit size={14} className="inline" />
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(budget.id)}
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

        {/* Pagination Footer inside table border container matching screenshot */}
        <div className="pagination-container" style={{ padding: "10px 12px", borderTop: "1px solid var(--border-color)", backgroundColor: "#fff" }}>
          <label className="flex-gap-2 items-center" style={{ display: "flex", fontSize: "12px", color: "#374151" }}>
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
      </div>
    </div>
  );
}
