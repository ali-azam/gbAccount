"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountData } from "@/components/AccountForm";
import {
  moduleLabel,
  officeLevelLabel,
  noteLabel,
  natureLabel,
} from "./lookups";

/** Shape of an AccChart row as returned by /api/accounts. */
interface AccChartRow {
  AccID: number;
  AccCode: string;
  AccName: string | null;
  AccLevel: number | null;
  FirstLevel: string | null;
  SecondLevel: string | null;
  ThirdLevel: string | null;
  FourthLevel: string | null;
  FifthLevel: string | null;
  CategoryID: number | null;
  OfficeLevel: number | null;
  IsTransaction: boolean | null;
  Nature: string | null;
  ModuleID: number | null;
  NoteID: number | null;
  CreateDate: string | null;
  AccCategory?: { CategoryName: string | null } | null;
}

const dash = (value: string | null) => (value && value.trim() !== "" ? value : "-");

/**
 * Maps a database row onto the AccountData shape the UI components already use.
 * Code columns are resolved to labels here so the list and the edit modal both
 * see display text rather than raw integers.
 */
function toAccountData(row: any, index: number): AccountData {
  return {
    id: String(row.accID ?? row.AccID),
    sl: index + 1,
    parentCode: dash(row.firstLevel ?? row.FirstLevel),
    newCode: row.accCode ?? row.AccCode,
    accountHead: row.accName ?? row.AccName ?? "",
    level: row.accLevel ?? row.AccLevel ?? 0,
    first: dash(row.firstLevel ?? row.FirstLevel),
    second: dash(row.secondLevel ?? row.SecondLevel),
    third: dash(row.thirdLevel ?? row.ThirdLevel),
    fourth: dash(row.fourthLevel ?? row.FourthLevel),
    fifth: dash(row.fifthLevel ?? row.FifthLevel),
    isTransaction: row.isTransaction ?? row.IsTransaction ?? false,
    nature: natureLabel(row.nature ?? row.Nature),
    module: moduleLabel(row.moduleID ?? row.ModuleID),
    officeLevel: officeLevelLabel(row.officeLevel ?? row.OfficeLevel),
    category: row.accCategory?.categoryName ?? row.AccCategory?.CategoryName ?? "-",
    note: noteLabel(row.noteID ?? row.NoteID),
    createdAt: (row.createDate ?? row.CreateDate)
      ? new Date(row.createDate ?? row.CreateDate).toLocaleDateString()
      : "-",
  };
}

interface UseAccountsResult {
  accounts: AccountData[];
  setAccounts: React.Dispatch<React.SetStateAction<AccountData[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads the chart of accounts from /api/accounts.
 *
 * setAccounts is exposed so the existing create/edit/delete handlers keep
 * working against local state until those paths are wired to the API.
 */
export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setAccounts((json.data as AccChartRow[]).map(toAccountData));
          setError(null);
        } else {
          setError(json.message ?? "Failed to load accounts");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load accounts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { accounts, setAccounts, loading, error, reload };
}
