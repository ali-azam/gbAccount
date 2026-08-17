"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface TrialBalanceRow {
  accountCode: string;
  accountHead: string;
  debit: number;
  credit: number;
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

const today = () => {
  const d = new Date();

  const day = String(d.getDate()).padStart(2, "0");

  const monthNames = [
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

  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function TrialBalanceReport() {
  /*
   * ==========================================
   * FILTER STATE
   * ==========================================
   */

  const [headOffice, setHeadOffice] = useState(
    "100000 GRAM Consolidated"
  );

  const [zoneOffice, setZoneOffice] = useState(
    "01 Shibchar"
  );

  const [areaOffice, setAreaOffice] = useState(
    "101 Shibchar"
  );

  const [office, setOffice] = useState(
    "0001 GRAM"
  );

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

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

  const [results, setResults] =
    useState<TrialBalanceRow[] | null>(null);

  const [loading, setLoading] = useState(false);

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
   * Current gbAccount repository does not yet
   * have a Trial Balance API endpoint.
   *
   * Therefore this uses sample data for now,
   * just like the existing report screens.
   * ==========================================
   */

  const handleView = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    /*
     * Temporary test data.
     *
     * No Number() / parseFloat() conversion is
     * being done here, so there is no NaN.
     */

    const hardCodedResults: TrialBalanceRow[] = [
      {
        accountCode: "1001",
        accountHead: "Cash",
        debit: 25000,
        credit: 0,
      },
      {
        accountCode: "1002",
        accountHead: "Bank Account",
        debit: 50000,
        credit: 0,
      },
      {
        accountCode: "2001",
        accountHead: "Accounts Payable",
        debit: 0,
        credit: 30000,
      },
      {
        accountCode: "3001",
        accountHead: "Capital",
        debit: 0,
        credit: 45000,
      },
      {
        accountCode: "4001",
        accountHead: "Sales Revenue",
        debit: 0,
        credit: 40000,
      },
      {
        accountCode: "5001",
        accountHead: "Office Expenses",
        debit: 15000,
        credit: 0,
      },
    ];

    setResults(hardCodedResults);

    setLoading(false);
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

  /*
   * ==========================================
   * TOTALS
   * ==========================================
   */

  const totalDebit =
    results?.reduce(
      (total, row) => total + row.debit,
      0
    ) ?? 0;

  const totalCredit =
    results?.reduce(
      (total, row) => total + row.credit,
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
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* ======================================
          FILTER CARD
      ======================================= */}

      <div
        className="card"
        style={{
          maxWidth: "100%",
        }}
      >
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

          <div className="form-group">
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
              className="form-select"
            >
              <option value="100000 GRAM Consolidated">
                100000 GRAM Consolidated
              </option>

              <option value="100001 GRAM Head Office">
                100001 GRAM Head Office
              </option>

              <option value="100002 GRAM Regional Office">
                100002 GRAM Regional Office
              </option>
            </select>
          </div>

          {/* ================================
              ZONE OFFICE
          ================================= */}

          <div className="form-group">
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
              className="form-select"
            >
              <option value="01 Shibchar">
                01 Shibchar
              </option>

              <option value="02 Dhaka">
                02 Dhaka
              </option>

              <option value="03 Faridpur">
                03 Faridpur
              </option>
            </select>
          </div>

          {/* ================================
              AREA OFFICE
          ================================= */}

          <div className="form-group">
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
              className="form-select"
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

          <div className="form-group">
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
              DATE FROM
          ================================= */}

          <div className="form-group">
            <label
              htmlFor="dateFrom"
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
                id="dateFrom"
                value={dateFrom}
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

          <div className="form-group">
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

          <div className="form-group">
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
            style={{
              maxWidth: "350px",
            }}
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
              <option value="">
                Select
              </option>

              <option value="detail">
                Detail
              </option>

              <option value="summary">
                Summary
              </option>
            </select>
          </div>

          {/* ================================
              VIEW BUTTON
          ================================= */}

          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "View"}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================
          RESULTS
      ======================================= */}

      {results !== null && (
        <div
          className="card"
          style={{
            maxWidth: "100%",
          }}
        >
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Head</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>

              <tbody>
                {results.map((row) => (
                  <tr
                    key={row.accountCode}
                  >
                    <td>
                      {row.accountCode}
                    </td>

                    <td>
                      {row.accountHead}
                    </td>

                    <td>
                      {formatAmount(
                        row.debit
                      )}
                    </td>

                    <td>
                      {formatAmount(
                        row.credit
                      )}
                    </td>
                  </tr>
                ))}

                {/* TOTAL */}

                <tr>
                  <td
                    colSpan={2}
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    Total
                  </td>

                  <td
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(
                      totalDebit
                    )}
                  </td>

                  <td
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {formatAmount(
                      totalCredit
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