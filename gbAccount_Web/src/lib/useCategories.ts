"use client";

import { useEffect, useState } from "react";

export interface CategoryOption {
  CategoryID: number;
  CategoryName: string | null;
}

interface UseCategoriesResult {
  categories: CategoryOption[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads account categories from the database via /api/categories.
 *
 * Categories are a real table (AccCategory), so the options come from live data
 * rather than a hardcoded list. Falls back to an empty list on failure — callers
 * keep their "Please Select" placeholder so the form stays usable offline.
 */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("http://localhost:5201/api/AccCategories");
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((cat: any) => ({
            CategoryID: cat.categoryID ?? cat.CategoryID,
            CategoryName: cat.categoryName ?? cat.CategoryName,
          }));
          setCategories(mapped);
          setError(null);
        } else {
          setError(json.message ?? "Failed to load categories");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories");
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

  return { categories, loading, error };
}
