"use client";

import React, { useState, useMemo } from "react";
import { AccountData } from "./AccountForm";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { noteLabel } from "@/lib/lookups";

interface AccountListProps {
  accounts: AccountData[];
  onCreateNew: () => void;
  onEditAccount: (account: AccountData) => void;
  onDeleteAccount?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

type SortField =
  | "sl"
  | "newCode"
  | "accountHead"
  | "level"
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "isTransaction"
  | "officeLevel"
  | "module"
  | "note";

const PAGE_SIZES = [25, 50, 100, 250];

interface Column {
  field: SortField;
  label: string;
  className?: string;
  /** Overrides the default cell content. rowNumber is 1-based across the whole result set. */
  render?: (acc: AccountData, rowNumber: number) => React.ReactNode;
}

/**
 * One entry per data column, driving both the header and the body so a column
 * can never appear in one and not the other. Nothing here depends on props or
 * state, so it lives at module scope and is built once.
 */
const COLUMNS: Column[] = [
  // SL is the row's position in the current view, not a stored value. Sorting or
  // filtering changes which row is first, so it has to be derived at render time.
  { field: "sl", label: "SL", className: "text-center", render: (_acc, rowNumber) => rowNumber },
  { field: "newCode", label: "Code", className: "font-mono-bold" },
  { field: "accountHead", label: "Acc Name" },
  { field: "level", label: "Level", className: "text-center" },
  { field: "first", label: "First" },
  { field: "second", label: "Second" },
  { field: "third", label: "Third" },
  { field: "fourth", label: "Fourth" },
  { field: "fifth", label: "Fifth" },
  {
    field: "isTransaction",
    label: "Transaction",
    className: "text-center",
    render: (acc) =>
      acc.isTransaction ? <span className="text-success">Yes</span> : <span>No</span>,
  },
  { field: "officeLevel", label: "Office" },
  { field: "module", label: "Module" },
  // Rows created in the form can still hold the "Please Select" placeholder;
  // noteLabel normalises it to "-" the way fetched rows already are.
  { field: "note", label: "Note", render: (acc) => noteLabel(acc.note) },
];

// Data columns plus the Edit and Delete action columns. The status row spans
// these, so its colSpan tracks the table instead of being hardcoded.
const TOTAL_COLUMNS = COLUMNS.length + 2;

/**
 * Default cell content: the field's value, with blanks shown as "-". Checks for
 * empty explicitly rather than using `||` so a genuine 0 (AccLevel) still prints.
 */
function cellValue(acc: AccountData, field: SortField): React.ReactNode {
  const value = acc[field];
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

/** Orders two field values by type: numerically, by flag, or case-insensitively. */
function compareValues(a: AccountData[SortField], b: AccountData[SortField]): number {
  const left = a ?? "";
  const right = b ?? "";

  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "boolean" || typeof right === "boolean") {
    return Number(left) - Number(right);
  }
  return String(left).toLowerCase().localeCompare(String(right).toLowerCase());
}

export default function AccountList({ accounts, onCreateNew, onEditAccount, onDeleteAccount, loading, error }: AccountListProps) {
  const [filterBy, setFilterBy] = useState("View All");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [sortField, setSortField] = useState<SortField>("newCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
    setPage(1);
  };

  // Changing the filter dropdown re-scopes the search, which can shrink the
  // result set — reset to page 1 so the view never lands past the last page.
  const handleFilterChange = (value: string) => {
    setFilterBy(value);
    setPage(1);
  };

  // Filter logic — module/officeLevel are already display labels, resolved by
  // toAccountData when the row was fetched, so they compare as plain strings.
  const filteredAccounts = useMemo(() => accounts.filter((acc) => {
    if (!activeSearch.trim()) return true;
    const query = activeSearch.toLowerCase();

    if (filterBy === "Code") return acc.newCode.toLowerCase().includes(query);
    if (filterBy === "Acc Name") return acc.accountHead.toLowerCase().includes(query);
    if (filterBy === "Level") return acc.level.toString().includes(query);
    if (filterBy === "Module") return acc.module.toLowerCase().includes(query);
    if (filterBy === "Office") return acc.officeLevel.toLowerCase().includes(query);
    if (filterBy === "Transaction") {
      const transStr = acc.isTransaction ? "yes" : "no";
      return transStr.includes(query);
    }

    // View All
    return (
      acc.newCode.toLowerCase().includes(query) ||
      acc.accountHead.toLowerCase().includes(query) ||
      acc.module.toLowerCase().includes(query) ||
      acc.officeLevel.toLowerCase().includes(query) ||
      (acc.first && acc.first.toLowerCase().includes(query)) ||
      (acc.second && acc.second.toLowerCase().includes(query))
    );
  }), [accounts, activeSearch, filterBy]);

  // Sort logic
  const sortedAccounts = useMemo(
    () =>
      [...filteredAccounts].sort((a, b) => {
        const order = compareValues(a[sortField], b[sortField]);
        return sortDirection === "asc" ? order : -order;
      }),
    [filteredAccounts, sortField, sortDirection],
  );

  // Pagination logic — currentPage is clamped so filtering never leaves us on an empty page
  const totalItems = sortedAccounts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + pageSize);

  // Loading, failure, and no-results all render as a single full-width row, so
  // resolve which message applies before the table rather than nesting ternaries
  // inside it. Null means there are rows to show.
  const statusMessage = loading
    ? "Loading accounts…"
    : error
      ? `Could not load accounts: ${error}`
      : totalItems === 0
        ? 'No accounts found. Click "Add New" to create one.'
        : null;

  return (
    <div className="card">
      {/* Top Header Row matching screenshot */}
      <div className="flex-between-header">
        <h2 className="page-title">
          Account Code List
        </h2>
        <button
          onClick={onCreateNew}
          className="btn btn-info"
        >
          Add New
        </button>
      </div>

      {/* Filter By & Search Bar matching screenshot */}
      <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "12px 0" }}>
        <span className="form-label" style={{ margin: 0 }}>Filter By:</span>

        {/* Dropdown Select */}
        <select
          value={filterBy}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="form-select"
          style={{ width: "auto", minWidth: "180px" }}
        >
          <option value="View All">View All</option>
          <option value="Code">Code</option>
          <option value="Acc Name">Acc Name</option>
          <option value="Level">Level</option>
          <option value="Module">Module</option>
          <option value="Office">Office</option>
          <option value="Transaction">Transaction</option>
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
              {COLUMNS.map((col) => (
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
              <th className="text-center">Edit</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {statusMessage ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center"
                  style={{ padding: "32px 0", color: error ? "#d9534f" : "#64748b" }}
                >
                  {statusMessage}
                </td>
              </tr>
            ) : (
              paginatedAccounts.map((acc, index) => (
                <tr key={acc.id}>
                  {COLUMNS.map((col) => (
                    <td key={col.field} className={col.className}>
                      {col.render
                        ? col.render(acc, startIndex + index + 1)
                        : cellValue(acc, col.field)}
                    </td>
                  ))}
                  <td className="text-center">
                    <button onClick={() => onEditAccount(acc)} className="btn-link">
                      Edit
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onDeleteAccount?.(acc.id)}
                      className="btn-link text-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls — hidden whenever the table is showing a status row */}
      {!statusMessage && (
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
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="form-select"
              style={{ width: "auto", minWidth: "80px" }}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
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
      )}
    </div>
  );
}
