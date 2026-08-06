"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  FileText,
  CheckCircle,
  Plus,
  Minus,
} from "lucide-react";

interface SidebarProps {
  activeSubMenu: string;
  onSelectMenu: (menu: string) => void;
}

export default function Sidebar({ activeSubMenu, onSelectMenu }: SidebarProps) {
  const [accountOpen, setAccountOpen] = useState(true);
  const [entriesOpen, setEntriesOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <BookOpen size={20} />
          <span>Account System</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle-btn"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            A
          </div>
          <div>
            <h1 className="sidebar-brand-title">
              Account System
            </h1>
            <p className="sidebar-brand-subtitle">Accounting Module</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {/* Account Collapsible Header */}
          <div className="sidebar-menu-group">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="sidebar-header-btn"
            >
              <div className="flex items-center" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <CreditCard size={18} style={{ color: "#60a5fa" }} />
                <span>Accounts</span>
              </div>
              {accountOpen ? (
                <ChevronDown size={16} style={{ color: "#94a3b8" }} />
              ) : (
                <ChevronRight size={16} style={{ color: "#94a3b8" }} />
              )}
            </button>

            {/* Sub-menu items */}
            {accountOpen && (
              <div className="sidebar-sub-menu">
                {/* Nested Header: Account Entries */}
                <button
                  onClick={() => setEntriesOpen(!entriesOpen)}
                  className="sidebar-nested-btn"
                >
                  {entriesOpen ? (
                    <Minus size={12} className="sidebar-nested-icon" />
                  ) : (
                    <Plus size={12} className="sidebar-nested-icon" />
                  )}
                  <span>Account Entries</span>
                </button>

                {entriesOpen && (
                <div style={{ paddingLeft: "26px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {/* Chart Of Accounts */}
                  <button
                    onClick={() => {
                      onSelectMenu("chart-of-account");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "chart-of-account" ? "active" : ""}`}
                  >
                    <span>Chart Of Accounts</span>
                  </button>

                  {/* Voucher Entries */}
                  <button
                    onClick={() => {
                      onSelectMenu("voucher-entry");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "voucher-entry" ? "active" : ""}`}
                  >
                    <span>Voucher Entries</span>
                  </button>

                  {/* Reconcile Entries */}
                  <button
                    onClick={() => {
                      onSelectMenu("reconcile-entries");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "reconcile-entries" ? "active" : ""}`}
                  >
                    <span>Reconcile Entries</span>
                  </button>

                  {/* Budget Entries */}
                  <button
                    onClick={() => {
                      onSelectMenu("budget-create");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "budget-create" ? "active" : ""}`}
                  >
                    <span>Budget Entries</span>
                  </button>

                  {/* Note Entries */}
                  <button
                    onClick={() => {
                      onSelectMenu("account-note");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "account-note" ? "active" : ""}`}
                  >
                    <span>Note Entries</span>
                  </button>

                  {/* Budget Particular */}
                  <button
                    onClick={() => {
                      onSelectMenu("budget-particular");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "budget-particular" ? "active" : ""}`}
                  >
                    <span>Budget Particular</span>
                  </button>

                  {/* Target Achievement */}
                  <button
                    onClick={() => {
                      onSelectMenu("target-achievement");
                      setMobileOpen(false);
                    }}
                    className={`sidebar-sub-btn ${activeSubMenu === "target-achievement" ? "active" : ""}`}
                  >
                    <span>Target Achievement</span>
                  </button>
                </div>
                )}

                {/* Nested Header: Account Reports */}
                <button
                  onClick={() => setReportsOpen(!reportsOpen)}
                  className="sidebar-nested-btn"
                >
                  {reportsOpen ? (
                    <Minus size={12} className="sidebar-nested-icon" />
                  ) : (
                    <Plus size={12} className="sidebar-nested-icon" />
                  )}
                  <span>Account Reports</span>
                </button>

                {reportsOpen && (
                  <div style={{ paddingLeft: "26px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {/* Vouchers */}
                    <button
                      onClick={() => {
                        onSelectMenu("report-vouchers");
                        setMobileOpen(false);
                      }}
                      className={`sidebar-sub-btn ${activeSubMenu === "report-vouchers" ? "active" : ""}`}
                    >
                      <span>Vouchers</span>
                    </button>

                    {/* General Ledger */}
                    <button
                      onClick={() => {
                        onSelectMenu("report-general-ledger");
                        setMobileOpen(false);
                      }}
                      className={`sidebar-sub-btn ${activeSubMenu === "report-general-ledger" ? "active" : ""}`}
                    >
                      <span>General Ledger</span>
                    </button>

                    {/* Cash Book */}
                    <button
                      onClick={() => {
                        onSelectMenu("report-cash-book");
                        setMobileOpen(false);
                      }}
                      className={`sidebar-sub-btn ${activeSubMenu === "report-cash-book" ? "active" : ""}`}
                    >
                      <span>Cash Book</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Footer info */}
        <div className="sidebar-footer">
          Account System v1.0
        </div>
      </aside>
    </>
  );
}
