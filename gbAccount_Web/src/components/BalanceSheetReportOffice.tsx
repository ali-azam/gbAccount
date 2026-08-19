"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface Office {
  id: string;
  name: string;
}

interface BalanceSheetOfficeRow {
  accountCode: string;
  accountHead: string;
  amount: number;
}

const OFFICES: Office[] = [
  { id: "0001", name: "0001 GRAM" },
  { id: "0002", name: "0002 SHIBCHAR" },
  { id: "0003", name: "0003 MADARIPUR" },
];

const ACCOUNT_LEVELS = ["1", "2", "3", "4", "5"];

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

export default function BalanceSheetReportOffice() {
  /*
   * ==========================================
   * FILTER STATE
   * ==========================================
   */

  const [office, setOffice] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [accLevel, setAccLevel] = useState("3");

  /*
   * ==========================================
   * REPORT STATE
   * ==========================================
   */

  const [assets, setAssets] =
    useState<BalanceSheetOfficeRow[] | null>(null);

  const [liabilities, setLiabilities] =
    useState<BalanceSheetOfficeRow[] | null>(null);

  const [error, setError] = useState("");

  /*
   * ==========================================
   * DATE PICKER
   * ==========================================
   */

  const toPickerRef =
    useRef<HTMLInputElement>(null);

  /*
   * ==========================================
   * VIEW REPORT
   *
   * The gbAccount API does not expose a Balance
   * Sheet endpoint yet, so this uses sample data
   * like the other report screens.
   * ==========================================
   */

  const handleView = (e: React.FormEvent) => {
    e.preventDefault();

    if (!office) {
      setError("Please select an Office");
      return;
    }

    if (!dateTo) {
      setError("Please select Date To");
      return;
    }

    setError("");

    setAssets([
      {
        accountCode: "1001",
        accountHead: "Cash In Hand",
        amount: 42000,
      },
      {
        accountCode: "1002",
        accountHead: "Cash At Bank",
        amount: 168000,
      },
      {
        accountCode: "1101",
        accountHead: "Loan To Members",
        amount: 512000,
      },
      {
        accountCode: "1201",
        accountHead: "Fixed Assets",
        amount: 96000,
      },
    ]);

    setLiabilities([
      {
        accountCode: "2001",
        accountHead: "Member Savings",
        amount: 384000,
      },
      {
        accountCode: "2101",
        accountHead: "Loan From Head Office",
        amount: 210000,
      },
      {
        accountCode: "3001",
        accountHead: "Capital Fund",
        amount: 168000,
      },
      {
        accountCode: "3101",
        accountHead: "Retained Surplus",
        amount: 56000,
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

  const totalAssets =
    assets?.reduce(
      (total, row) => total + row.amount,
      0
    ) ?? 0;

  const totalLiabilities =
    liabilities?.reduce(
      (total, row) => total + row.amount,
      0
    ) ?? 0;

  const showResult = assets !== null;

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
              OFFICE
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="officeBs"
              className="form-label"
            >
              Office
            </label>

            <select
              id="officeBs"
              value={office}
              onChange={(e) =>
                setOffice(e.target.value)
              }
              className="form-select"
            >
              <option value=""></option>

              {OFFICES.map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* ================================
              DATE TO
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="dateToBs"
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
                id="dateToBs"
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

          {/* ================================
              ACC LEVEL
          ================================= */}

          <div className="form-group form-group-full">
            <label
              htmlFor="accLevelBs"
              className="form-label"
            >
              Acc Level
            </label>

            <select
              id="accLevelBs"
              value={accLevel}
              onChange={(e) =>
                setAccLevel(e.target.value)
              }
              className="form-select"
            >
              {ACCOUNT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
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

      {showResult && (
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Balance Sheet
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Office: <strong>{office}</strong> / As on{" "}
              {dateTo} / Acc Level {accLevel}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Head</th>
                  <th style={{ textAlign: "right" }}>
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={3}
                    style={{ fontWeight: 700 }}
                  >
                    Assets
                  </td>
                </tr>

                {assets?.map((row) => (
                  <tr key={row.accountCode}>
                    <td>{row.accountCode}</td>
                    <td>{row.accountHead}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatAmount(row.amount)}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td
                    colSpan={2}
                    style={{ fontWeight: 700 }}
                  >
                    Total Assets
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(totalAssets)}
                  </td>
                </tr>

                <tr>
                  <td
                    colSpan={3}
                    style={{ fontWeight: 700 }}
                  >
                    Liabilities &amp; Capital
                  </td>
                </tr>

                {liabilities?.map((row) => (
                  <tr key={row.accountCode}>
                    <td>{row.accountCode}</td>
                    <td>{row.accountHead}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatAmount(row.amount)}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td
                    colSpan={2}
                    style={{ fontWeight: 700 }}
                  >
                    Total Liabilities &amp; Capital
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(totalLiabilities)}
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
