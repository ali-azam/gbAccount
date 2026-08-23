"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

const API_BASE_URL = "https://localhost:7201";

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

const toApiDate = (displayDate: string) => {
  if (!displayDate) return "";

  const parts = displayDate.split("-");

  if (parts.length !== 3) {
    return displayDate;
  }

  const day = parts[0];
  const monthName = parts[1];
  const year = parts[2];

  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = months[monthName];

  if (!month) {
    return "";
  }

  return `${year}-${month}-${day}`;
};

const today = () =>
  formatDateString(new Date().toISOString().split("T")[0]);

/*
 * Voucher type code -> display name.
 *
 * Mirrors GetVoucherTypeName in
 * GBWeb.Implementation.Infrastructure/Services/VoucherReportPdfService.cs
 * so the dropdown and the generated PDF use the same wording.
 */
const VOUCHER_TYPE_NAMES: Record<string, string> = {
  CA: "Cash Credit/Receipt Voucher",
  CAD: "Cash Debit/Payment Voucher",
  CAC: "Cash Credit/Receipt Voucher",
  BA: "Bank Transaction Voucher",
  BDR: "Bank Debit/Payment Voucher",
  BCR: "Bank Credit/Receipt Voucher",
  BC: "Bank (Cash) Voucher",
  JR: "Journal Voucher",
};

/*
 * Abbreviations expanded for any code that is not in the
 * map above. Voucher types come straight out of
 * AccTrxMaster.VoucherType, so the list is whatever the
 * data holds — not just the eight names the PDF knows.
 *
 * Ordered longest first so CSH is matched before CS or C,
 * and so DR / CR pick up the tail of a composite code.
 */
const VOUCHER_TYPE_TOKENS: ReadonlyArray<
  readonly [string, string]
> = [
  ["CSH", "Cash In Hand"],
  ["BNK", "Bank"],
  ["JRN", "Journal"],
  ["JR", "Journal"],
  ["BA", "Bank"],
  ["CA", "Cash"],
  ["CR", "Credit"],
  ["DR", "Debit"],
];

/*
 * Expand a code by consuming known abbreviations from the
 * left, e.g. CSHCR -> "Cash In Hand Credit". Returns null
 * when any part of the code is unrecognised, so the caller
 * can fall back to showing the code itself rather than a
 * half translated label.
 */
const expandVoucherTypeCode = (code: string) => {
  const words: string[] = [];

  let rest = code;

  while (rest.length > 0) {
    const token = VOUCHER_TYPE_TOKENS.find(
      ([abbreviation]) =>
        rest.startsWith(abbreviation)
    );

    if (!token) {
      return null;
    }

    words.push(token[1]);

    rest = rest.slice(token[0].length);
  }

  return words.length > 0
    ? words.join(" ")
    : null;
};

/*
 * Full form only — no codes. Note that CA and CAC share a
 * name in the backend mapping, so those two options read
 * identically in the dropdown.
 */
const getVoucherTypeLabel = (code: string) => {
  const normalized = code.trim().toUpperCase();

  return (
    VOUCHER_TYPE_NAMES[normalized] ??
    expandVoucherTypeCode(normalized) ??
    code
  );
};

export default function VoucherReport() {
  const [trxDate, setTrxDate] = useState(today);
  const [trxDateTo, setTrxDateTo] = useState(today);

  const [voucherTypes, setVoucherTypes] = useState<string[]>([]);
  const [voucherNumbers, setVoucherNumbers] = useState<string[]>([]);

  const [voucherType, setVoucherType] = useState("");
  const [voucherNo, setVoucherNo] = useState("");

  const [viewAll, setViewAll] = useState(false);

  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");

  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);

  /*
   * Load Voucher Types
   */
  useEffect(() => {
    const loadVoucherTypes = async () => {
      try {
        setLoadingTypes(true);
        setError("");

        const url =
          `${API_BASE_URL}/api/voucher-reports/voucher-types`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Voucher Types API failed: ${response.status}`
          );
        }

        const data: string[] = await response.json();

        setVoucherTypes(data);
      } catch (err) {
        console.error("VOUCHER TYPES ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load voucher types."
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    loadVoucherTypes();
  }, []);

  /*
   * Load Voucher Numbers
   *
   * Runs whenever:
   * - Date From changes
   * - Date To changes
   * - Voucher Type changes
   */
  useEffect(() => {
    if (viewAll) {
      setVoucherNumbers([]);
      return;
    }

    const loadVoucherNumbers = async () => {
      try {
        setLoadingNumbers(true);
        setError("");

        const dateFrom = toApiDate(trxDate);
        const dateTo = toApiDate(trxDateTo);

        if (!dateFrom || !dateTo) {
          setVoucherNumbers([]);
          return;
        }

        const params = new URLSearchParams();

        params.append("DateFrom", dateFrom);
        params.append("DateTo", dateTo);

        if (voucherType) {
          params.append("VoucherType", voucherType);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/voucher-reports/voucher-numbers?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load voucher numbers."
          );
        }

        const data: string[] = await response.json();

        setVoucherNumbers(data);

        /*
         * Clear Voucher No if it no longer exists
         * after changing the filters.
         */
        if (voucherNo && !data.includes(voucherNo)) {
          setVoucherNo("");
        }
      } catch (err) {
        console.error("VOUCHER NUMBERS ERROR:", err);

        setVoucherNumbers([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load voucher numbers."
        );
      } finally {
        setLoadingNumbers(false);
      }
    };

    loadVoucherNumbers();
  }, [
    trxDate,
    trxDateTo,
    voucherType,
    viewAll,
    voucherNo,
  ]);

  /*
   * VIEW / GENERATE PDF
   *
   * There is no report table anymore.
   *
   * Clicking View directly calls:
   *
   * GET /api/voucher-reports/pdf
   *
   * and opens the generated PDF.
   */
  const handleView = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoadingReport(true);
      setError("");

      const dateFrom = toApiDate(trxDate);
      const dateTo = toApiDate(trxDateTo);

      if (!dateFrom || !dateTo) {
        setError("Please select valid dates.");
        return;
      }

      if (dateFrom > dateTo) {
        setError(
          "Date From cannot be greater than Date To."
        );
        return;
      }

      /*
       * Build API parameters
       */
      const params = new URLSearchParams();

      params.append("DateFrom", dateFrom);
      params.append("DateTo", dateTo);

      if (voucherType) {
        params.append("VoucherType", voucherType);
      }

      if (!viewAll && voucherNo) {
        params.append("VoucherNo", voucherNo);
      }

      params.append(
        "ViewAllVoucher",
        viewAll ? "true" : "false"
      );

      /*
       * Call PDF endpoint
       */
      const response = await fetch(
        `${API_BASE_URL}/api/voucher-reports/pdf?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      /*
       * Handle API error
       */
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            `Failed to generate voucher report. HTTP ${response.status}`
        );
      }

      /*
       * Convert response to PDF Blob
       */
      const blob = await response.blob();

      /*
       * Create temporary browser URL
       */
      const pdfUrl = window.URL.createObjectURL(blob);

      /*
       * Open PDF in a new browser tab.
       */
      window.open(pdfUrl, "_blank");

      /*
       * Release the temporary URL later.
       */
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (err) {
      console.error("VOUCHER PDF ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate voucher report."
      );
    } finally {
      setLoadingReport(false);
    }
  };

  /*
   * View All Voucher
   */
  const handleViewAllChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;

    setViewAll(checked);

    if (checked) {
      setVoucherType("");
      setVoucherNo("");
      setVoucherNumbers([]);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* FILTER CARD */}
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
            gap: "4px",
          }}
        >
          {/* DATE FROM */}
          <div className="form-group">
            <label
              htmlFor="trxDate"
              className="form-label"
            >
              TrxDate
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
                id="trxDate"
                value={trxDate}
                onChange={(e) =>
                  setTrxDate(e.target.value)
                }
                disabled={viewAll}
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
                disabled={viewAll}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: viewAll
                    ? "default"
                    : "pointer",
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
                    setTrxDate(
                      formatDateString(
                        e.target.value
                      )
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* DATE TO */}
          <div className="form-group">
            <label
              htmlFor="trxDateTo"
              className="form-label"
            >
              TrxDateTo
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
                id="trxDateTo"
                value={trxDateTo}
                onChange={(e) =>
                  setTrxDateTo(e.target.value)
                }
                disabled={viewAll}
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
                disabled={viewAll}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: viewAll
                    ? "default"
                    : "pointer",
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
                    setTrxDateTo(
                      formatDateString(
                        e.target.value
                      )
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* VOUCHER TYPE */}
          <div className="form-group">
            <label
              htmlFor="voucherType"
              className="form-label"
            >
              Voucher Type
            </label>

            <select
              id="voucherType"
              value={voucherType}
              onChange={(e) => {
                setVoucherType(e.target.value);
                setVoucherNo("");
              }}
              disabled={
                viewAll || loadingTypes
              }
              className="form-select"
            >
              <option value="">
                {loadingTypes
                  ? "Loading..."
                  : "Please Select"}
              </option>

              {voucherTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getVoucherTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* VOUCHER NO */}
          <div className="form-group">
            <label
              htmlFor="voucherNo"
              className="form-label"
            >
              Voucher No
            </label>

            <select
              id="voucherNo"
              value={voucherNo}
              onChange={(e) =>
                setVoucherNo(e.target.value)
              }
              disabled={
                viewAll ||
                loadingNumbers ||
                !voucherType
              }
              className="form-select"
            >
              <option value="">
                {!voucherType
                  ? "Select Voucher Type First"
                  : loadingNumbers
                  ? "Loading..."
                  : "Please Select"}
              </option>

              {voucherNumbers.map((no) => (
                <option
                  key={no}
                  value={no}
                >
                  {no}
                </option>
              ))}
            </select>
          </div>

          {/* VIEW ALL */}
          <label
            className="form-checkbox-container"
            style={{
              marginTop: "8px",
            }}
          >
            <input
              type="checkbox"
              checked={viewAll}
              onChange={handleViewAllChange}
              className="form-checkbox"
            />

            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              View All Voucher
            </span>
          </label>

          {/* ERROR */}
          {error && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 10px",
                borderRadius: "4px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* VIEW BUTTON */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "8px 20px",
              }}
              disabled={loadingReport}
            >
              {loadingReport
                ? "Generating PDF..."
                : "View"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}