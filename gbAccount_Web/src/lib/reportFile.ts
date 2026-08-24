"use client";

/**
 * Shared plumbing for every report screen that downloads a file from the
 * API.
 *
 * All the report endpoints have the same three awkward bits: the forms show
 * dates as dd-MMM-yyyy while the API binds yyyy-MM-dd, failures come back as
 * ProblemDetails JSON rather than a sentence, and a successful response is a
 * file that the browser has to be talked into opening or saving. Keeping
 * that here stops each report page from growing its own copy.
 */

export const API_BASE_URL = "https://localhost:7201";

const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** The only two output formats the report endpoints can produce. */
export const REPORT_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
];

// Maps onto the API's export format enums, which all share these names.
const API_FORMATS: Record<string, string> = {
  pdf: "Pdf",
  excel: "Excel",
};

/**
 * The API's enum name for a dropdown value, or undefined when nothing
 * valid is selected.
 */
export const apiFormat = (reportType: string) => API_FORMATS[reportType];

/** "PDF" / "Excel" for button text. */
export const formatLabel = (reportType: string) =>
  reportType === "excel" ? "Excel" : "PDF";

/** dd-MMM-yyyy (what the forms show) back to yyyy-MM-dd (what the API binds). */
export const toApiDate = (displayDate: string) => {
  if (!displayDate) return "";

  const parts = displayDate.split("-");

  if (parts.length !== 3) {
    return "";
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

  return `${year}-${month}-${day.padStart(2, "0")}`;
};

/**
 * The API reports failures as ProblemDetails, so a raw response body is
 * JSON rather than a sentence. Validation failures arrive as an `errors`
 * dictionary and business failures — such as "no ledger entries in that
 * range" — arrive in `detail`.
 */
export const readError = async (response: Response, subject = "report") => {
  const body = await response.text();

  if (!body) {
    return `Failed to generate the ${subject}. HTTP ${response.status}`;
  }

  try {
    const problem = JSON.parse(body);

    if (problem?.errors && typeof problem.errors === "object") {
      const messages = Object.values(
        problem.errors as Record<string, string[]>
      ).flat();

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return problem?.detail || problem?.title || body;
  } catch {
    return body;
  }
};

/**
 * Content-Disposition is only readable when the API is same-origin or
 * exposes the header, so a fallback name is always supplied.
 */
export const fileNameFrom = (response: Response, fallback: string) => {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

  return match ? decodeURIComponent(match[1]) : fallback;
};

/**
 * GETs a report export endpoint and hands the result to the browser: a PDF
 * opens in a new tab, an Excel workbook downloads. Throws with a message
 * that is safe to show, so the caller only has to put it on screen.
 *
 * `path` is the API path including the leading slash, `fileNameStem` names
 * the download when the API's own filename cannot be read, and `subject`
 * only appears if the failure came back with an empty body.
 */
export async function downloadReport(
  path: string,
  params: URLSearchParams,
  reportType: string,
  fileNameStem: string,
  subject = "report"
): Promise<void> {
  const isExcel = reportType === "excel";

  const response = await fetch(`${API_BASE_URL}${path}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: isExcel ? EXCEL_CONTENT_TYPE : "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response, subject));
  }

  const blob = await response.blob();
  const fileUrl = window.URL.createObjectURL(blob);

  if (isExcel) {
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = fileNameFrom(response, `${fileNameStem}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(fileUrl, "_blank");
  }

  // Revoking straight away would cancel the tab that is still loading it.
  setTimeout(() => {
    window.URL.revokeObjectURL(fileUrl);
  }, 10000);
}

/**
 * Reads a report's JSON so it can be shown on screen, using the same
 * ProblemDetails handling as the file downloads.
 */
export async function fetchReport<T>(
  path: string,
  params: URLSearchParams,
  subject = "report"
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readError(response, subject));
  }

  return (await response.json()) as T;
}

/**
 * The reports print two decimals with no thousands separators and wrap a
 * negative figure in parentheses rather than using a minus sign. The
 * on-screen tables follow suit so a printout and the screen can be read
 * side by side.
 */
export const formatAmount = (value: number) => {
  const text = Math.abs(value ?? 0).toFixed(2);

  return (value ?? 0) < 0 ? `(${text})` : text;
};

/** An ISO date from the API as the dd-MMM-yyyy the reports print. */
export const formatApiDate = (value: string) => {
  if (!value) return "";

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

  // The API sends a local DateTime with no zone, so the date part is taken
  // as written rather than pushed through the browser's timezone.
  const parts = value.slice(0, 10).split("-");

  if (parts.length !== 3) {
    return value;
  }

  const monthIndex = parseInt(parts[1], 10) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return `${parts[2]}-${months[monthIndex]}-${parts[0]}`;
};
