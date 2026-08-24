"use client";

/**
 * Trial balance API calls.
 *
 * The download mechanics, date conversion and error reading are shared with
 * the other report screens and live in reportFile; this module only names
 * the trial balance endpoints. It re-exports the shared helpers so the trial
 * balance pages keep importing from one place.
 */

import { downloadReport, fetchReport } from "./reportFile";

export {
  REPORT_TYPES,
  apiFormat,
  formatAmount,
  formatApiDate,
  formatLabel,
  toApiDate,
} from "./reportFile";

/**
 * The "computed" endpoints read the vouchers; the other two read the
 * OLRSTrailBalance snapshot, which only holds month-end dates for one
 * consolidated office. Anything that filters by office or by date range
 * has to use a computed endpoint.
 */
export type TrialBalanceEndpoint =
  | "acc-code-wise"
  | "office-wise"
  | "computed"
  | "computed/office-wise";

/** Slashes cannot go in a filename, so each endpoint names its own stem. */
const FILE_NAME_STEMS: Record<TrialBalanceEndpoint, string> = {
  "acc-code-wise": "trial-balance-acc-code-wise",
  "office-wise": "trial-balance-office-wise",
  computed: "trial-balance",
  "computed/office-wise": "trial-balance-office-wise",
};

const path = (endpoint: TrialBalanceEndpoint) =>
  `/api/trial-balance-reports/${endpoint}`;

/**
 * Calls
 *
 * GET /api/trial-balance-reports/{endpoint}
 *
 * and returns the report as JSON. Throws with a message that is safe to
 * show, so the caller only has to put it on screen.
 */
export async function fetchTrialBalance<T>(
  endpoint: TrialBalanceEndpoint,
  params: URLSearchParams
): Promise<T> {
  return fetchReport<T>(path(endpoint), params, "trial balance");
}

/**
 * Calls
 *
 * GET /api/trial-balance-reports/{endpoint}/export
 *
 * and hands the result to the browser: a PDF opens in a new tab, an Excel
 * workbook downloads. Throws with a message that is safe to show, so the
 * caller only has to put it on screen.
 */
export async function downloadTrialBalance(
  endpoint: TrialBalanceEndpoint,
  params: URLSearchParams,
  reportType: string
): Promise<void> {
  return downloadReport(
    `${path(endpoint)}/export`,
    params,
    reportType,
    FILE_NAME_STEMS[endpoint],
    "trial balance"
  );
}
