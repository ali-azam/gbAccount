"use client";

/**
 * Date handling for the report screens.
 *
 * The report forms show dates as dd-MMM-yyyy, which is what the legacy
 * reports print and what toApiDate in reportFile converts back for the
 * API. These are the pieces that produce that form.
 */

export const MONTHS = [
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

/** yyyy-MM-dd, as a native date input gives it, to dd-MMM-yyyy. */
export const formatDateString = (rawDate: string) => {
  if (!rawDate) return "";

  const parts = rawDate.split("-");

  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];

    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day.padStart(2, "0")}-${MONTHS[monthIndex]}-${year}`;
    }
  }

  return rawDate;
};

export const today = () => {
  const d = new Date();

  return `${String(d.getDate()).padStart(2, "0")}-${
    MONTHS[d.getMonth()]
  }-${d.getFullYear()}`;
};
