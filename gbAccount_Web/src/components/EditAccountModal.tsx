"use client";

import React, { useState, useEffect } from "react";
import { AccountData } from "./AccountForm";
import { X } from "lucide-react";
import { MODULES, OFFICE_LEVELS, NOTE_PLACEHOLDER } from "@/lib/lookups";
import { useCategories } from "@/lib/useCategories";
import { useAccountNotes } from "@/lib/useAccountNotes";

interface EditAccountModalProps {
  account: AccountData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAccount: AccountData) => void;
}

export default function EditAccountModal({
  account,
  isOpen,
  onClose,
  onSave,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState<AccountData>(account);
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    accountNotes,
    loading: notesLoading,
    error: notesError,
  } = useAccountNotes();

  useEffect(() => {
    setFormData(account);
  }, [account]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "320px" }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: "8px 12px", backgroundColor: "#f9fafb" }}>
          <h3 className="modal-title" style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Edit Record</h3>
          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{ padding: "2px", border: "1px solid #e5e7eb", borderRadius: "2px", backgroundColor: "white" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Acc Name
            </label>
            <input
              type="text"
              name="accountHead"
              value={formData.accountHead}
              onChange={handleChange}
              className="form-input"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Transaction
            </label>
            <label className="form-checkbox-container" style={{ margin: 0, fontSize: "12px" }}>
              <input
                type="checkbox"
                name="isTransaction"
                checked={formData.isTransaction}
                onChange={handleChange}
                className="form-checkbox"
              />
              In Active
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Office
            </label>
            <select
              name="officeLevel"
              value={formData.officeLevel}
              onChange={handleChange}
              className="form-select"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {OFFICE_LEVELS.map((office) => (
                <option key={office.id} value={office.name}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Module
            </label>
            <select
              name="module"
              value={formData.module}
              onChange={handleChange}
              className="form-select"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {MODULES.map((mod) => (
                <option key={mod.id} value={mod.name}>
                  {mod.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              <option value={NOTE_PLACEHOLDER}>
                {categoriesLoading ? "Loading..." : NOTE_PLACEHOLDER}
              </option>
              {categories.map((cat) => (
                <option key={cat.CategoryID} value={cat.CategoryName ?? ""}>
                  {cat.CategoryName}
                </option>
              ))}
            </select>
            {categoriesError && (
              <p className="error-message" style={{ fontSize: "11px" }}>
                Could not load categories: {categoriesError}
              </p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px" }}>
              Note
            </label>
            <select
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="form-select"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              <option value={NOTE_PLACEHOLDER}>
                {notesLoading ? "Loading..." : NOTE_PLACEHOLDER}
              </option>
              {accountNotes.map((note) => (
                <option key={note.id} value={note.noteName}>
                  {note.noteName}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ padding: "12px 0 0 0", borderTop: "none", gap: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "6px 12px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: "11px", padding: "6px 12px" }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
