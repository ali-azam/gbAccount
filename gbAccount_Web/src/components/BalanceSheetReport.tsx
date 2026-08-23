"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface BalanceSheetRow {
  accountCode: string;
  accountHead: string;
  amount: number;
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

export default function BalanceSheetReport() {
  /*
   * ==========================================
   * FILTER STATE
   * ==========================================
   */

  const [headOffice, setHeadOffice] = useState(
    "100000 GRAM Consolidated"
  );

  const [reportMode, setReportMode] = useState<
    "zone" | "project"
  >("zone");

  const [zoneOffice, setZoneOffice] = useState(
    "01 Shibchar"
  );

  const [areaOffice, setAreaOffice] = useState(
    "101 Shibchar"
  );

  const [office, setOffice] = useState(
    "0001 GRAM"
  );

  const [dateTo, setDateTo] = useState("");

  const [accLevel, setAccLevel] = useState("3");

  const [exceptHeadOffice, setExceptHeadOffice] =
    useState(false);

  const [exceptProjectOffice, setExceptProjectOffice] =
    useState(false);

  const [reportView, setReportView] = useState("");

  /*
   * ==========================================
   * REPORT STATE
   * ==========================================
   */

  const [assets, setAssets] =
    useState<BalanceSheetRow[] | null>(null);

  const [liabilities, setLiabilities] =
    useState<BalanceSheetRow[] | null>(null);

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

    if (!dateTo) {
      setError("Please select Date To");
      return;
    }

    if (!reportView) {
      setError("Please select Report View");
      return;
    }

    setError("");

    setAssets([
      {
        accountCode: "1001",
        accountHead: "Cash In Hand",
        amount: 125000,
      },
      {
        accountCode: "1002",
        accountHead: "Cash At Bank",
        amount: 480000,
      },
      {
        accountCode: "1101",
        accountHead: "Loan To Members",
        amount: 1250000,
      },
      {
        accountCode: "1201",
        accountHead: "Fixed Assets",
        amount: 320000,
      },
    ]);

    setLiabilities([
      {
        accountCode: "2001",
        accountHead: "Member Savings",
        amount: 960000,
      },
      {
        accountCode: "2101",
        accountHead: "Loan From Head Office",
        amount: 415000,
      },
      {
        accountCode: "3001",
        accountHead: "Capital Fund",
        amount: 620000,
      },
      {
        accountCode: "3101",
        accountHead: "Retained Surplus",
        amount: 180000,
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
        display: "flex",
        flexDirection: "column",
        gap: "16px",
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
            gap: "16px",
          }}
        >
          {/* ================================
              HEAD OFFICE
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="headOffice"
              className="form-label"
            >
              Head Office
            </label>

            <select
              id="headOffice"
              value={headOffice}
              onChange={(e) =>
                setHeadOffice(e.target.value)
              }
              className="form-select bg-disabled"
              disabled
            >
              <option value="100000 GRAM Consolidated">
                100000 GRAM Consolidated
              </option>

              <option value="100001 GRAM Head Office">
                100001 GRAM Head Office
              </option>
            </select>
          </div>

          {/* ================================
              REPORT MODE
          ================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginTop: "-4px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="balanceSheetMode"
                value="zone"
                checked={reportMode === "zone"}
                onChange={() =>
                  setReportMode("zone")
                }
              />

              <span>Zone Wise</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="balanceSheetMode"
                value="project"
                checked={reportMode === "project"}
                onChange={() =>
                  setReportMode("project")
                }
              />

              <span>Program/Project</span>
            </label>
          </div>

          {/* ================================
              ZONE OFFICE
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="zoneOffice"
              className="form-label"
            >
              Zone Office
            </label>

            <select
              id="zoneOffice"
              value={zoneOffice}
              onChange={(e) =>
                setZoneOffice(e.target.value)
              }
              className={`form-select ${
                reportMode === "project"
                  ? "bg-disabled"
                  : ""
              }`}
              disabled={reportMode === "project"}
            >
              <option value="01 Shibchar">
                01 Shibchar
              </option>

              <option value="02 Madaripur">
                02 Madaripur
              </option>

              <option value="03 Faridpur">
                03 Faridpur
              </option>
            </select>
          </div>

          {/* ================================
              AREA OFFICE
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="areaOffice"
              className="form-label"
            >
              Area Office
            </label>

            <select
              id="areaOffice"
              value={areaOffice}
              onChange={(e) =>
                setAreaOffice(e.target.value)
              }
              className={`form-select ${
                reportMode === "project"
                  ? "bg-disabled"
                  : ""
              }`}
              disabled={reportMode === "project"}
            >
              <option value="101 Shibchar">
                101 Shibchar
              </option>

              <option value="102 Madaripur">
                102 Madaripur
              </option>

              <option value="103 Rajoir">
                103 Rajoir
              </option>
            </select>
          </div>

          {/* ================================
              OFFICE
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="office"
              className="form-label"
            >
              Office
            </label>

            <select
              id="office"
              value={office}
              onChange={(e) =>
                setOffice(e.target.value)
              }
              className="form-select"
            >
              <option value="0001 GRAM">
                0001 GRAM
              </option>

              <option value="0002 Shibchar">
                0002 Shibchar
              </option>

              <option value="0003 Madaripur">
                0003 Madaripur
              </option>
            </select>
          </div>

          {/* ================================
              DATE TO
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="dateTo"
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
                id="dateTo"
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

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="accLevel"
              className="form-label"
            >
              Acc Level
            </label>

            <select
              id="accLevel"
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

          {/* ================================
              EXCEPT HEAD OFFICE
          ================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "50px",
            }}
          >
            <input
              type="checkbox"
              id="exceptHeadOffice"
              checked={exceptHeadOffice}
              onChange={(e) =>
                setExceptHeadOffice(
                  e.target.checked
                )
              }
            />

            <label
              htmlFor="exceptHeadOffice"
              className="form-label"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              Except HeadOffice
            </label>
          </div>

          {/* ================================
              EXCEPT PROJECT OFFICE
          ================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "50px",
            }}
          >
            <input
              type="checkbox"
              id="exceptProjectOffice"
              checked={exceptProjectOffice}
              onChange={(e) =>
                setExceptProjectOffice(
                  e.target.checked
                )
              }
            />

            <label
              htmlFor="exceptProjectOffice"
              className="form-label"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              Except ProjectOffice
            </label>
          </div>

          {/* ================================
              REPORT VIEW
          ================================= */}

          <div
            className="form-group"
            style={{ maxWidth: "350px" }}
          >
            <label
              htmlFor="reportView"
              className="form-label"
            >
              Report View
            </label>

            <select
              id="reportView"
              value={reportView}
              onChange={(e) =>
                setReportView(e.target.value)
              }
              className="form-select"
            >
              <option value="">Select</option>

              <option value="detail">
                Detail
              </option>

              <option value="summary">
                Summary
              </option>
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
              {reportMode === "zone"
                ? `Zone: ${zoneOffice} / Area: ${areaOffice}`
                : "Program/Project wise"}{" "}
              / Office: <strong>{office}</strong>
            </p>

            <p
              style={{
                margin: "3px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              As on {dateTo} / Acc Level {accLevel}
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
