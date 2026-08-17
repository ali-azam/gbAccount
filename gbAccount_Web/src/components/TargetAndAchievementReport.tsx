"use client";

import React, { useState } from "react";

interface OfficeOption {
  value: string;
  label: string;
}

const HEAD_OFFICES: OfficeOption[] = [
  {
    value: "100000",
    label: "100000 GRAM Consolidated",
  },
];

const ZONE_OFFICES: OfficeOption[] = [
  {
    value: "01",
    label: "01 Shibchar",
  },
];

const AREA_OFFICES: OfficeOption[] = [
  {
    value: "101",
    label: "101 Sibchar",
  },
];

const BRANCH_OFFICES: OfficeOption[] = [
  {
    value: "0001",
    label: "0001 GRAM",
  },
];

const YEARS = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
];

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface ReportResult {
  headOffice: string;
  zoneOffice: string;
  areaOffice: string;
  branchOffice: string;
  year: string;
  month: string;
}

export default function TargetAndAchievementReport() {
  const [headOffice, setHeadOffice] = useState("100000");
  const [zoneOffice, setZoneOffice] = useState("01");
  const [areaOffice, setAreaOffice] = useState("101");
  const [branchOffice, setBranchOffice] = useState("0001");

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [result, setResult] = useState<ReportResult | null>(null);

  const handleView = () => {
    if (!year) {
      alert("Please select Year");
      return;
    }

    if (!month) {
      alert("Please select Month");
      return;
    }

    setResult({
      headOffice,
      zoneOffice,
      areaOffice,
      branchOffice,
      year,
      month,
    });
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
      {/* Report Form */}
      <div
        className="card"
        style={{
          maxWidth: "560px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Head Office */}
          <div className="form-group">
            <label htmlFor="headOffice" className="form-label">
              Head Office
            </label>

            <select
              id="headOffice"
              value={headOffice}
              onChange={(e) => setHeadOffice(e.target.value)}
              className="form-select"
            >
              {HEAD_OFFICES.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>
          </div>

          {/* Zone Office */}
          <div className="form-group">
            <label htmlFor="zoneOffice" className="form-label">
              Zone Office
            </label>

            <select
              id="zoneOffice"
              value={zoneOffice}
              onChange={(e) => setZoneOffice(e.target.value)}
              className="form-select"
            >
              {ZONE_OFFICES.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>
          </div>

          {/* Area Office */}
          <div className="form-group">
            <label htmlFor="areaOffice" className="form-label">
              Area Office
            </label>

            <select
              id="areaOffice"
              value={areaOffice}
              onChange={(e) => setAreaOffice(e.target.value)}
              className="form-select"
            >
              {AREA_OFFICES.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Office */}
          <div className="form-group">
            <label htmlFor="branchOffice" className="form-label">
              Branch Office
            </label>

            <select
              id="branchOffice"
              value={branchOffice}
              onChange={(e) => setBranchOffice(e.target.value)}
              className="form-select"
            >
              {BRANCH_OFFICES.map((office) => (
                <option key={office.value} value={office.value}>
                  {office.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="form-group">
            <label htmlFor="year" className="form-label">
              Year
            </label>

            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-select"
            >
              <option value="">Please Select</option>

              {YEARS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="form-group">
            <label htmlFor="month" className="form-label">
              Month
            </label>

            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-select"
            >
              <option value="">Please Select</option>

              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
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

      {/* Temporary Report Result */}
      {result && (
        <div className="card">
          <h2
            style={{
              margin: 0,
              marginBottom: "16px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Target And Achievement Report
          </h2>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Particular</th>
                  <th>Target</th>
                  <th>Achievement</th>
                  <th>Difference</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>No. of Samity</td>
                  <td>100</td>
                  <td>85</td>
                  <td>15</td>
                </tr>

                <tr>
                  <td>No. of Member</td>
                  <td>5,000</td>
                  <td>4,650</td>
                  <td>350</td>
                </tr>

                <tr>
                  <td>Total Service Charge Collection</td>
                  <td>100,000</td>
                  <td>92,500</td>
                  <td>7,500</td>
                </tr>

                <tr>
                  <td>Loan Disbursement</td>
                  <td>500,000</td>
                  <td>475,000</td>
                  <td>25,000</td>
                </tr>

                <tr>
                  <td>Loan Collection</td>
                  <td>400,000</td>
                  <td>380,000</td>
                  <td>20,000</td>
                </tr>

                <tr>
                  <td>Savings Collection</td>
                  <td>200,000</td>
                  <td>185,000</td>
                  <td>15,000</td>
                </tr>

                <tr>
                  <td>Savings Refund</td>
                  <td>100,000</td>
                  <td>82,000</td>
                  <td>18,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}