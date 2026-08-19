"use client";

import { useCallback, useEffect, useState } from "react";
import type { BudgetParticularData } from "@/components/BudgetParticular";

interface UseBudgetParticularsResult {
  particulars: BudgetParticularData[];
  setParticulars: React.Dispatch<React.SetStateAction<BudgetParticularData[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveParticular: (name: string) => Promise<boolean>;
  updateParticular: (id: string, name: string) => Promise<boolean>;
  deleteParticular: (id: string) => Promise<boolean>;
}

export function useBudgetParticulars(): UseBudgetParticularsResult {
  const [particulars, setParticulars] = useState<BudgetParticularData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const url = "http://localhost:5201/api/BudgetParticulars";
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setParticulars(json.data);
          setError(null);
        } else {
          setError(json.message ?? "Failed to load budget particulars");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load budget particulars");
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

  const saveParticular = async (name: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5201/api/BudgetParticulars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ particularName: name }),
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Save particular failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Save particular error:", err);
      return false;
    }
  };

  const updateParticular = async (id: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/BudgetParticulars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ particularName: name }),
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Update particular failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Update particular error:", err);
      return false;
    }
  };

  const deleteParticular = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/BudgetParticulars/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Delete particular failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Delete particular error:", err);
      return false;
    }
  };

  return {
    particulars,
    setParticulars,
    loading,
    error,
    reload,
    saveParticular,
    updateParticular,
    deleteParticular,
  };
}
