"use client";

import React, { useState, useEffect } from "react";
import { Check, RefreshCw } from "lucide-react";

export interface VoucherData {
  id: string;
  voucherNo: string;
  trxDate: string;
  transactionType: string;
  bankAccount: string;
  description: string;
  voucherType: string;
  account: string;
  debit: number;
  credit: number;
  reference: string;
  autoVoucher?: string;
  received?: boolean;
  createdAt: string;
  officeID?: number;
  zoneCode?: string;
}

interface VoucherFormProps {
  onSaveVoucher: (voucher: VoucherData) => void;
  onBackToList: () => void;
  initialData?: VoucherData | null;
}

export default function VoucherForm({ onSaveVoucher, onBackToList, initialData }: VoucherFormProps) {
  const [formData, setFormData] = useState({
    trxDate: new Date().toISOString().split("T")[0],
    transactionType: "Cash",
    bankAccount: "",
    description: "",
    voucherType: "Debit",
    account: "",
    debit: 0,
    credit: 0,
    reference: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        trxDate: initialData.trxDate,
        transactionType: initialData.transactionType,
        bankAccount: initialData.bankAccount,
        description: initialData.description,
        voucherType: initialData.voucherType,
        account: initialData.account,
        debit: initialData.debit,
        credit: initialData.credit,
        reference: initialData.reference,
      });
    } else {
      setFormData({
        trxDate: new Date().toISOString().split("T")[0],
        transactionType: "Cash",
        bankAccount: "",
        description: "",
        voucherType: "Debit",
        account: "",
        debit: 0,
        credit: 0,
        reference: "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "voucherType") {
      setFormData((prev) => ({
        ...prev,
        voucherType: value,
        debit: value === "Debit" ? prev.debit : 0,
        credit: value === "Credit" ? prev.credit : 0,
      }));
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
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveVoucherData = () => {
    const newVoucher: VoucherData = {
      ...formData,
      id: initialData ? initialData.id : Date.now().toString(),
      voucherNo: initialData ? initialData.voucherNo : `VCH-${Math.floor(100000 + Math.random() * 900000)}`,
      autoVoucher: initialData?.autoVoucher || "No",
      createdAt: initialData ? initialData.createdAt : new Date().toLocaleDateString(),
    };
    onSaveVoucher(newVoucher);
    return newVoucher;
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;

    saveVoucherData();

    setToastMessage("Voucher entry successfully added to list!");
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    setFormData((prev) => ({
      ...prev,
      bankAccount: "",
      description: "",
      account: "",
      debit: 0,
      credit: 0,
      reference: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    saveVoucherData();
    onBackToList();
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
            type="button"
            onClick={onBackToList}
            className="toast-link"
          >
            View in List →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Row 1: Transaction Date & Bank Account */}
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label htmlFor="trxDate" className="form-label">
              Transaction Date
            </label>
            <input
              type="date"
              id="trxDate"
              name="trxDate"
              value={formData.trxDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginBottom: "12px" }}
            />

            <label htmlFor="transactionType" className="form-label">
              Transaction Type
            </label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Journal">Journal</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bankAccount" className="form-label">
              Bank Account
            </label>
            <input
              type="text"
              id="bankAccount"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              placeholder="Select bank account..."
              className="form-input"
              style={{ backgroundColor: "#f9fafb" }}
            />
          </div>
        </div>

        {/* Row 2: Description (Full Width) */}
        <div className="form-group form-group-full">
          <label htmlFor="description" className="form-label">
            Description <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter voucher description..."
            className="form-input"
            style={{ borderColor: errors.description ? "#d9534f" : "" }}
          />
          {errors.description && (
            <p className="error-message">{errors.description}</p>
          )}
        </div>

        {/* Row 3: Voucher Type & Account */}
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label htmlFor="voucherType" className="form-label">
              Voucher Type
            </label>
            <select
              id="voucherType"
              name="voucherType"
              value={formData.voucherType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="account" className="form-label">
              Account
            </label>
            <input
              type="text"
              id="account"
              name="account"
              value={formData.account}
              onChange={handleChange}
              placeholder="Select account..."
              className="form-input"
              style={{ backgroundColor: "#f9fafb" }}
            />
          </div>
        </div>

        {/* Row 4: Debit & Credit */}
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label htmlFor="debit" className="form-label">
              Debit
            </label>
            <input
              type="number"
              id="debit"
              name="debit"
              value={formData.debit}
              onChange={handleChange}
              className="form-input"
              disabled={formData.voucherType !== "Debit"}
              style={{
                backgroundColor: formData.voucherType !== "Debit" ? "#f1f5f9" : "#ffffff",
                cursor: formData.voucherType !== "Debit" ? "not-allowed" : "default",
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="credit" className="form-label">
              Credit
            </label>
            <input
              type="number"
              id="credit"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              className="form-input"
              disabled={formData.voucherType !== "Credit"}
              style={{
                backgroundColor: formData.voucherType !== "Credit" ? "#f1f5f9" : "#ffffff",
                cursor: formData.voucherType !== "Credit" ? "not-allowed" : "default",
              }}
            />
          </div>
        </div>

        {/* Row 5: Reference */}
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label htmlFor="reference" className="form-label">
              Reference
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Enter reference..."
              className="form-input"
            />
          </div>
        </div>

        {/* Action Buttons: Add & Save */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary"
          >
            Add
          </button>
          
          <button
            type="submit"
            className="btn btn-info"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
