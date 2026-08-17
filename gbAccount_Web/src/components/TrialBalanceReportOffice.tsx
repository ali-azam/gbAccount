"use client";

import React, { useState } from "react";

interface Office {
  id: string;
  name: string;
}

const OFFICES: Office[] = [
  {
    id: "0001",
    name: "0001 GRAM",
  },
  {
    id: "0002",
    name: "0002 SHIBCHAR",
  },
  {
    id: "0003",
    name: "0003 MADARIPUR",
  },
];

const ACCOUNT_LEVELS = ["1", "2", "3", "4", "5"];

const REPORT_VIEWS = [
  {
    value: "detail",
    label: "Detail",
  },
  {
    value: "summary",
    label: "Summary",
  },
];

export default function TrialBalanceReportOffice() {
  const [office, setOffice] = useState("0001");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [accLevel, setAccLevel] = useState("5");

  const [exceptHeadOffice, setExceptHeadOffice] = useState(false);
  const [exceptProjectOffice, setExceptProjectOffice] = useState(false);

  const [reportView, setReportView] = useState("");

  const [showResult, setShowResult] = useState(false);

  const handleView = () => {
    if (!office) {
      alert("Please select Office");
      return;
    }

    if (!dateFrom) {
      alert("Please select Date From");
      return;
    }

    if (!dateTo) {
      alert("Please select Date To");
      return;
    }

    if (dateFrom > dateTo) {
      alert("Date From cannot be greater than Date To");
      return;
    }

    if (!reportView) {
      alert("Please select Report View");
      return;
    }

    setShowResult(true);
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Form */}
      <div className="card">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
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
              {OFFICES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} {item.name.replace(item.id, "").trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="form-group">
            <label htmlFor="dateFrom" className="form-label">
              Date From
            </label>

            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Date To */}
          <div className="form-group">
            <label htmlFor="dateTo" className="form-label">
              Date To
            </label>

            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Account Level */}
          <div className="form-group">
            <label htmlFor="accLevel" className="form-label">
              Acc Level
            </label>

            <select
              id="accLevel"
              value={accLevel}
              onChange={(e) => setAccLevel(e.target.value)}
              className="form-select"
            >
              {ACCOUNT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* View Button */}
          <div style={{ paddingTop: "2px" }}>
            <button
              type="button"
              onClick={handleView}
              className="btn btn-primary"
              style={{
                padding: "9px 18px",
              }}
            >
              View
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && (
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Trial Balance
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Office:{" "}
                <strong>
                  {OFFICES.find((x) => x.id === office)?.name}
                </strong>
              </p>

              <p
                style={{
                  margin: "3px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Date: {dateFrom} to {dateTo}
              </p>
            </div>
          </div>

          {/* Temporary result table */}
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
                <tr>
                  <td>1001</td>
                  <td>Cash</td>
                  <td>25,000.00</td>
                  <td>0.00</td>
                </tr>

                <tr>
                  <td>1002</td>
                  <td>Bank Account</td>
                  <td>50,000.00</td>
                  <td>0.00</td>
                </tr>

                <tr>
                  <td>2001</td>
                  <td>Accounts Payable</td>
                  <td>0.00</td>
                  <td>30,000.00</td>
                </tr>

                <tr>
                  <td>3001</td>
                  <td>Capital</td>
                  <td>0.00</td>
                  <td>45,000.00</td>
                </tr>

                <tr>
                  <td>4001</td>
                  <td>Sales Revenue</td>
                  <td>0.00</td>
                  <td>40,000.00</td>
                </tr>

                <tr>
                  <td>5001</td>
                  <td>Office Expenses</td>
                  <td>15,000.00</td>
                  <td>0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}