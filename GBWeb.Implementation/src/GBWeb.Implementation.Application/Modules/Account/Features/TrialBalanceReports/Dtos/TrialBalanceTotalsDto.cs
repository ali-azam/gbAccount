namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// Column totals for a trial balance. Debit and credit totals for
/// the balance columns should agree — the difference is exposed so
/// the UI can flag an out of balance snapshot instead of silently
/// showing one.
/// </summary>
public sealed record TrialBalanceTotalsDto(
    decimal OpeningDebit,
    decimal OpeningCredit,
    decimal CurrentDebit,
    decimal CurrentCredit,
    decimal JournalDebit,
    decimal JournalCredit,
    decimal PreviousJournalDebit,
    decimal PreviousJournalCredit,
    decimal BalanceDebit,
    decimal BalanceCredit) : ITrialBalanceAmounts
{
    public decimal BalanceDifference =>
        BalanceDebit - BalanceCredit;

    public bool IsBalanced =>
        BalanceDifference == 0m;
}
