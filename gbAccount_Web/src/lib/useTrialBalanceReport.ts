"use client";

/**
 * The state behind a trial balance screen: fetching the report, exporting
 * the same report as a file, and laying its rows out for the table.
 *
 * The two trial balance screens have different forms — Trial Balance
 * filters down the office hierarchy, Office Trial Balance picks a single
 * office — so each owns its own fields and passes the query string in.
 * Everything after that is identical and lives here.
 */

import { useMemo, useState } from "react";

import {
  downloadTrialBalance,
  fetchTrialBalance,
  toApiDate,
  type TrialBalanceEndpoint,
} from "./trialBalanceExport";
import {
  buildOfficeBlocks,
  buildPrintedRows,
  type TrialBalanceReport,
} from "./trialBalance";

/** Which of the two reports a screen is showing. */
export type TrialBalanceWise = "account-code" | "office";

const ENDPOINTS: Record<TrialBalanceWise, TrialBalanceEndpoint> = {
  "account-code": "computed",
  office: "computed/office-wise",
};

/**
 * What was asked for, kept beside the report so the table stays labelled
 * with the figures it is actually showing rather than with whatever the
 * form has been changed to since.
 */
export interface TrialBalanceHeading {
  officeName: string;
  dateFrom: string;
  dateTo: string;
  accLevel: string;
  detail: boolean;
}

/**
 * Puts a validated date range on a query string, returning the message to
 * show when either date cannot be read.
 */
export function appendDateRange(
  params: URLSearchParams,
  dateFrom: string,
  dateTo: string
): string | null {
  const apiDateFrom = toApiDate(dateFrom);
  const apiDateTo = toApiDate(dateTo);

  if (!apiDateFrom) return "Please select a valid Date From.";
  if (!apiDateTo) return "Please select a valid Date To.";

  if (apiDateFrom > apiDateTo) {
    return "Date From cannot be greater than Date To.";
  }

  params.append("DateFrom", apiDateFrom);
  params.append("DateTo", apiDateTo);

  return null;
}

export function useTrialBalanceReport(wise: TrialBalanceWise) {
  const [report, setReport] = useState<TrialBalanceReport | null>(null);
  const [heading, setHeading] = useState<TrialBalanceHeading | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  /** GET /api/trial-balance-reports/computed[/office-wise] — on screen. */
  const view = async (
    params: URLSearchParams,
    requested: TrialBalanceHeading
  ) => {
    try {
      setLoading(true);

      const result = await fetchTrialBalance<TrialBalanceReport>(
        ENDPOINTS[wise],
        params
      );

      setReport(result);
      setHeading(requested);
    } catch (err) {
      console.error("TRIAL BALANCE ERROR:", err);

      setReport(null);
      setHeading(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the trial balance."
      );
    } finally {
      setLoading(false);
    }
  };

  /** The same report as a file. */
  const exportFile = async (
    params: URLSearchParams,
    reportType: string
  ) => {
    try {
      setGenerating(true);

      await downloadTrialBalance(ENDPOINTS[wise], params, reportType);
    } catch (err) {
      console.error("TRIAL BALANCE EXPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the trial balance report."
      );
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Office wise gets one block per office; account code wise consolidates
   * across them and so has a single unheaded block.
   */
  const sections = useMemo(() => {
    if (!report || !heading) return [];

    if (wise === "office") {
      return buildOfficeBlocks(report.rows, heading.detail);
    }

    return [
      {
        key: "consolidated",
        heading: null,
        rows: buildPrintedRows(report.rows, heading.detail),
      },
    ];
  }, [report, heading, wise]);

  return {
    report,
    heading,
    sections,
    loading,
    generating,
    busy: loading || generating,
    error,
    setError,
    view,
    exportFile,
  };
}
