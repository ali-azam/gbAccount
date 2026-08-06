"use client";

import React, { useState } from "react";
import { AccountData } from "./AccountForm";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

interface AccountListProps {
  accounts: AccountData[];
  onCreateNew: () => void;
  onEditAccount: (account: AccountData) => void;
  onDeleteAccount?: (id: string) => void;
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

export default function AccountList({ accounts, onCreateNew, onEditAccount, onDeleteAccount }: AccountListProps) {
  const [filterBy, setFilterBy] = useState("View All");
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [sortField, setSortField] = useState<SortField>("newCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchText);
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
  const filteredAccounts = accounts.filter((acc) => {
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
  });

  // Sort logic
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aVal: any = a[sortField] ?? "";
    let bVal: any = b[sortField] ?? "";

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const columns: { field: SortField; label: string }[] = [
    { field: "sl", label: "SL" },
    { field: "newCode", label: "Code" },
    { field: "accountHead", label: "Acc Name" },
    { field: "level", label: "Level" },
    { field: "first", label: "First" },
    { field: "second", label: "Second" },
    { field: "third", label: "Third" },
    { field: "fourth", label: "Fourth" },
    { field: "fifth", label: "Fifth" },
    { field: "isTransaction", label: "Transaction" },
    { field: "officeLevel", label: "Office" },
    { field: "module", label: "Module" },
    { field: "note", label: "Note" },
  ];

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
          onChange={(e) => setFilterBy(e.target.value)}
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
              <th className="text-center">Edit</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-center" style={{ padding: "32px 0", color: "#64748b" }}>
                  No accounts found. Click "Add New" to create one.
                </td>
              </tr>
            ) : (
              sortedAccounts.map((acc, index) => (
                <tr key={acc.id}>
                  <td className="text-center">
                    {acc.sl || index + 1}
                  </td>
                  <td className="font-mono-bold">
                    {acc.newCode}
                  </td>
                  <td>
                    {acc.accountHead}
                  </td>
                  <td className="text-center">
                    {acc.level}
                  </td>
                  <td>
                    {acc.first || "-"}
                  </td>
                  <td>
                    {acc.second || "-"}
                  </td>
                  <td>
                    {acc.third || "-"}
                  </td>
                  <td>
                    {acc.fourth || "-"}
                  </td>
                  <td>
                    {acc.fifth || "-"}
                  </td>
                  <td className="text-center">
                    {acc.isTransaction ? (
                      <span className="text-success">Yes</span>
                    ) : (
                      <span>No</span>
                    )}
                  </td>
                  <td>
                    {acc.officeLevel}
                  </td>
                  <td>
                    {acc.module}
                  </td>
                  <td>
                    {acc.note !== "Please Select" ? acc.note : "-"}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onEditAccount(acc)}
                      className="btn-link"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onDeleteAccount && onDeleteAccount(acc.id)}
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
    </div>
  );
}
