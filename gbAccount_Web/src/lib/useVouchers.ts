"use client";

import { useCallback, useEffect, useState } from "react";
import type { VoucherData } from "@/components/VoucherForm";

interface UseVouchersResult {
  vouchers: VoucherData[];
  setVouchers: React.Dispatch<React.SetStateAction<VoucherData[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveVoucher: (voucher: VoucherData) => Promise<boolean>;
  deleteVoucher: (id: string) => Promise<boolean>;
}

export function useVouchers(search: string = "", filterBy: string = "View All"): UseVouchersResult {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const queryParams = new URLSearchParams();
        if (search.trim() !== "") {
          queryParams.append("search", search);
          queryParams.append("filterBy", filterBy);
        }
        const url = `http://localhost:5201/api/Vouchers${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        if (json.success && Array.isArray(json.data)) {
          setVouchers(json.data);
          setError(null);
        } else {
          setError(json.message ?? "Failed to load vouchers");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vouchers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, search, filterBy]);

  const saveVoucher = async (voucher: VoucherData): Promise<boolean> => {
    try {
      const isEdit = vouchers.some((v) => v.id === voucher.id) && !voucher.id.startsWith("new_") && isNaN(Number(voucher.id)) === false;
      
      // Wait, isEdit can also be checked by checking if the id contains a timestamp or looks like a temp id vs real DB BigInt id
      // Since temporary/new ids created by VoucherForm are timestamps (e.g. Date.now().toString()) and real IDs are database BigInts:
      // Let's check if the voucher ID exists in our list. If it exists, it is an edit!
      const exists = vouchers.some((v) => v.id === voucher.id);
      
      const url = exists ? `http://localhost:5201/api/Vouchers/${voucher.id}` : "http://localhost:5201/api/Vouchers";
      const method = exists ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucher),
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Save voucher failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Save voucher error:", err);
      return false;
    }
  };

  const deleteVoucher = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/Vouchers/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        reload();
        return true;
      } else {
        console.error("Delete voucher failed:", json.message);
        return false;
      }
    } catch (err) {
      console.error("Delete voucher error:", err);
      return false;
    }
  };

  return { vouchers, setVouchers, loading, error, reload, saveVoucher, deleteVoucher };
}
