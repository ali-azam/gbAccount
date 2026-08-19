"use client";

import React, { useState, useEffect } from "react";
import { Check, RefreshCw } from "lucide-react";
import {
  MODULES,
  DEFAULT_MODULE,
  OFFICE_LEVELS,
  DEFAULT_OFFICE_LEVEL,
  ACCOUNT_NOTES,
  NOTE_PLACEHOLDER,
} from "@/lib/lookups";
import { useCategories } from "@/lib/useCategories";

export interface AccountData {
  id: string;
  sl?: number;
  parentCode: string;
  newCode: string;
  accountHead: string;
  level: number;
  first?: string;
  second?: string;
  third?: string;
  fourth?: string;
  fifth?: string;
  isTransaction: boolean;
  nature: string;
  module: string;
  officeLevel: string;
  category: string;
  note: string;
  createdAt: string;
}

interface AccountFormProps {
  onSaveAccount: (account: AccountData) => Promise<boolean>;
  onBackToList: () => void;
  initialData?: AccountData | null;
}

export default function AccountForm({ onSaveAccount, onBackToList, initialData }: AccountFormProps) {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const [formData, setFormData] = useState({
    parentCode: "",
    newCode: "",
    accountHead: "",
    level: 0,
    isTransaction: true,
    nature: "",
    module: DEFAULT_MODULE,
    officeLevel: DEFAULT_OFFICE_LEVEL,
    category: NOTE_PLACEHOLDER,
    note: NOTE_PLACEHOLDER,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        parentCode: initialData.parentCode,
        newCode: initialData.newCode,
        accountHead: initialData.accountHead,
        level: initialData.level,
        isTransaction: initialData.isTransaction,
        nature: initialData.nature,
        module: initialData.module,
        officeLevel: initialData.officeLevel,
        category: initialData.category,
        note: initialData.note,
      });
    } else {
      setFormData({
        parentCode: "",
        newCode: "",
        accountHead: "",
        level: 0,
        isTransaction: true,
        nature: "",
        module: DEFAULT_MODULE,
        officeLevel: DEFAULT_OFFICE_LEVEL,
        category: NOTE_PLACEHOLDER,
        note: NOTE_PLACEHOLDER,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.accountHead.trim()) {
      newErrors.accountHead = "Account Head is required";
    }
    if (!formData.newCode.trim()) {
      newErrors.newCode = "New Code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const newAccount: AccountData = {
      ...formData,
      // Prefix with "new_" for new records so the API hook correctly sends POST
      id: initialData ? initialData.id : `new_${Date.now()}`,
      sl: initialData ? initialData.sl : undefined,
      first: formData.parentCode ? formData.parentCode : "-",
      second: formData.category !== NOTE_PLACEHOLDER ? formData.category : "-",
      third: formData.nature ? formData.nature : "-",
      fourth: "-",
      fifth: "-",
      createdAt: initialData ? initialData.createdAt : new Date().toLocaleDateString(),
    };

    const success = await onSaveAccount(newAccount);

    if (success) {
      setToastMessage(initialData ? "Account Code successfully updated!" : "Account Code successfully created!");
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);

      setFormData((prev) => ({
        ...prev,
        parentCode: "",
        newCode: "",
        accountHead: "",
        nature: "",
        category: NOTE_PLACEHOLDER,
        note: NOTE_PLACEHOLDER,
      }));
    } else {
      setErrors({ newCode: "Failed to save. Please check the details and try again." });
    }
  };

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-content">
            <div className="toast-icon">
              <Check size={14} />
            </div>
            <p className="toast-message">{toastMessage}</p>
          </div>
          <button
            onClick={onBackToList}
            className="toast-link"
          >
            View in List →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Two-Column Grid */}
        <div className="form-grid form-grid-2">
          {/* Row 1: Parent Code & New Code */}
          <div className="form-group">
            <label htmlFor="parentCode" className="form-label">
              Parent Code
            </label>
            <input
              type="text"
              id="parentCode"
              name="parentCode"
              value={formData.parentCode}
              onChange={handleChange}
              placeholder="Enter or select parent code"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newCode" className="form-label">
              New Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="newCode"
              name="newCode"
              value={formData.newCode}
              onChange={handleChange}
              placeholder="e.g. 1001-01"
              className="form-input"
              style={{ borderColor: errors.newCode ? "#d9534f" : "" }}
            />
            {errors.newCode && (
              <p className="error-message">{errors.newCode}</p>
            )}
          </div>

          {/* Row 2: Account Head & Level */}
          <div className="form-group">
            <label htmlFor="accountHead" className="form-label">
              Account Head <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="accountHead"
              name="accountHead"
              value={formData.accountHead}
              onChange={handleChange}
              placeholder="e.g. Cash in Hand"
              className="form-input"
              style={{ borderColor: errors.accountHead ? "#d9534f" : "" }}
            />
            {errors.accountHead && (
              <p className="error-message">{errors.accountHead}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="level" className="form-label">
              Level
            </label>
            <input
              type="number"
              id="level"
              name="level"
              min={0}
              max={10}
              value={formData.level}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Row 3: Is Transaction & Nature */}
          <div className="form-group" style={{ justifyContent: "center", paddingTop: "8px" }}>
            <label className="form-checkbox-container" style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Is Transaction
              <input
                type="checkbox"
                name="isTransaction"
                checked={formData.isTransaction}
                onChange={handleChange}
                className="form-checkbox"
              />
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="nature" className="form-label">
              Nature
            </label>
            <input
              type="text"
              id="nature"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              placeholder="e.g. Debit / Asset"
              className="form-input"
            />
          </div>

          {/* Row 4: Module & Office Level */}
          <div className="form-group">
            <label htmlFor="module" className="form-label">
              Module
            </label>
            <select
              id="module"
              name="module"
              value={formData.module}
              onChange={handleChange}
              className="form-select"
            >
              {MODULES.map((mod) => (
                <option key={mod.id} value={mod.name}>
                  {mod.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="officeLevel" className="form-label">
              Office Level
            </label>
            <select
              id="officeLevel"
              name="officeLevel"
              value={formData.officeLevel}
              onChange={handleChange}
              className="form-select"
            >
              {OFFICE_LEVELS.map((office) => (
                <option key={office.id} value={office.name}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 5: Category & Note */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
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
              <p className="error-message">Could not load categories: {categoriesError}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="note" className="form-label">
              Note
            </label>
            <select
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="form-select"
            >
              <option value={NOTE_PLACEHOLDER}>{NOTE_PLACEHOLDER}</option>
              {ACCOUNT_NOTES.map((note) => (
                <option key={note.id} value={note.name}>
                  {note.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit & Reset Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "10px 24px" }}
          >
            Save
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                parentCode: "",
                newCode: "",
                accountHead: "",
                level: 0,
                isTransaction: true,
                nature: "",
                module: DEFAULT_MODULE,
                officeLevel: DEFAULT_OFFICE_LEVEL,
                category: NOTE_PLACEHOLDER,
                note: NOTE_PLACEHOLDER,
              });
              setErrors({});
            }}
            className="btn btn-secondary"
            style={{ gap: "6px" }}
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
