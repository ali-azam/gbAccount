"use client";

/**
 * A report form's date field: a dd-MMM-yyyy text box that can still be
 * filled from the browser's own date picker.
 *
 * The text box is the real field — the reports have always accepted a
 * typed date and the exports print what was typed. The picker is a hidden
 * native date input that the calendar button opens, writing its choice
 * back in dd-MMM-yyyy.
 *
 * The older report screens still spell this out inline; new ones use this.
 */

import React, { useRef } from "react";
import { Calendar } from "lucide-react";

import { formatDateString } from "@/lib/reportDates";

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
}: DateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input"
          style={{ paddingRight: "36px" }}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => pickerRef.current?.showPicker()}
          disabled={disabled}
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
            height: "20px",
          }}
        >
          <Calendar size={16} />
        </button>
        <input
          type="date"
          ref={pickerRef}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            width: 0,
            height: 0,
            opacity: 0,
            border: "none",
            padding: 0,
            pointerEvents: "none",
          }}
          onChange={(e) => {
            if (e.target.value) onChange(formatDateString(e.target.value));
          }}
        />
      </div>
    </div>
  );
}
