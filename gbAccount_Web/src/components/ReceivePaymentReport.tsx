"use client";

import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";

interface ReceivePaymentReportProps {
  onView?: (filters: {
    headOffice: string;
    reportMode: "zone" | "project";
    zoneOffice: string;
    areaOffice: string;
    office: string;
    dateFrom: string;
    dateTo: string;
    accLevel: string;
    exceptHeadOffice: boolean;
    exceptProjectOffice: boolean;
    reportView: string;
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

export default function ReceivePaymentReport({
  onView,
}: ReceivePaymentReportProps) {
  const [headOffice, setHeadOffice] = useState("100000 GRAM Consolidated");

  const [reportMode, setReportMode] = useState<"zone" | "project">("zone");

  const [zoneOffice, setZoneOffice] = useState("01 Shibchar");

  const [areaOffice, setAreaOffice] = useState("101 Sibchar");

  const [office, setOffice] = useState("0001 GRAM");

  const [dateFrom, setDateFrom] = useState("2026-08-10");

  const [dateTo, setDateTo] = useState("2026-08-10");

  const [accLevel, setAccLevel] = useState("3");

  const [exceptHeadOffice, setExceptHeadOffice] = useState(false);

  const [exceptProjectOffice, setExceptProjectOffice] =
    useState(false);

  const [reportView, setReportView] = useState("");

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  const handleView = () => {
    const data = {
      headOffice,
      reportMode,
      zoneOffice,
      areaOffice,
      office,
      dateFrom,
      dateTo,
      accLevel,
      exceptHeadOffice,
      exceptProjectOffice,
      reportView,
    };

    console.log("Receive Payment Report:", data);

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
              <option value="100000 GRAM Consolidated">
                100000 GRAM Consolidated
              </option>

              <option value="100001 GRAM">
                100001 GRAM
              </option>

              <option value="100002 GRAM">
                100002 GRAM
              </option>
            </select>
          </div>

          {/* Report Mode */}
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
                name="reportMode"
                value="zone"
                checked={reportMode === "zone"}
                onChange={() => setReportMode("zone")}
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
                name="reportMode"
                value="project"
                checked={reportMode === "project"}
                onChange={() => setReportMode("project")}
              />

              <span>Program/Project</span>
            </label>
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
              disabled={reportMode === "project"}
            >
              <option value="01 Shibchar">01 Shibchar</option>
              <option value="02 Madaripur">02 Madaripur</option>
              <option value="03 Faridpur">03 Faridpur</option>
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
              disabled={reportMode === "project"}
            >
              <option value="101 Sibchar">101 Sibchar</option>
              <option value="102 Madaripur">102 Madaripur</option>
              <option value="103 Rajoir">103 Rajoir</option>
            </select>
          </div>

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
              <option value="0001 GRAM">0001 GRAM</option>
              <option value="0002 GRAM">0002 GRAM</option>
              <option value="0003 GRAM">0003 GRAM</option>
            </select>
          </div>

          {/* Date From */}
          <div className="form-group">
            <label htmlFor="receiveDateFrom" className="form-label">
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
                id="receiveDateFrom"
                value={formatDate(dateFrom)}
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
                onChange={(e) => setDateFrom(e.target.value)}
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
            <label htmlFor="receiveDateTo" className="form-label">
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
                id="receiveDateTo"
                value={formatDate(dateTo)}
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
                onChange={(e) => setDateTo(e.target.value)}
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
            <label htmlFor="receiveAccLevel" className="form-label">
              Acc Level
            </label>

            <select
              id="receiveAccLevel"
              value={accLevel}
              onChange={(e) => setAccLevel(e.target.value)}
              className="form-select"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Except HeadOffice */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "64px",
              paddingLeft: "20px",
              marginTop: "2px",
            }}
          >
            <input
              type="checkbox"
              id="exceptHeadOffice"
              checked={exceptHeadOffice}
              onChange={(e) =>
                setExceptHeadOffice(e.target.checked)
              }
              style={{
                width: "14px",
                height: "14px",
                cursor: "pointer",
              }}
            />

            <label
              htmlFor="exceptHeadOffice"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Except HeadOffice
            </label>
          </div>

          {/* Except ProjectOffice */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "64px",
              paddingLeft: "20px",
              marginTop: "2px",
            }}
          >
            <input
              type="checkbox"
              id="exceptProjectOffice"
              checked={exceptProjectOffice}
              onChange={(e) =>
                setExceptProjectOffice(e.target.checked)
              }
              style={{
                width: "14px",
                height: "14px",
                cursor: "pointer",
              }}
            />

            <label
              htmlFor="exceptProjectOffice"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Except ProjectOffice
            </label>
          </div>

          {/* Report View */}
          <div
            className="form-group"
            style={{
              maxWidth: "353px",
              marginTop: "2px",
            }}
          >
            <label
              htmlFor="receiveReportView"
              className="form-label"
            >
              Report View
            </label>

            <select
              id="receiveReportView"
              value={reportView}
              onChange={(e) => setReportView(e.target.value)}
              className="form-select"
            >
              <option value="">Select</option>
              <option value="detail">Detail</option>
              <option value="summary">Summary</option>
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