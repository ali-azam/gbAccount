"use client";

/**
 * The trial balance table, laid out the way the PDF and Excel exports lay
 * it out: opening balance, debit and credit each split into cash, journal
 * and total, then the closing balance.
 *
 * Both trial balance screens render through here so the account code wise
 * and office wise views cannot drift apart. The office wise view supplies
 * one section per office; the account code wise view supplies a single
 * unheaded section.
 */

import React from "react";

import { formatAmount } from "@/lib/reportFile";
import {
  TrialBalancePrintedRow,
  TrialBalanceTotals,
  trialBalanceColumns,
} from "@/lib/trialBalance";

export interface TrialBalanceSection {
  key: string;
  /** Office banner above the block, or null for an unbanded report. */
  heading: string | null;
  rows: TrialBalancePrintedRow[];
}

interface TrialBalanceTableProps {
  sections: TrialBalanceSection[];
  totals: TrialBalanceTotals;
}

const COLUMN_COUNT = 10;

const amountCell: React.CSSProperties = {
  textAlign: "right",
  whiteSpace: "nowrap",
};

const centerCell: React.CSSProperties = {
  textAlign: "center",
  whiteSpace: "nowrap",
};

const totalRow: React.CSSProperties = {
  fontWeight: 600,
  background: "#f8fafc",
};

const grandTotalRow: React.CSSProperties = {
  fontWeight: 700,
  background: "#eef2ff",
};

const sectionRow: React.CSSProperties = {
  fontWeight: 600,
  background: "#f1f5f9",
};

/** The eight money cells, in print order. */
const AmountCells = ({ row }: { row: TrialBalancePrintedRow }) => {
  const columns = trialBalanceColumns(row.amounts);

  return (
    <>
      <td style={amountCell}>{formatAmount(columns.openingBalance)}</td>
      <td style={amountCell}>{formatAmount(columns.debitCash)}</td>
      <td style={amountCell}>{formatAmount(columns.debitJournal)}</td>
      <td style={amountCell}>{formatAmount(columns.debitTotal)}</td>
      <td style={amountCell}>{formatAmount(columns.creditCash)}</td>
      <td style={amountCell}>{formatAmount(columns.creditJournal)}</td>
      <td style={amountCell}>{formatAmount(columns.creditTotal)}</td>
      <td style={amountCell}>{formatAmount(columns.closingBalance)}</td>
    </>
  );
};

export default function TrialBalanceTable({
  sections,
  totals,
}: TrialBalanceTableProps) {
  const grandTotal: TrialBalancePrintedRow = {
    key: "grand-total",
    serial: null,
    label: "Total :",
    isTotal: true,
    amounts: totals,
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan={2} style={centerCell}>
              SL No.
            </th>
            <th rowSpan={2}>Account Code &amp; Name</th>
            <th rowSpan={2} style={centerCell}>
              Opening balance
            </th>
            <th colSpan={3} style={centerCell}>
              Debit
            </th>
            <th colSpan={3} style={centerCell}>
              Credit
            </th>
            <th rowSpan={2} style={centerCell}>
              Closing balance
            </th>
          </tr>
          <tr>
            <th style={centerCell}>Cash</th>
            <th style={centerCell}>Journal</th>
            <th style={centerCell}>Total</th>
            <th style={centerCell}>Cash</th>
            <th style={centerCell}>Journal</th>
            <th style={centerCell}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <React.Fragment key={section.key}>
              {section.heading ? (
                <tr style={sectionRow}>
                  <td colSpan={COLUMN_COUNT}>{section.heading}</td>
                </tr>
              ) : null}

              {section.rows.map((row) => (
                <tr key={row.key} style={row.isTotal ? totalRow : undefined}>
                  <td style={centerCell}>{row.serial ?? ""}</td>
                  <td>{row.label}</td>
                  <AmountCells row={row} />
                </tr>
              ))}
            </React.Fragment>
          ))}

          <tr style={grandTotalRow}>
            <td style={centerCell} />
            <td>{grandTotal.label}</td>
            <AmountCells row={grandTotal} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
