"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountData } from "@/components/AccountForm";
import {
  moduleLabel,
  officeLevelLabel,
  noteLabel,
  natureLabel,
  moduleByName,
  officeLevelByName,
  noteByName,
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
function toAccountData(row: any, index: number, notesList: any[]): AccountData {
  const noteId = row.noteID ?? row.NoteID;
  const foundNote = notesList.find((n: any) => Number(n.id) === noteId);
  const noteName = foundNote ? foundNote.noteName : "-";

  return {
    id: String(row.accID ?? row.AccID),
    sl: Number(row.accID ?? row.AccID ?? (index + 1)),
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
    note: noteName,
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
  saveAccount: (account: AccountData) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
}

/**
 * Maps an AccountData (frontend shape with label strings) back to the
 * AccChart entity shape the backend expects (numeric IDs).
 */
function toAccChartPayload(account: AccountData, notesList: any[]) {
  const NATURE_REVERSE: Record<string, string> = {
    Debit: "1",
    Credit: "2",
  };

  // Map category name → ID (matches AccCategory table)
  const CATEGORY_IDS: Record<string, number> = {
    Assets: 1,
    Liability: 2,
    Expenditure: 3,
    Income: 4,
  };

  const foundNote = notesList.find((n: any) => n.noteName === account.note);

  return {
    AccCode: account.newCode,
    AccName: account.accountHead,
    AccLevel: account.level ?? null,
    CategoryID: CATEGORY_IDS[account.category] ?? null,
    OfficeLevel: officeLevelByName(account.officeLevel)?.id ?? null,
    IsTransaction: account.isTransaction ?? false,
    Nature: NATURE_REVERSE[account.nature] ?? null,
    ModuleID: moduleByName(account.module)?.id ?? null,
    NoteID: foundNote ? Number(foundNote.id) : null,
    OrgID: 1,
    IsActive: true,
    CreateUser: "suser_sname()",
    CreateDate: new Date().toISOString(),
  };
}

/**
 * Loads the chart of accounts from /api/accounts.
 *
 * setAccounts is exposed so the existing create/edit/delete handlers keep
 * working against local state until those paths are wired to the API.
 */
export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch("http://localhost:5201/api/AccCharts");
        const json = await res.json();

        const notesRes = await fetch("http://localhost:5201/api/AccNotes");
        const notesJson = await notesRes.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          const notesList = (notesJson.success && Array.isArray(notesJson.data)) ? notesJson.data : [];
          setNotes(notesList);

          setAccounts((json.data as AccChartRow[]).map((row, idx) => toAccountData(row, idx, notesList)));
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

  const saveAccount = async (account: AccountData): Promise<boolean> => {
    try {
      // A real AccID from the database is always a positive integer.
      // Anything else (random string from the form, "0", empty) = new record → POST.
      const accId = parseInt(account.id, 10);
      const isEdit = !isNaN(accId) && accId > 0;
      const payload = toAccChartPayload(account, notes);

      let res: Response;
      if (isEdit) {
        res = await fetch(`http://localhost:5201/api/AccCharts/${account.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, AccID: Number(account.id) }),
        });
      } else {
        res = await fetch("http://localhost:5201/api/AccCharts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success || res.status === 201) {
        reload();
        return true;
      } else {
        console.error("Save account failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Save account error:", err);
      return false;
    }
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/AccCharts/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Delete account failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Delete account error:", err);
      return false;
    }
  };

  return { accounts, setAccounts, loading, error, reload, saveAccount, deleteAccount };
}
