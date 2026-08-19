"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface BudgetRow {
  accountCode: string;
  accountHead: string;
  budget: number;
  actual: number;
}

const formatDateString = (rawDate: string) => {
  if (!rawDate) return "";

  const parts = rawDate.split("-");

  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];

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

    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day.padStart(2, "0")}-${months[monthIndex]}-${year}`;
    }
  }

  return rawDate;
};

export default function BudgetReport() {
  /*
   * ==========================================
   * FILTER STATE
   *
   * The four office selects are resolved from
   * the logged in user's office hierarchy, so
   * they are shown read only, exactly like the
   * legacy Budget Report screen.
   * ==========================================
   */

  const [headOffice, setHeadOffice] = useState("");

  const [zoneOffice, setZoneOffice] = useState(
    "01 Shibchar"
  );

  const [areaOffice, setAreaOffice] = useState(
    "101 Shibchar"
  );

  const [office, setOffice] = useState(
    "0001 GRAM"
  );

  const [dateFrom, setDateFrom] = useState(
    "01-Jan-0001"
  );

  const [dateTo, setDateTo] = useState(
    "01-Jan-0001"
  );

  /*
   * ==========================================
   * REPORT STATE
   * ==========================================
   */

  const [results, setResults] =
    useState<BudgetRow[] | null>(null);

  const [error, setError] = useState("");

  /*
   * ==========================================
   * DATE PICKERS
   * ==========================================
   */

  const fromPickerRef =
    useRef<HTMLInputElement>(null);

  const toPickerRef =
    useRef<HTMLInputElement>(null);

  /*
   * ==========================================
   * VIEW REPORT
   *
   * The gbAccount API does not expose a Budget
   * endpoint yet, so this uses sample data like
   * the other report screens.
   * ==========================================
   */

  const handleView = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateFrom || !dateTo) {
      setError(
        "Please select both Date From and Date To"
      );
      return;
    }

    setError("");

    setResults([
      {
        accountCode: "4001",
        accountHead: "Service Charge Income",
        budget: 850000,
        actual: 792400,
      },
      {
        accountCode: "4002",
        accountHead: "Admission Fee",
        budget: 60000,
        actual: 64800,
      },
      {
        accountCode: "5001",
        accountHead: "Salary And Allowances",
        budget: 480000,
        actual: 468500,
      },
      {
        accountCode: "5002",
        accountHead: "Office Rent",
        budget: 96000,
        actual: 96000,
      },
      {
        accountCode: "5003",
        accountHead: "Travelling Expenses",
        budget: 54000,
        actual: 61200,
      },
    ]);
  };

  /*
   * ==========================================
   * NUMBER FORMAT
   * ==========================================
   */

  const formatAmount = (value: number) => {
    if (!Number.isFinite(value)) {
      return "0.00";
    }

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalBudget =
    results?.reduce(
      (total, row) => total + row.budget,
      0
    ) ?? 0;

  const totalActual =
    results?.reduce(
      (total, row) => total + row.actual,
      0
    ) ?? 0;

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* ======================================
          FILTER CARD
      ======================================= */}

      <div className="card">
        <form
          onSubmit={handleView}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* ================================
              HEAD OFFICE
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="headOfficeBudget"
              className="form-label"
            >
              Head Office
            </label>

            <select
              id="headOfficeBudget"
              value={headOffice}
              onChange={(e) =>
                setHeadOffice(e.target.value)
              }
              className="form-select bg-disabled"
              disabled
            >
              <option value=""></option>

              <option value="100000 GRAM Consolidated">
                100000 GRAM Consolidated
              </option>
            </select>
          </div>

          {/* ================================
              ZONE OFFICE
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="zoneOfficeBudget"
              className="form-label"
            >
              Zone Office
            </label>

            <select
              id="zoneOfficeBudget"
              value={zoneOffice}
              onChange={(e) =>
                setZoneOffice(e.target.value)
              }
              className="form-select bg-disabled"
              disabled
            >
              <option value="01 Shibchar">
                01 Shibchar
              </option>
            </select>
          </div>

          {/* ================================
              AREA OFFICE
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="areaOfficeBudget"
              className="form-label"
            >
              Area Office
            </label>

            <select
              id="areaOfficeBudget"
              value={areaOffice}
              onChange={(e) =>
                setAreaOffice(e.target.value)
              }
              className="form-select bg-disabled"
              disabled
            >
              <option value="101 Shibchar">
                101 Shibchar
              </option>
            </select>
          </div>

          {/* ================================
              OFFICE
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="officeBudget"
              className="form-label"
            >
              Office
            </label>

            <select
              id="officeBudget"
              value={office}
              onChange={(e) =>
                setOffice(e.target.value)
              }
              className="form-select bg-disabled"
              disabled
            >
              <option value="0001 GRAM">
                0001 GRAM
              </option>
            </select>
          </div>

          {/* ================================
              DATE FROM
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="dateFromBudget"
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
              <input
                type="text"
                id="dateFromBudget"
                value={dateFrom}
                placeholder="dd-MMM-yyyy"
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
                className="form-input"
                style={{
                  paddingRight: "36px",
                }}
              />

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
                  zIndex: 10,
                  width: "20px",
                  height: "20px",
                }}
              >
                <Calendar size={16} />
              </button>

              <input
                type="date"
                ref={fromPickerRef}
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
                  if (e.target.value) {
                    setDateFrom(
                      formatDateString(
                        e.target.value
                      )
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* ================================
              DATE TO
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="dateToBudget"
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
              <input
                type="text"
                id="dateToBudget"
                value={dateTo}
                placeholder="dd-MMM-yyyy"
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
                className="form-input"
                style={{
                  paddingRight: "36px",
                }}
              />

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
                  zIndex: 10,
                  width: "20px",
                  height: "20px",
                }}
              >
                <Calendar size={16} />
              </button>

              <input
                type="date"
                ref={toPickerRef}
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
                  if (e.target.value) {
                    setDateTo(
                      formatDateString(
                        e.target.value
                      )
                    );
                  }
                }}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* ================================
              VIEW BUTTON
          ================================= */}

          <div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "9px 18px",
              }}
            >
              View
            </button>
          </div>
        </form>
      </div>

      {/* ======================================
          RESULT CARD
      ======================================= */}

      {results !== null && (
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Budget Report
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Office: <strong>{office}</strong> /{" "}
              {dateFrom} to {dateTo}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Head</th>
                  <th style={{ textAlign: "right" }}>
                    Budget
                  </th>
                  <th style={{ textAlign: "right" }}>
                    Actual
                  </th>
                  <th style={{ textAlign: "right" }}>
                    Variance
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map((row) => (
                  <tr key={row.accountCode}>
                    <td>{row.accountCode}</td>
                    <td>{row.accountHead}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatAmount(row.budget)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatAmount(row.actual)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatAmount(
                        row.budget - row.actual
                      )}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td
                    colSpan={2}
                    style={{ fontWeight: 700 }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(totalBudget)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(totalActual)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(
                      totalBudget - totalActual
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
