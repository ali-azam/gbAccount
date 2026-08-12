"use client";

import React, { useState, useEffect } from "react";

import Sidebar from "@/components/Sidebar";
import AccountForm, { AccountData } from "@/components/AccountForm";
import AccountList from "@/components/AccountList";
import EditAccountModal from "@/components/EditAccountModal";
import VoucherForm, { VoucherData } from "@/components/VoucherForm";
import VoucherList from "@/components/VoucherList";
import ReconcileVoucher from "@/components/ReconcileVoucher";
import BudgetForm, { BudgetData } from "@/components/BudgetForm";
import BudgetList from "@/components/BudgetList";
import AccountNoteForm, { AccountNoteData } from "@/components/AccountNoteForm";
import AccountNoteList from "@/components/AccountNoteList";
import BudgetParticular, { BudgetParticularData } from "@/components/BudgetParticular";
import TargetAchievement, { TargetAchievementData } from "@/components/TargetAchievement";
import VoucherReport from "@/components/VoucherReport";
import GeneralLedgerReport from "@/components/GeneralLedgerReport";
import CashBookReport from "@/components/CashBookReport";
import { useAccounts } from "@/lib/useAccounts";
import FundTransfer from "@/components/FundTransfer";

// Account Reports sub-menu keys mapped to their display titles
const REPORT_TITLES: Record<string, string> = {
  "report-vouchers": "Vouchers",
  "report-general-ledger": "General Ledger",
  "report-cash-book": "Cash Book",
};

// Breadcrumb middle segment per report page
const REPORT_CRUMBS: Record<string, string> = {
  "report-vouchers": "AccVoucherReport",
  "report-general-ledger": "AccGeneralLedger",
  "report-cash-book": "AccCashBook",
};

export default function Home() {
  const [activeSubMenu, setActiveSubMenu] = useState<string>("voucher-entry");
  const [accountView, setAccountView] = useState<"create" | "list">("list");
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [voucherView, setVoucherView] = useState<"create" | "list">("create");
  const [editingVoucher, setEditingVoucher] = useState<VoucherData | null>(null);

  // Account Data State — loaded from the database via /api/accounts
  const {
    accounts,
    setAccounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  // Voucher Data State — persisted to localStorage
  const [vouchers, setVouchers] = useState<VoucherData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("vouchers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("vouchers", JSON.stringify(vouchers));
  }, [vouchers]);

  // Budget Data State
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [budgetView, setBudgetView] = useState<"create" | "list">("create");

  // Account Note State
  const [accountNotes, setAccountNotes] = useState<AccountNoteData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("accountNotes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [accountNoteView, setAccountNoteView] = useState<"create" | "list">("list");

  useEffect(() => {
    localStorage.setItem("accountNotes", JSON.stringify(accountNotes));
  }, [accountNotes]);

  // Budget Particular State
  const [particulars, setParticulars] = useState<BudgetParticularData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("particulars");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default values matching your screenshot
    return [
      { id: "1", particularName: "No. of Samity" },
      { id: "2", particularName: "No. of Member" },
      { id: "3", particularName: "Total Service Charge Collection" },
      { id: "4", particularName: "Loan Disbursement" },
      { id: "5", particularName: "Loan Collection" },
      { id: "6", particularName: "Savings Collection" },
      { id: "7", particularName: "Savings Refund" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("particulars", JSON.stringify(particulars));
  }, [particulars]);

  // Target Achievement State
  const [targets, setTargets] = useState<TargetAchievementData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("targets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("targets", JSON.stringify(targets));
  }, [targets]);

  const handleSaveAccount = (newAccount: AccountData) => {
    if (editingAccount) {
      setAccounts((prev) => prev.map((acc) => (acc.id === newAccount.id ? { ...acc, ...newAccount } : acc)));
      setEditingAccount(null);
      setIsEditModalOpen(false);
    } else {
      setAccounts((prev) => [
        { ...newAccount, sl: prev.length + 1 },
        ...prev,
      ]);
    }
  };

  const handleSaveVoucher = (newVoucher: VoucherData) => {
    if (editingVoucher) {
      setVouchers((prev) => prev.map((v) => (v.id === newVoucher.id ? newVoucher : v)));
      setEditingVoucher(null);
      setVoucherView("list");
    } else {
      setVouchers((prev) => [newVoucher, ...prev]);
    }
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  };

  const isReportMenu = activeSubMenu in REPORT_TITLES;

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        activeSubMenu={activeSubMenu}
        onSelectMenu={(menu) => {
          setActiveSubMenu(menu);
        }}
      />

      {/* Main Workspace Area */}
      <div className="main-layout">
        {/* Top Header Strip with Breadcrumb */}
        <header className="header-strip">
          <div className="app-container items-center" style={{ minHeight: "auto", justifyContent: "space-between", background: "none" }}>
            {/* Breadcrumb */}
            <nav className="breadcrumb-nav">
              {isReportMenu ? (
                <>
                  <span className="breadcrumb-item">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">
                    {REPORT_CRUMBS[activeSubMenu]}
                  </span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">Index</span>
                </>
              ) : activeSubMenu === "reconcile-entries" ? (
                <>
                  <span className="breadcrumb-item">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item">AccVoucherEntry</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">ReconcileIndex</span>
                </>
              ) : activeSubMenu === "budget-create" ? (
                <>
                  <span className="breadcrumb-item">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item">Budget</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">Create</span>
                </>
              ) : activeSubMenu === "target-achievement" ? (
                <>
                  <span className="breadcrumb-item active">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">Budget</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">TargetAchievement</span>
                </>
              ) : activeSubMenu === "budget-particular" ? (
                <>
                  <span className="breadcrumb-item active">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">Budget</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">CreateParticular</span>
                </>
              ) : activeSubMenu === "fund-transfer" ? (
                <>
                  <span className="breadcrumb-item">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">FundTransfer</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">Index</span>
                </>
              ) : activeSubMenu === "account-note" ? (
                <>
                  <span className="breadcrumb-item active">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">AccNote</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">
                    {accountNoteView === "create" ? "Create" : "Index"}
                  </span>
                </>
              ) : (
                <>
                  <span className="breadcrumb-item">Home</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">Account</span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item active">
                    {activeSubMenu === "chart-of-account" ? "Chart of Account" : "Voucher Entry"}
                  </span>
                  <span className="breadcrumb-item">/</span>
                  <span className="breadcrumb-item current">
                    {activeSubMenu === "chart-of-account"
                      ? accountView === "create"
                        ? "Create"
                        : "List"
                      : voucherView === "create"
                      ? "Create"
                      : "List"}
                  </span>
                </>
              )}
            </nav>

            {/* Back to List / Add New Toggle */}
            {activeSubMenu === "reconcile-entries" || isReportMenu || activeSubMenu === "account-note" || activeSubMenu === "budget-particular" || activeSubMenu === "target-achievement" || activeSubMenu === "fund-transfer" ? null : activeSubMenu === "budget-create" ? (
              <button
                onClick={() => {
                  setBudgetView(budgetView === "create" ? "list" : "create");
                }}
                className="btn-link"
              >
                {budgetView === "create" ? "Back to List" : "+ Create Budget"}
              </button>
            ) : activeSubMenu === "chart-of-account" ? (
              <button
                onClick={() => {
                  setAccountView(accountView === "create" ? "list" : "create");
                  setEditingAccount(null);
                }}
                className="btn-link"
              >
                {accountView === "create" ? "Back to List" : "+ Create Account Code"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setVoucherView(voucherView === "create" ? "list" : "create");
                  setEditingVoucher(null);
                }}
                className="btn-link"
              >
                {voucherView === "create" ? "Back to List" : "+ Create Voucher"}
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="main-content">
          {isReportMenu ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="flex-between-header">
                <h1 className="page-title">{REPORT_TITLES[activeSubMenu]}</h1>
              </div>
              {activeSubMenu === "report-vouchers" ? (
                <VoucherReport vouchers={vouchers} />
              ) : activeSubMenu === "report-general-ledger" ? (
                <GeneralLedgerReport />
              ) : (
                <CashBookReport />
              )}
            </div>
          ) : activeSubMenu === "target-achievement" ? (
            <TargetAchievement
              targets={targets}
              particulars={particulars}
              onSaveTarget={(newTarget) => {
                setTargets((prev) => [newTarget, ...prev]);
              }}
              onDeleteTarget={(id) => {
                setTargets((prev) => prev.filter((t) => t.id !== id));
              }}
              onUpdateTarget={(updatedTarget) => {
                setTargets((prev) => prev.map((t) => t.id === updatedTarget.id ? updatedTarget : t));
              }}
            />
          ) : activeSubMenu === "budget-particular" ? (
            <BudgetParticular
              particulars={particulars}
              onSaveParticular={(name) => {
                setParticulars((prev) => [
                  ...prev,
                  { id: Math.random().toString(36).substring(2, 9), particularName: name }
                ]);
              }}
              onDeleteParticular={(id) => {
                setParticulars((prev) => prev.filter((p) => p.id !== id));
              }}
              onUpdateParticular={(id, name) => {
                setParticulars((prev) => prev.map((p) => p.id === id ? { ...p, particularName: name } : p));
              }}
            />
          ) : activeSubMenu === "fund-transfer" ? (
            <FundTransfer />
          ) : activeSubMenu === "account-note" ? (
            accountNoteView === "create" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="flex-between-header">
                  <h1 className="page-title">Account Note Create</h1>
                  <button
                    onClick={() => setAccountNoteView("list")}
                    className="btn-link"
                  >
                    Back to List
                  </button>
                </div>
                <AccountNoteForm
                  onSaveNote={(newNote) => {
                    setAccountNotes((prev) => [
                      { ...newNote, sl: prev.length + 1 },
                      ...prev,
                    ]);
                  }}
                  onBackToList={() => setAccountNoteView("list")}
                />
              </div>
            ) : (
              <AccountNoteList
                accountNotes={accountNotes}
                onCreateNew={() => setAccountNoteView("create")}
              />
            )
          ) : activeSubMenu === "budget-create" ? (
            budgetView === "create" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="flex-between-header">
                  <h1 className="page-title">Budget Create</h1>
                  <button
                    onClick={() => setBudgetView("list")}
                    className="btn-link"
                  >
                    Back to List
                  </button>
                </div>
                <BudgetForm
                  onSaveBudget={(newBudget) => {
                    setBudgets((prev) => [newBudget, ...prev]);
                  }}
                  onBackToList={() => setBudgetView("list")}
                />
              </div>
            ) : (
              <BudgetList
                budgets={budgets}
                onCreateNew={() => setBudgetView("create")}
                onDeleteBudget={(id) => setBudgets((prev) => prev.filter((b) => b.id !== id))}
              />
            )
          ) : activeSubMenu === "reconcile-entries" ? (
            <ReconcileVoucher
              vouchers={vouchers}
              onUpdateVouchers={(updated) => setVouchers(updated)}
              onDeleteVoucher={handleDeleteVoucher}
            />
          ) : activeSubMenu === "chart-of-account" ? (
            accountView === "create" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="flex-between-header">
                  <h1 className="page-title">
                    Account Code Create
                  </h1>
                  <button
                    onClick={() => {
                      setAccountView("list");
                      setEditingAccount(null);
                    }}
                    className="btn-link"
                  >
                    Back to List
                  </button>
                </div>
                <AccountForm
                  initialData={null}
                  onSaveAccount={handleSaveAccount}
                  onBackToList={() => {
                    setAccountView("list");
                    setEditingAccount(null);
                  }}
                />
              </div>
            ) : (
              <AccountList
                accounts={accounts}
                loading={accountsLoading}
                error={accountsError}
                onCreateNew={() => {
                  setAccountView("create");
                  setEditingAccount(null);
                }}
                onEditAccount={(acc) => {
                  setEditingAccount(acc);
                  setIsEditModalOpen(true);
                }}
                onDeleteAccount={handleDeleteAccount}
              />
            )
          ) : voucherView === "create" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="flex-between-header">
                  <h1 className="page-title">
                    {editingVoucher ? "Voucher Edit" : "Voucher Create"}
                  </h1>
                  <button
                    onClick={() => {
                      setVoucherView("list");
                      setEditingVoucher(null);
                    }}
                  className="btn-link"
                >
                  Back to List
                </button>
              </div>
              <VoucherForm
                  initialData={editingVoucher}
                  onSaveVoucher={handleSaveVoucher}
                  onBackToList={() => {
                    setVoucherView("list");
                    setEditingVoucher(null);
                  }}
              />
            </div>
          ) : (
            <VoucherList
              vouchers={vouchers}
              onCreateNew={() => {
                setVoucherView("create");
                setEditingVoucher(null);
              }}
              onEditVoucher={(vch) => {
                setEditingVoucher(vch);
                setVoucherView("create");
              }}
              onDeleteVoucher={handleDeleteVoucher}
            />
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
          }}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
}
