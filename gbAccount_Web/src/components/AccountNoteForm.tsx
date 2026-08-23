"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export interface AccountNoteData {
  id: string;
  sl?: number;
  noteNo: string;
  noteName: string;
  isActive: boolean;
  createdAt: string;
}

interface AccountNoteFormProps {
  onSaveNote: (note: AccountNoteData) => Promise<boolean>;
  onBackToList: () => void;
}

export default function AccountNoteForm({ onSaveNote, onBackToList }: AccountNoteFormProps) {
  const [formData, setFormData] = useState({
    noteNo: "",
    noteName: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    const newErrors: Record<string, string> = {};
    if (!formData.noteNo.trim()) newErrors.noteNo = "Note No is required";
    if (!formData.noteName.trim()) newErrors.noteName = "Note Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await onSaveNote({
      id: "", // API will generate the ID
      noteNo: formData.noteNo,
      noteName: formData.noteName,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    });

    if (success) {
      setToastMessage("Account note successfully created!");
      setFormData({
        noteNo: "",
        noteName: "",
      });
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
        {/* Note No */}
        <div className="form-group">
          <label htmlFor="noteNo" className="form-label" style={{ fontWeight: "bold" }}>
            Note No
          </label>
          <input
            type="text"
            id="noteNo"
            name="noteNo"
            value={formData.noteNo}
            onChange={handleChange}
            placeholder=""
            className="form-input"
            style={{ borderColor: errors.noteNo ? "#d9534f" : "" }}
          />
          {errors.noteNo && <p className="error-message">{errors.noteNo}</p>}
        </div>

        {/* Note Name */}
        <div className="form-group">
          <label htmlFor="noteName" className="form-label" style={{ fontWeight: "bold" }}>
            Note Name
          </label>
          <input
            type="text"
            id="noteName"
            name="noteName"
            value={formData.noteName}
            onChange={handleChange}
            placeholder=""
            className="form-input"
            style={{ borderColor: errors.noteName ? "#d9534f" : "" }}
          />
          {errors.noteName && <p className="error-message">{errors.noteName}</p>}
        </div>

        {/* Create Button */}
        <div className="form-actions" style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
          <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
