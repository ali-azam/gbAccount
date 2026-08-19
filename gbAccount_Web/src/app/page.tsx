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
import TrialBalanceReportWithAccCode from "@/components/TrialBalanceReportAccCode";
import TrialBalanceReport from "@/components/TrialBalanceReport";
import TrialBalanceReportOffice from "@/components/TrialBalanceReportOffice";
import TargetAndAchievementReport from "@/components/TargetAndAchievementReport";
import ReceivePaymentReport from "@/components/ReceivePaymentReport";
import ReceivePaymentReportByOffice from "@/components/ReceivePaymentReportOffice";
import IncomeExpenditureReport from "@/components/IncomeExpReport";
import IncomeExpenditureReportByOffice from "@/components/IncomeExpReportOffice";
import { useAccounts } from "@/lib/useAccounts";
import { useVouchers } from "@/lib/useVouchers";
import { useBudgets } from "@/lib/useBudgets";
import { useBudgetParticulars } from "@/lib/useBudgetParticulars";
import FundTransfer from "@/components/FundTransfer";


// Account Reports sub-menu keys mapped to their display titles
const REPORT_TITLES: Record<string, string> = {
  "report-vouchers": "Vouchers",
  "report-general-ledger": "General Ledger",
  "report-cash-book": "Cash Book",
  "report-Acccodewise-trial-balance": "AccountCode wise Trial Balance",
  "report-trial-balance": "Trial Balance",
  "report-office-trial-balance": "Office Trial Balance",
   "report-target-achievement": "Target And Achievement Report",
   "report-receive-payment": "Receive Payment Report",
   "report-receive-payment-office": "Receive Payment Report office",
   "report-income-expenditure": "Income Expenditure Report",
   "report-income-expenditure-office": "Income Expenditure Report office",
};

// Breadcrumb middle segment per report page
const REPORT_CRUMBS: Record<string, string> = {
  "report-vouchers": "AccVoucherReport",
  "report-general-ledger": "AccGeneralLedger",
  "report-cash-book": "AccCashBook",
  "report-Acccodewise-trial-balance": "AccCodeTrialBalance",
  "report-trial-balance": "AccTrialBalance",
  "report-office-trial-balance": "AccOfficeTrialBalance",
  "report-target-achievement": "TargetAndAchievementReport",
  "report-receive-payment": "AccRcvPayReport",
  "report-receive-payment-office": "AccRcvPayReportoffice",
  "report-income-expenditure": "AccIncExpReport",
  "report-income-expenditure-office": "AccIncExpReportoffice",
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
    saveAccount,
    deleteAccount,
  } = useAccounts();

  const [voucherSearch, setVoucherSearch] = useState("");
  const [voucherFilterBy, setVoucherFilterBy] = useState("View All");

  // Voucher Data State — loaded from the database via /api/vouchers
  const {
    vouchers,
    setVouchers,
    saveVoucher,
    deleteVoucher,
    loading: vouchersLoading,
    error: vouchersError,
  } = useVouchers(voucherSearch, voucherFilterBy);

  // Budget Data State — loaded from database via /api/Budgets
  const {
    budgets,
    setBudgets,
    saveBudget,
    deleteBudget,
    loading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();
  const [budgetView, setBudgetView] = useState<"create" | "list">("create");
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null);

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

  // Budget Particular State — loaded from database via /api/BudgetParticulars
  const {
    particulars,
    setParticulars,
    saveParticular,
    updateParticular,
    deleteParticular,
    loading: particularsLoading,
    error: particularsError,
  } = useBudgetParticulars();

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

  const handleSaveAccount = async (newAccount: AccountData): Promise<boolean> => {
    const success = await saveAccount(newAccount);
    if (success) {
      setEditingAccount(null);
      setIsEditModalOpen(false);
      setAccountView("list");
    }
    return success;
  };

  const handleSaveVoucher = async (newVoucher: VoucherData) => {
    const success = await saveVoucher(newVoucher);
    if (success) {
      setEditingVoucher(null);
      setVoucherView("list");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
  };

  const handleDeleteVoucher = async (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
    await deleteVoucher(id);
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
                  setEditingBudget(null);
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
                <VoucherReport/>
              ) : activeSubMenu === "report-general-ledger" ? (
                <GeneralLedgerReport />
              ) : activeSubMenu === "report-Acccodewise-trial-balance" ? (
                <TrialBalanceReportWithAccCode />
              ) : activeSubMenu === "report-trial-balance" ? (
                <TrialBalanceReport /> 
              ) : activeSubMenu === "report-office-trial-balance" ? (
                <TrialBalanceReportOffice /> 
              ) : activeSubMenu === "report-target-achievement" ? (
                <TargetAndAchievementReport />
              ) : activeSubMenu === "report-receive-payment" ? (
                <ReceivePaymentReport />
              ) : activeSubMenu === "report-receive-payment-office" ? (
                <ReceivePaymentReportByOffice />
              ) : activeSubMenu === "report-income-expenditure" ? (
                <IncomeExpenditureReport />
              ) : activeSubMenu === "report-income-expenditure-office" ? (
                <IncomeExpenditureReportByOffice />
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
              onSaveParticular={async (name) => {
                await saveParticular(name);
              }}
              onDeleteParticular={async (id) => {
                await deleteParticular(id);
              }}
              onUpdateParticular={async (id, name) => {
                await updateParticular(id, name);
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
                  <h1 className="page-title">{editingBudget ? "Budget Edit" : "Budget Create"}</h1>
                  <button
                    onClick={() => {
                      setBudgetView("list");
                      setEditingBudget(null);
                    }}
                    className="btn-link"
                  >
                    Back to List
                  </button>
                </div>
                <BudgetForm
                  initialData={editingBudget}
                  onSaveBudget={async (newBudget) => {
                    const success = await saveBudget(newBudget);
                    if (success) {
                      setEditingBudget(null);
                      setBudgetView("list");
                    }
                    return success;
                  }}
                  onBackToList={() => {
                    setBudgetView("list");
                    setEditingBudget(null);
                  }}
                />
              </div>
            ) : (
              <BudgetList
                budgets={budgets}
                onCreateNew={() => {
                  setEditingBudget(null);
                  setBudgetView("create");
                }}
                onEditBudget={(budget) => {
                  setEditingBudget(budget);
                  setBudgetView("create");
                }}
                onDeleteBudget={async (id) => {
                  await deleteBudget(id);
                }}
              />
            )
          ) : activeSubMenu === "reconcile-entries" ? (
            <ReconcileVoucher
              vouchers={vouchers}
              onUpdateVouchers={async (updated) => {
                // Find all vouchers that were actually modified in terms of 'received' status
                const modified = updated.filter((newV) => {
                  const oldV = vouchers.find((o) => o.id === newV.id);
                  return oldV && oldV.received !== newV.received;
                });
                
                // Optimistically update the UI state
                setVouchers(updated);

                // Persist the changes to the database
                try {
                  await Promise.all(
                    modified.map((v) =>
                      fetch(`http://localhost:5201/api/Vouchers/${v.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(v),
                      })
                    )
                  );
                } catch (err) {
                  console.error("Failed to persist reconciliation state:", err);
                }
              }}
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
              loading={vouchersLoading}
              error={vouchersError}
              onSearch={(filter, query) => {
                setVoucherFilterBy(filter);
                setVoucherSearch(query);
              }}
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
