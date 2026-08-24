"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "./reportFile";

/** An office as returned by /api/offices. */
export interface OfficeOption {
  officeId: number;
  officeCode: string;
  officeName: string;
  officeLevel: number;
  firstLevel: string | null;
  secondLevel: string | null;
  thirdLevel: string | null;
  fourthLevel: string | null;
  isProjectOffice: boolean;
}

interface UseOfficesResult {
  offices: OfficeOption[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads every active office for the configured organisation.
 *
 * The four level columns describe the hierarchy: a row's own code sits in
 * the column for its own level and its ancestors' codes fill the columns
 * above it, so level 1 is the head office, 2 the zones, 3 the areas and 4
 * the branches.
 */
export function useOffices(): UseOfficesResult {
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/offices`);

        // A wrong path returns an HTML error page, and response.json()
        // would then fail with a parse error that hides the real cause.
        if (!response.ok) {
          throw new Error(`Failed to load offices. HTTP ${response.status}`);
        }

        const json = await response.json();

        if (cancelled) return;

        if (Array.isArray(json)) {
          setOffices(json as OfficeOption[]);
          setError(null);
        } else {
          setError("Failed to load offices");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load offices"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { offices, loading, error };
}

/** The office's own code at the given level, or null if it has none. */
export const levelCode = (office: OfficeOption, level: number) => {
  switch (level) {
    case 1:
      return office.firstLevel;
    case 2:
      return office.secondLevel;
    case 3:
      return office.thirdLevel;
    case 4:
      return office.fourthLevel;
    default:
      return null;
  }
};

/**
 * The offices one level below `parentCode`. An empty `parentCode` means the
 * parent has not been chosen yet, which selects nothing.
 */
export const childOffices = (
  offices: OfficeOption[],
  level: number,
  parentCode: string
) => {
  if (!parentCode) return [];

  return offices.filter(
    (office) =>
      office.officeLevel === level &&
      levelCode(office, level - 1) === parentCode
  );
};

/** "0115 Char Motua Branch", the way the legacy screens label an office. */
export const officeLabel = (office: OfficeOption) =>
  `${office.officeCode} ${office.officeName}`;
