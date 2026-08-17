"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface IncomeExpenditureReportByOfficeProps {
  onView?: (filters: {
    office: string;
    dateFrom: string;
    dateTo: string;
    accLevel: string;
  }) => void;
}

const formatDate = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return `${day}-${months[monthIndex]}-${year}`;
};

export default function IncomeExpenditureReportByOffice({
  onView,
}: IncomeExpenditureReportByOfficeProps) {
  const [office, setOffice] = useState("0001 GRAM");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [accLevel, setAccLevel] = useState("3");

  const fromPickerRef = useRef<HTMLInputElement>(null);

  const toPickerRef = useRef<HTMLInputElement>(null);

  const handleView = () => {
    const data = {
      office,
      dateFrom,
      dateTo,
      accLevel,
    };

    console.log("Income Expenditure Report By Office:", data);

    onView?.(data);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Breadcrumb / Page title is handled by Home.tsx */}

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleView();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Office */}
          <div className="form-group">
            <label htmlFor="office" className="form-label">
              Office
            </label>

            <select
              id="office"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="form-select"
            >
              <option value="0001 GRAM">
                0001 GRAM
              </option>

              <option value="0002 GRAM">
                0002 GRAM
              </option>

              <option value="0003 GRAM">
                0003 GRAM
              </option>
            </select>
          </div>

          {/* Date From */}
          <div className="form-group">
            <label
              htmlFor="incomeExpenseDateFrom"
              className="form-label"
            >
              Date From
            </label>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Display field */}
              <input
                type="text"
                id="incomeExpenseDateFrom"
                value={formatDate(dateFrom)}
                placeholder="dd-MMM-yyyy"
                readOnly
                className="form-input"
                style={{
                  paddingRight: "42px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  fromPickerRef.current?.showPicker()
                }
              />

              {/* Calendar button */}
              <button
                type="button"
                onClick={() =>
                  fromPickerRef.current?.showPicker()
                }
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
                  width: "22px",
                  height: "22px",
                }}
                aria-label="Select date from"
              >
                <Calendar size={17} />
              </button>

              {/* Actual date picker */}
              <input
                ref={fromPickerRef}
                type="date"
                value={dateFrom}
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="form-group">
            <label
              htmlFor="incomeExpenseDateTo"
              className="form-label"
            >
              Date To
            </label>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Display field */}
              <input
                type="text"
                id="incomeExpenseDateTo"
                value={formatDate(dateTo)}
                placeholder="dd-MMM-yyyy"
                readOnly
                className="form-input"
                style={{
                  paddingRight: "42px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  toPickerRef.current?.showPicker()
                }
              />

              {/* Calendar button */}
              <button
                type="button"
                onClick={() =>
                  toPickerRef.current?.showPicker()
                }
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
                  width: "22px",
                  height: "22px",
                }}
                aria-label="Select date to"
              >
                <Calendar size={17} />
              </button>

              {/* Actual date picker */}
              <input
                ref={toPickerRef}
                type="date"
                value={dateTo}
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Account Level */}
          <div className="form-group">
            <label
              htmlFor="incomeExpenseAccLevel"
              className="form-label"
            >
              Acc Level
            </label>

            <select
              id="incomeExpenseAccLevel"
              value={accLevel}
              onChange={(e) =>
                setAccLevel(e.target.value)
              }
              className="form-select"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* View Button */}
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "8px 16px",
              }}
            >
              View
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}