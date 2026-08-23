namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// One account row of the Account Code wise trial balance,
/// aggregated across every office in the snapshot.
/// </summary>
public sealed record TrialBalanceAccCodeRowDto(
    string? AccCode,
    string? AccName,
    string? AccLevel,
    string? TopLevelCode,
    string? TopLevelName,
    decimal OpeningDebit,
    decimal OpeningCredit,
    decimal CurrentDebit,
    decimal CurrentCredit,
    decimal JournalDebit,
    decimal JournalCredit,
    decimal PreviousJournalDebit,
    decimal PreviousJournalCredit,
    decimal BalanceDebit,
    decimal BalanceCredit
) : ITrialBalanceAmounts;
