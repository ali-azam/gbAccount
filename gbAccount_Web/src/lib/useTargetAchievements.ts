"use client";

import { useState, useEffect, useCallback } from "react";
import type { TargetAchievementData } from "@/components/TargetAchievement";

export interface YearlyTargetData {
  ID: number;
  OrgID: number;
  OfficeID: number;
  TargetYear: string;
  MonthID: number;
  EmpID: number;
  ParticularID: number;
  TargetValue: number;
  IsActive: boolean;
}

/**
 * Maps a database row from dbo.targetachievement or Yearly_Target_Data
 * onto the TargetAchievementData shape used by UI components.
 */
export function toTargetAchievementData(row: any, particularsList: any[] = []): TargetAchievementData {
  const particularId = row.particularId ?? row.ParticularId ?? row.particularID ?? row.ParticularID;
  const foundParticular = particularsList.find(
    (p: any) => String(p.id ?? p.ID ?? p.particularID ?? p.ParticularID) === String(particularId)
  );
  const particularName = foundParticular
    ? (foundParticular.name ?? foundParticular.particularName ?? foundParticular.ParticularName)
    : (row.particularName ?? row.ParticularName ?? (particularId ? `Particular #${particularId}` : "-"));

  const rawDate = row.date ?? row.Date ?? row.createDate ?? row.CreateDate;
  const formattedDate = rawDate && rawDate !== "0001-01-01"
    ? new Date(rawDate).toISOString().split("T")[0]
    : "-";

  return {
    id: String(row.targetId ?? row.TargetId ?? row.id ?? row.ID ?? Math.random().toString(36).substring(2, 9)),
    particularName,
    targetCurrentYear: String(row.targetCurrentYear ?? row.TargetCurrentYear ?? row.targetYear ?? row.TargetYear ?? "-"),
    target: String(row.target ?? row.Target ?? row.targetValue ?? row.TargetValue ?? "0"),
    achievement: String(row.achievement ?? row.Achievement ?? "0"),
    balance: String(row.balance ?? row.Balance ?? "0"),
    date: formattedDate,
    productName: String(row.productName ?? row.ProductName ?? row.productID ?? row.ProductID ?? "-"),
    officeId: String(row.officeID ?? row.OfficeID ?? ""),
  };
}

interface UseTargetAchievementsResult {
  targets: TargetAchievementData[];
  setTargets: React.Dispatch<React.SetStateAction<TargetAchievementData[]>>;
  yearlyTargetData: YearlyTargetData[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveTarget: (target: TargetAchievementData) => Promise<boolean>;
  deleteTarget: (id: string) => Promise<boolean>;
}

export function useTargetAchievements(): UseTargetAchievementsResult {
  const [targets, setTargets] = useState<TargetAchievementData[]>([]);
  const [yearlyTargetData, setYearlyTargetData] = useState<YearlyTargetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        // Fetch particulars list to map ParticularID -> ParticularName
        const resParticulars = await fetch("http://localhost:5201/api/BudgetParticulars").catch(() => null);
        const jsonParticulars = resParticulars ? await resParticulars.json().catch(() => null) : null;
        const particularsList = (jsonParticulars && jsonParticulars.success && Array.isArray(jsonParticulars.data))
          ? jsonParticulars.data
          : [];

        // Fetch target achievement records from backend
        const resTargets = await fetch("http://localhost:5201/api/TargetAchievements").catch(() => null);
        const jsonTargets = resTargets ? await resTargets.json().catch(() => null) : null;

        // Fetch monthly target allocations (Yearly_Target_Data) from backend
        const resYearly = await fetch("http://localhost:5201/api/YearlyTargetData").catch(() => null);
        const jsonYearly = resYearly ? await resYearly.json().catch(() => null) : null;

        if (cancelled) return;

        if (jsonYearly && jsonYearly.success && Array.isArray(jsonYearly.data)) {
          setYearlyTargetData(jsonYearly.data);
        }

        if (jsonTargets && jsonTargets.success && Array.isArray(jsonTargets.data)) {
          setTargets(jsonTargets.data.map((row: any) => toTargetAchievementData(row, particularsList)));
          setError(null);
        } else {
          // Fallback to localStorage if API server is not running or empty
          const saved = localStorage.getItem("targetAchievements");
          if (saved) {
            setTargets(JSON.parse(saved));
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const saved = localStorage.getItem("targetAchievements");
          if (saved) {
            setTargets(JSON.parse(saved));
          }
          setError(err instanceof Error ? err.message : "Failed to load target achievements");
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

  const saveTarget = async (target: TargetAchievementData): Promise<boolean> => {
    const isNumericId = /^\d+$/.test(target.id || "");
    const isNew = !isNumericId || target.id.startsWith("new_") || target.id.startsWith("ta_");

    try {
      const url = isNew
        ? "http://localhost:5201/api/TargetAchievements"
        : `http://localhost:5201/api/TargetAchievements/${target.id}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      }).catch(() => null);

      if (res && res.ok) {
        reload();
        return true;
      }
    } catch (err) {
      console.warn("API sync for saveTarget failed:", err);
    }

    // Local fallback
    const fallbackRecord = { ...target, id: target.id || `ta_${Date.now()}` };
    setTargets((prev) => {
      const filtered = prev.filter((t) => t.id !== target.id && t.id !== fallbackRecord.id);
      const updated = [fallbackRecord, ...filtered];
      try {
        localStorage.setItem("targetAchievements", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    return true;
  };

  const deleteTarget = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/TargetAchievements/${id}`, {
        method: "DELETE",
      }).catch(() => null);

      if (res && res.ok) {
        reload();
        return true;
      }
    } catch (err) {
      console.warn("Background API sync for deleteTarget failed:", err);
    }

    // Local fallback
    setTargets((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("targetAchievements", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    return true;
  };

  return {
    targets,
    setTargets,
    yearlyTargetData,
    loading,
    error,
    reload,
    saveTarget,
    deleteTarget,
  };
}
