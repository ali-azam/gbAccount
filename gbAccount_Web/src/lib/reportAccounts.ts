/**
 * Chart of accounts helpers used by the report screens.
 *
 * These live apart from useAccounts so the account entry screens keep their
 * own loading and ordering behaviour untouched — reports only reshape the
 * list they are given for display.
 */

import type { AccountData } from "@/components/AccountForm";

/**
 * The accounts at one level, in ascending code order — what an Account Code
 * dropdown shows.
 *
 * /api/AccCharts returns the chart newest first, so a dropdown that lists it
 * as it arrives counts down from the highest code. Ordering happens here so
 * every report that offers an Account Code offers it the same way.
 *
 * Codes are compared numerically rather than as text so a shorter code sorts
 * before a longer one starting with the same digits.
 */
export const accountsAtLevel = (accounts: AccountData[], level: string) =>
  accounts
    .filter((account) => String(account.level) === level)
    .sort((a, b) =>
      a.newCode.localeCompare(b.newCode, undefined, { numeric: true })
    );
