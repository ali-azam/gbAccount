"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Check } from "lucide-react";

export interface BudgetData {
  id: string;
  budgetType: "Financial" | "Program";
  budgetYear: string;
  date: string;
  accountCode: string;
  amount: number;
  createdAt: string;
}

interface BudgetFormProps {
  onSaveBudget: (budget: BudgetData) => Promise<boolean>;
  onBackToList: () => void;
  initialData?: BudgetData | null;
}

export default function BudgetForm({ onSaveBudget, onBackToList, initialData }: BudgetFormProps) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        budgetType: initialData.budgetType,
        budgetYear: initialData.budgetYear,
        date: initialData.date || "01-Jan-0001",
        accountCode: initialData.accountCode,
        amount: initialData.amount.toString(),
      };
    }
    return {
      budgetType: "Financial" as "Financial" | "Program",
      budgetYear: "",
      date: "01-Jan-0001", // Match the default placeholder '01-Jan-0001' from screenshot
      accountCode: "",
      amount: "0.00",
    };
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        budgetType: initialData.budgetType,
        budgetYear: initialData.budgetYear,
        date: initialData.date || "01-Jan-0001",
        accountCode: initialData.accountCode,
        amount: initialData.amount.toString(),
      });
    } else {
      setFormData({
        budgetType: "Financial",
        budgetYear: "",
        date: "01-Jan-0001",
        accountCode: "",
        amount: "0.00",
      });
    }
  }, [initialData]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const datePickerRef = useRef<HTMLInputElement>(null);

  const formatDateString = (rawDate: string) => {
    if (!rawDate) return "";
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day.padStart(2, "0")}-${months[monthIndex]}-${year}`;
      }
    }
    return rawDate;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name] || errors.global) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        delete newErr.global;
        return newErr;
      });
    }
  };

  const handleRadioChange = (type: "Financial" | "Program") => {
    setFormData((prev) => ({
      ...prev,
      budgetType: type,
    }));
    if (errors.global) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.global;
        return newErr;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(formData.amount) || 0;

    // Basic Validation
    const newErrors: Record<string, string> = {};
    if (!formData.budgetYear) newErrors.budgetYear = "Budget Year is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.accountCode) newErrors.accountCode = "Account Code is required";
    if (parsedAmount < 0) newErrors.amount = "Amount cannot be negative";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await onSaveBudget({
      id: initialData ? initialData.id : Math.random().toString(36).substring(2, 9),
      budgetType: formData.budgetType,
      budgetYear: formData.budgetYear,
      date: formData.date,
      accountCode: formData.accountCode,
      amount: parsedAmount,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString().split("T")[0],
    });

    if (success) {
      setToastMessage(initialData ? "Budget record successfully updated!" : "Budget record successfully created!");
      setErrors({});
    } else {
      setErrors({ global: "Failed to save budget. Please check that the Account Code is valid." });
    }
  };

  return (
    <div className="card" style={{ maxWidth: "100%", position: "relative" }}>
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="toast-container" style={{ marginBottom: "20px" }}>
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
        {errors.global && (
          <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>
            {errors.global}
          </div>
        )}
        {/* Budget Type Radio Buttons */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "4px" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>
            <input
              type="radio"
              name="budgetType"
              checked={formData.budgetType === "Financial"}
              onChange={() => handleRadioChange("Financial")}
              className="form-checkbox"
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            Financial
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>
            <input
              type="radio"
              name="budgetType"
              checked={formData.budgetType === "Program"}
              onChange={() => handleRadioChange("Program")}
              className="form-checkbox"
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            Program
          </label>
        </div>

        {/* Budget Year */}
        <div className="form-group">
          <label htmlFor="budgetYear" className="form-label" style={{ fontWeight: "bold" }}>
            Budget Year
          </label>
          <input
            type="text"
            id="budgetYear"
            name="budgetYear"
            value={formData.budgetYear}
            onChange={handleChange}
            placeholder=""
            className="form-input"
          />
          {errors.budgetYear && <p className="error-message">{errors.budgetYear}</p>}
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date" className="form-label" style={{ fontWeight: "bold" }}>
            Date
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="01-Jan-0001"
              className="form-input"
              style={{ paddingRight: "36px" }}
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
              onChange={(e) => {
                if (e.target.value) {
                  const formatted = formatDateString(e.target.value);
                  setFormData((prev) => ({ ...prev, date: formatted }));
                  if (errors.date) {
                    setErrors((prev) => {
                      const newErr = { ...prev };
                      delete newErr.date;
                      return newErr;
                    });
                  }
                }
              }}
            />
          </div>
          {errors.date && <p className="error-message">{errors.date}</p>}
        </div>

        {/* Account Code */}
        <div className="form-group">
          <label htmlFor="accountCode" className="form-label" style={{ fontWeight: "bold" }}>
            Account Code
          </label>
          <input
            type="text"
            id="accountCode"
            name="accountCode"
            value={formData.accountCode}
            onChange={handleChange}
            placeholder=""
            className="form-input"
          />
          {errors.accountCode && <p className="error-message">{errors.accountCode}</p>}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label" style={{ fontWeight: "bold" }}>
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
          />
          {errors.amount && <p className="error-message">{errors.amount}</p>}
        </div>

        {/* Create Button */}
        <div className="form-actions" style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
          <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
