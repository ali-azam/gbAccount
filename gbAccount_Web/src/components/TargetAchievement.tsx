"use client";

import React, { useState, useRef } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown, Trash2, Edit, Calendar } from "lucide-react";
import { BudgetParticularData } from "./BudgetParticular";

export interface TargetAchievementData {
  id: string;
  particularName: string;
  targetCurrentYear: string;
  target: string;
  achievement?: string;
  balance?: string;
  date: string;
  productName: string;
  officeId?: string;
}

interface TargetAchievementProps {
  targets: TargetAchievementData[];
  particulars: BudgetParticularData[];
  onSaveTarget: (target: TargetAchievementData) => void;
  onDeleteTarget: (id: string) => void;
  onUpdateTarget: (target: TargetAchievementData) => void;
}

type SortField = "particularName" | "targetCurrentYear" | "target" | "date" | "productName";

export default function TargetAchievement({
  targets,
  particulars,
  onSaveTarget,
  onDeleteTarget,
  onUpdateTarget,
}: TargetAchievementProps) {
  const [formData, setFormData] = useState({
    particularName: "Please Select",
    targetCurrentYear: "",
    target: "",
    date: "",
    productName: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const yearPickerRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selectedYear = e.target.value.split("-")[0]; // YYYY from YYYY-MM-DD
      setFormData((prev) => ({ ...prev, targetCurrentYear: selectedYear }));
      if (errors.targetCurrentYear) {
        setErrors((prev) => {
          const newErr = { ...prev };
          delete newErr.targetCurrentYear;
          return newErr;
        });
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setFormData((prev) => ({ ...prev, date: e.target.value }));
      if (errors.date) {
        setErrors((prev) => {
          const newErr = { ...prev };
          delete newErr.date;
          return newErr;
        });
      }
    }
  };

  const [sortField, setSortField] = useState<SortField | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
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

  const sortedTargets = !sortField
    ? [...targets]
    : [...targets].sort((a, b) => {
        let aVal = (a[sortField] || "").toString().toLowerCase();
        let bVal = (b[sortField] || "").toString().toLowerCase();
        
        // Sort numeric values properly if sorting Target or TargetCurrentYear
        if (sortField === "target" || sortField === "targetCurrentYear") {
          const aNum = parseFloat(aVal) || 0;
          const bNum = parseFloat(bVal) || 0;
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });

  const totalPages = Math.max(1, Math.ceil(sortedTargets.length / rowCount));
  const paginatedTargets = sortedTargets.slice((page - 1) * rowCount, page * rowCount);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (formData.particularName === "Please Select") {
      newErrors.particularName = "Particular Name is required";
    }
    if (!formData.targetCurrentYear.trim()) {
      newErrors.targetCurrentYear = "Target Current Year is required";
    }
    if (!formData.target.trim()) {
      newErrors.target = "Target is required";
    }
    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }
    if (!formData.productName.trim()) {
      newErrors.productName = "Product is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: TargetAchievementData = {
      id: editingId || Math.random().toString(36).substring(2, 9),
      ...formData,
    };

    if (editingId) {
      onUpdateTarget(payload);
      showToast("Target Achievement updated successfully!", "success");
      setEditingId(null);
    } else {
      onSaveTarget(payload);
      showToast("Target Achievement created successfully!", "success");
    }

    setPage(1);
    setSortField("");
    setFormData({
      particularName: "Please Select",
      targetCurrentYear: "",
      target: "",
      date: "",
      productName: "",
    });
    setErrors({});
  };

  const handleEdit = (item: TargetAchievementData) => {
    setFormData({
      particularName: item.particularName,
      targetCurrentYear: item.targetCurrentYear,
      target: item.target,
      date: item.date,
      productName: item.productName,
    });
    setEditingId(item.id);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="card" style={{ maxWidth: "100%", position: "relative" }}>
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          backgroundColor: toast.type === "success" ? "#10B981" : "#EF4444",
          color: "#FFFFFF",
          padding: "14px 24px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
          zIndex: 9999,
          fontWeight: 600,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "16px" }}>{toast.type === "success" ? "✓" : "✕"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Delete Confirmation Modal Popup */}
      {deleteConfirmId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "420px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 16px auto"
            }}>
              🗑️
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#1E293B", marginBottom: "8px" }}>
              Do you want to delete this record?
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>
              This record will be permanently deleted. Are you sure?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  onDeleteTarget(id);
                  showToast("Target Achievement entry deleted successfully!", "success");
                  if (editingId === id) {
                    setEditingId(null);
                    setFormData({
                      particularName: "Please Select",
                      targetCurrentYear: "",
                      target: "",
                      date: "",
                      productName: "",
                    });
                  }
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        <h2 className="page-title" style={{ fontSize: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          Target Achievement
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          {/* Two Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "40px", rowGap: "16px" }}>
            
            {/* Particular Name Dropdown (Column 1) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="particularName" className="form-label" style={{ fontWeight: "bold" }}>
                Particular Name
              </label>
              <select
                id="particularName"
                name="particularName"
                value={formData.particularName}
                onChange={handleChange}
                className="form-select"
                style={{ borderColor: errors.particularName ? "#d9534f" : "" }}
              >
                <option value="Please Select">Please Select</option>
                {particulars.map((p) => (
                  <option key={p.id} value={p.particularName}>
                    {p.particularName}
                  </option>
                ))}
              </select>
              {errors.particularName && <p className="error-message">{errors.particularName}</p>}
            </div>

            {/* Empty space next to Particular Name */}
            <div></div>

            {/* Target Current Year (Column 1) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="targetCurrentYear" className="form-label" style={{ fontWeight: "bold" }}>
                Target Current Year
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  id="targetCurrentYear"
                  name="targetCurrentYear"
                  value={formData.targetCurrentYear}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingRight: "36px", borderColor: errors.targetCurrentYear ? "#d9534f" : "" }}
                />
                <button
                  type="button"
                  onClick={() => yearPickerRef.current?.showPicker()}
                  style={{
                    position: "absolute",
                    right: "10px",
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
                  <Calendar size={16} />
                </button>
                <input
                  type="date"
                  ref={yearPickerRef}
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
                  onChange={handleYearChange}
                />
              </div>
              {errors.targetCurrentYear && <p className="error-message">{errors.targetCurrentYear}</p>}
            </div>

            {/* Target (Column 2) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="target" className="form-label" style={{ fontWeight: "bold" }}>
                Target
              </label>
              <input
                type="text"
                id="target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                className="form-input"
                style={{ borderColor: errors.target ? "#d9534f" : "" }}
              />
              {errors.target && <p className="error-message">{errors.target}</p>}
            </div>

            {/* Date (Column 1) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="date" className="form-label" style={{ fontWeight: "bold" }}>
                Date
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formData.date}
                  placeholder="e.g. 2026-07-28"
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingRight: "36px", borderColor: errors.date ? "#d9534f" : "" }}
                />
                <button
                  type="button"
                  onClick={() => datePickerRef.current?.showPicker()}
                  style={{
                    position: "absolute",
                    right: "10px",
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
                  <Calendar size={16} />
                </button>
                <input
                  type="date"
                  ref={datePickerRef}
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
                  onChange={handleDateChange}
                />
              </div>
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>

            {/* Empty space next to Date */}
            <div></div>

            {/* Product (Column 1) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="productName" className="form-label" style={{ fontWeight: "bold" }}>
                Product
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="form-input"
                style={{ borderColor: errors.productName ? "#d9534f" : "" }}
              />
              {errors.productName && <p className="error-message">{errors.productName}</p>}
            </div>

            {/* Empty space next to Product */}
            <div></div>
          </div>

          {/* Centered Save Button */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 24px" }}>
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-wrapper" style={{ marginTop: "24px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("particularName")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>ParticularName</span>
                  {sortField === "particularName" ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("targetCurrentYear")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>TargetCurrentYear</span>
                  {sortField === "targetCurrentYear" ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("target")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Target</span>
                  {sortField === "target" ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("date")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Date</span>
                  {sortField === "date" ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("productName")}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                  <span>Product Name</span>
                  {sortField === "productName" ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} style={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  )}
                </div>
              </th>
              <th style={{ width: "100px" }}>Edit</th>
              <th style={{ width: "100px" }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTargets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "10px 12px", color: "#333", fontSize: "12px" }}>
                  No data available!
                </td>
              </tr>
            ) : (
              paginatedTargets.map((item) => (
                <tr key={item.id}>
                  <td>{item.particularName}</td>
                  <td>{item.targetCurrentYear}</td>
                  <td>{item.target}</td>
                  <td>{item.date}</td>
                  <td>{item.productName}</td>
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
        <div className="pagination-container" style={{ padding: "10px 12px", borderTop: "1px solid var(--border-color)", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
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