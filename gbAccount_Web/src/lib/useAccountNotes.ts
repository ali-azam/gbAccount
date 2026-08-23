"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountNoteData } from "@/components/AccountNoteForm";

interface UseAccountNotesResult {
  accountNotes: AccountNoteData[];
  setAccountNotes: React.Dispatch<React.SetStateAction<AccountNoteData[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveAccountNote: (note: AccountNoteData) => Promise<boolean>;
  deleteAccountNote: (id: string) => Promise<boolean>;
}

export function useAccountNotes(): UseAccountNotesResult {
  const [accountNotes, setAccountNotes] = useState<AccountNoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const url = "http://localhost:5201/api/AccNotes";
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setAccountNotes(json.data);
          setError(null);
        } else {
          setError(json.message ?? "Failed to load account notes");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load account notes");
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

  const saveAccountNote = async (note: AccountNoteData): Promise<boolean> => {
    try {
      const noteId = parseInt(note.id, 10);
      const exists = !isNaN(noteId) && noteId > 0;
      
      const url = exists ? `http://localhost:5201/api/AccNotes/${note.id}` : "http://localhost:5201/api/AccNotes";
      const method = exists ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exists ? note.id : undefined,
          noteNo: note.noteNo,
          noteName: note.noteName,
          isActive: note.isActive
        }),
      });

      const json = await res.json();
      if (json.success || res.status === 201) {
        reload();
        return true;
      } else {
        console.error("Save account note failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Save account note error:", err);
      return false;
    }
  };

  const deleteAccountNote = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/AccNotes/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Delete account note failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Delete account note error:", err);
      return false;
    }
  };

  return { accountNotes, setAccountNotes, loading, error, reload, saveAccountNote, deleteAccountNote };
}
