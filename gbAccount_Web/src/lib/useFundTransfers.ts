"use client";

import { useState, useEffect, useCallback } from "react";
import type { FundTransferData } from "@/components/FundTransfer";

export interface PKSFFundLoan {
  FundLoanID: number;
  FundLoanCode: string;
  PrincipalAmount: number;
  LoanSanctionNo: string;
  LoanSanctionTerm: string;
  LoanSanctionApproveDate: string;
  LoanDisbursementDate: string;
  DisbursedAmount: number;
  InterestRate: number;
  LoanDuration: number;
  GracePeriod: number;
  NoOfInstallment: number;
  TotalInstallmentNo: number;
  InstallmentDate: string;
  LoanInstallmentAmount: number;
  ServiceCharge: number;
}

export interface AccMappingForFundTransfer {
  ID: number;
  EntryType: string;
  VoucherType: string;
  HOFundAccCode: string;
  SenderBrFundAccCode: string;
  ReceiverBrFundAccCode: string;
  IsActive: boolean;
}

/**
 * Maps a database row from AccMappingForFundTransfer, PKSFFundLoan, or FundTransfers
 * onto the FundTransferData shape used by UI components.
 */
export function toFundTransferData(row: any, orgsList: any[] = []): FundTransferData {
  const officeId = String(
    row.receiverOfficeId ?? row.ReceiverOfficeId ?? row.receiverOfficeID ?? row.ReceiverOfficeID ?? ""
  );
  const foundOrg = orgsList.find(
    (o: any) => String(o.OrgID ?? o.orgID ?? o.id) === officeId
  );
  const receiverOfficeName =
    (row.receiverOfficeName ?? row.ReceiverOfficeName)
      ? String(row.receiverOfficeName ?? row.ReceiverOfficeName)
      : (foundOrg
          ? String(foundOrg.OrganizationName ?? foundOrg.organizationName)
          : (officeId ? `Office #${officeId}` : "Verc"));

  const rawDate = row.trxDate ?? row.TrxDate ?? row.installmentDate ?? row.InstallmentDate ?? row.date ?? row.Date;
  const formattedDate = rawDate && rawDate !== "0001-01-01"
    ? new Date(rawDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: String(
      row.id ?? row.ID ?? row.fundTransferID ?? row.FundTransferID ?? row.fundLoanID ?? row.FundLoanID ?? Math.random().toString(36).substring(2, 9)
    ),
    receiverOfficeId: officeId,
    receiverOfficeName,
    trxDate: formattedDate,
    reffNo: String(row.reffNo ?? row.ReffNo ?? row.fundLoanCode ?? row.FundLoanCode ?? "-"),
    sndrVoucherNo: String(row.sndrVoucherNo ?? row.SndrVoucherNo ?? "-"),
    recVoucherNo: String(row.recVoucherNo ?? row.RecVoucherNo ?? "-"),
    hoVoucherNo: String(row.hoVoucherNo ?? row.HOVoucherNo ?? "-"),
    debit: Number(
      row.debit ?? row.Debit ?? row.loanInstallmentAmount ?? row.LoanInstallmentAmount ?? row.principalAmount ?? row.PrincipalAmount ?? 0
    ),
    credit: Number(row.credit ?? row.Credit ?? row.serviceCharge ?? row.ServiceCharge ?? 0),
    description: String(row.description ?? row.Description ?? ""),
    createdAt: (row.createDate ?? row.CreateDate)
      ? new Date(row.createDate ?? row.CreateDate).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

interface UseFundTransfersResult {
  transfers: FundTransferData[];
  setTransfers: React.Dispatch<React.SetStateAction<FundTransferData[]>>;
  fundLoans: PKSFFundLoan[];
  mappings: AccMappingForFundTransfer[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  saveTransfer: (transfer: FundTransferData) => Promise<boolean>;
  deleteTransfer: (id: string) => Promise<boolean>;
}

export function useFundTransfers(): UseFundTransfersResult {
  const [transfers, setTransfers] = useState<FundTransferData[]>([]);
  const [fundLoans, setFundLoans] = useState<PKSFFundLoan[]>([]);
  const [mappings, setMappings] = useState<AccMappingForFundTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        // Fetch Organizations list to map ReceiverOfficeId -> ReceiverOfficeName
        const resOrgs = await fetch("http://localhost:5201/api/Organizations").catch(() => null);
        const jsonOrgs = resOrgs ? await resOrgs.json().catch(() => null) : null;
        const orgsList = (jsonOrgs && jsonOrgs.success && Array.isArray(jsonOrgs.data)) ? jsonOrgs.data : [];

        // Fetch Transfers from API with fallback to localStorage
        const resTransfers = await fetch("http://localhost:5201/api/FundTransfers").catch(() => null);
        const jsonTransfers = resTransfers ? await resTransfers.json().catch(() => null) : null;

        // Fetch PKSFFundLoan metadata from API
        const resLoans = await fetch("http://localhost:5201/api/PKSFFundLoans").catch(() => null);
        const jsonLoans = resLoans ? await resLoans.json().catch(() => null) : null;

        // Fetch AccMappingForFundTransfer metadata from API
        const resMappings = await fetch("http://localhost:5201/api/AccMappingForFundTransfers").catch(() => null);
        const jsonMappings = resMappings ? await resMappings.json().catch(() => null) : null;

        if (cancelled) return;

        if (jsonLoans && jsonLoans.success && Array.isArray(jsonLoans.data)) {
          setFundLoans(jsonLoans.data);
        }

        if (jsonMappings && jsonMappings.success && Array.isArray(jsonMappings.data)) {
          setMappings(jsonMappings.data);
        }

const DEFAULT_FUND_TRANSFERS: FundTransferData[] = [
  {
    id: "ft_1",
    receiverOfficeId: "2",
    receiverOfficeName: "Dhaka Branch",
    trxDate: "2026-08-20",
    reffNo: "1594",
    sndrVoucherNo: "VCH-2026-001",
    recVoucherNo: "VCH-2026-002",
    hoVoucherNo: "HO-VCH-101",
    debit: 25000000,
    credit: 1406250,
    description: "PKSF Fund Loan Disbursement",
    createdAt: "2026-08-20",
  },
  {
    id: "ft_2",
    receiverOfficeId: "3",
    receiverOfficeName: "Chittagong Branch",
    trxDate: "2026-08-15",
    reffNo: "1595",
    sndrVoucherNo: "VCH-2026-003",
    recVoucherNo: "VCH-2026-004",
    hoVoucherNo: "HO-VCH-102",
    debit: 15000000,
    credit: 850000,
    description: "Branch Inter-fund Transfer",
    createdAt: "2026-08-15",
  },
];

        if (jsonTransfers && jsonTransfers.success && Array.isArray(jsonTransfers.data) && jsonTransfers.data.length > 0) {
          setTransfers(jsonTransfers.data.map((row: any) => toFundTransferData(row, orgsList)));
          setError(null);
        } else {
          // Fallback to localStorage or default sample transfers
          const saved = localStorage.getItem("fundTransfers");
          if (saved) {
            const parsed = JSON.parse(saved);
            setTransfers(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FUND_TRANSFERS);
          } else {
            setTransfers(DEFAULT_FUND_TRANSFERS);
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const saved = localStorage.getItem("fundTransfers");
          if (saved) {
            setTransfers(JSON.parse(saved));
          }
          setError(err instanceof Error ? err.message : "Failed to load transfers");
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

  const saveTransfer = async (transfer: FundTransferData): Promise<boolean> => {
    const isNumericId = /^\d+$/.test(transfer.id || "");
    const isNew = !isNumericId || transfer.id.startsWith("new_") || transfer.id.startsWith("ft_");

    try {
      const url = isNew
        ? "http://localhost:5201/api/FundTransfers"
        : `http://localhost:5201/api/FundTransfers/${transfer.id}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transfer),
      }).catch(() => null);

      if (res && res.ok) {
        reload();
        return true;
      }
    } catch (err) {
      console.warn("API sync for saveTransfer failed:", err);
    }

    // Local fallback
    const fallbackRecord = { ...transfer, id: transfer.id || `ft_${Date.now()}` };
    setTransfers((prev) => {
      const filtered = prev.filter((t) => t.id !== transfer.id && t.id !== fallbackRecord.id);
      const updated = [fallbackRecord, ...filtered];
      try {
        localStorage.setItem("fundTransfers", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    return true;
  };

  const deleteTransfer = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:5201/api/FundTransfers/${id}`, {
        method: "DELETE",
      }).catch(() => null);

      if (res && res.ok) {
        reload();
        return true;
      }
    } catch (err) {
      console.warn("Background API sync for deleteTransfer failed:", err);
    }

    // Local fallback
    setTransfers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("fundTransfers", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    return true;
  };

  return {
    transfers,
    setTransfers,
    fundLoans,
    mappings,
    loading,
    error,
    reload,
    saveTransfer,
    deleteTransfer,
  };
}
