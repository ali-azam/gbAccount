"use client";

import { useCallback, useEffect, useState } from "react";
import type { BudgetData } from "@/components/BudgetForm";

interface UseBudgetsResult {
  budgets: BudgetData[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetData[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveBudget: (budget: BudgetData) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
}

export function useBudgets(): UseBudgetsResult {
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const url = "http://localhost:5201/api/Budgets";
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setBudgets(json.data);
          setError(null);
        } else {
          setError(json.message ?? "Failed to load budgets");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load budgets");
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

  const saveBudget = async (budget: BudgetData): Promise<boolean> => {
    try {
      const exists = budgets.some((b) => b.id === budget.id);
      const url = exists ? `http://localhost:5201/api/Budgets/${budget.id}` : "http://localhost:5201/api/Budgets";
      const method = exists ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Save budget failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Save budget error:", err);
      return false;
    }
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/Budgets/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Delete budget failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Delete budget error:", err);
      return false;
    }
  };

  return { budgets, setBudgets, loading, error, reload, saveBudget, deleteBudget };
}
