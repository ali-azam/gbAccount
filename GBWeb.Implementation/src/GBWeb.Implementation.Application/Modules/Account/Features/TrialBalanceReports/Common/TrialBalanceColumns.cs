using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Turns the ten stored amounts into the seven money columns the
/// printed trial balance shows.
///
/// The report has no column for the previous journal amounts, so they
/// are folded into Journal. That is not a cosmetic choice — it is the
/// only way the row reconciles. Checked against real snapshot rows:
///
///   (op_debit - op_credit)
///     + (cur_debit + jr_debit + previouse_journal_debit)
///     - (cur_credit + jr_credit + previouse_journal_credit)
///     = bal_debit - bal_credithm
///
/// Dropping the previous journal amounts instead would leave every
/// closing balance wrong by that amount.
/// </summary>
internal static class TrialBalanceColumns
{
    public static decimal OpeningBalance(ITrialBalanceAmounts amounts) =>
        amounts.OpeningDebit - amounts.OpeningCredit;

    public static decimal DebitCash(ITrialBalanceAmounts amounts) =>
        amounts.CurrentDebit;

    public static decimal DebitJournal(ITrialBalanceAmounts amounts) =>
        amounts.JournalDebit + amounts.PreviousJournalDebit;

    public static decimal DebitTotal(ITrialBalanceAmounts amounts) =>
        DebitCash(amounts) + DebitJournal(amounts);

    public static decimal CreditCash(ITrialBalanceAmounts amounts) =>
        amounts.CurrentCredit;

    public static decimal CreditJournal(ITrialBalanceAmounts amounts) =>
        amounts.JournalCredit + amounts.PreviousJournalCredit;

    public static decimal CreditTotal(ITrialBalanceAmounts amounts) =>
        CreditCash(amounts) + CreditJournal(amounts);

    /// <summary>
    /// Taken from the stored balance columns rather than recomputed, so
    /// the report never disagrees with the snapshot it was built from.
    /// </summary>
    public static decimal ClosingBalance(ITrialBalanceAmounts amounts) =>
        amounts.BalanceDebit - amounts.BalanceCredit;

    public static TrialBalanceExportRow ToRow(
        int? serial,
        string label,
        bool isTotal,
        ITrialBalanceAmounts amounts)
    {
        return new TrialBalanceExportRow(
            serial,
            label,
            isTotal,
            OpeningBalance(amounts),
            DebitCash(amounts),
            DebitJournal(amounts),
            DebitTotal(amounts),
            CreditCash(amounts),
            CreditJournal(amounts),
            CreditTotal(amounts),
            ClosingBalance(amounts));
    }
}
