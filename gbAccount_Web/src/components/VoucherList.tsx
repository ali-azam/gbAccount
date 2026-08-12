"use client";

import React, { useState } from "react";
import { VoucherData } from "./VoucherForm";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit } from "lucide-react";

interface VoucherListProps {
  vouchers: VoucherData[];
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
  onCreateNew,
  onEditVoucher,
  onDeleteVoucher,
}: VoucherListProps) {
  const [sortField, setSortField] = useState<SortField>("voucherNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(20);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedVouchers = [...vouchers].sort((a, b) => {
    let aVal: any = a[sortField] ?? "";
    let bVal: any = b[sortField] ?? "";

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

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
            {sortedVouchers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center" style={{ padding: "24px 0", color: "#64748b" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              sortedVouchers.map((vch) => (
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
                      onClick={() => onDeleteVoucher && onDeleteVoucher(vch.id)}
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
      <div className="pagination-container">
        <label className="flex-gap-2 items-center" style={{ display: "flex" }}>
          Go to page:
          <select
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="pagination-select"
          >
            <option value={1}>1</option>
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
          </select>
        </label>
      </div>
    </div>
  );
}
