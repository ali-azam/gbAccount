"use client";

import React, { useState, useEffect } from "react";
import { Check, RefreshCw } from "lucide-react";

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
  onSaveAccount: (account: AccountData) => void;
  onBackToList: () => void;
  initialData?: AccountData | null;
}

export default function AccountForm({ onSaveAccount, onBackToList, initialData }: AccountFormProps) {
  const [formData, setFormData] = useState({
    parentCode: "",
    newCode: "",
    accountHead: "",
    level: 0,
    isTransaction: true,
    nature: "",
    module: "Accounting",
    officeLevel: "Branch Office",
    category: "Please Select",
    note: "Please Select",
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
        module: "Accounting",
        officeLevel: "Branch Office",
        category: "Please Select",
        note: "Please Select",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const newAccount: AccountData = {
      ...formData,
      id: initialData ? initialData.id : Date.now().toString(),
      sl: initialData ? initialData.sl : undefined,
      first: formData.parentCode ? formData.parentCode : "-",
      second: formData.category !== "Please Select" ? formData.category : "-",
      third: formData.nature ? formData.nature : "-",
      fourth: "-",
      fifth: "-",
      createdAt: initialData ? initialData.createdAt : new Date().toLocaleDateString(),
    };

    onSaveAccount(newAccount);

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
      category: "Please Select",
      note: "Please Select",
    }));
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
              <option value="Accounting">Accounting</option>
              <option value="Inventory">Inventory</option>
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
              <option value="Payroll">Payroll</option>
              <option value="Fixed Assets">Fixed Assets</option>
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
              <option value="Branch Office">Branch Office</option>
              <option value="Head Office">Head Office</option>
              <option value="Regional Office">Regional Office</option>
              <option value="Zonal Office">Zonal Office</option>
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
              <option value="Please Select">Please Select</option>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
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
              <option value="Please Select">Please Select</option>
              <option value="General Ledger">General Ledger</option>
              <option value="Sub Ledger">Sub Ledger</option>
              <option value="Control Account">Control Account</option>
              <option value="Operating Account">Operating Account</option>
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
                module: "Accounting",
                officeLevel: "Branch Office",
                category: "Please Select",
                note: "Please Select",
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
