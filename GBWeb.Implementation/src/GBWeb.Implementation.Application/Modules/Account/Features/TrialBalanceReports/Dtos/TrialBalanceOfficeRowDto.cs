namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// One office + account row of the Office wise trial balance.
/// Offices are kept separate here instead of being summed, which
/// is the difference between this and
/// <see cref="TrialBalanceAccCodeRowDto"/>.
/// </summary>
public sealed record TrialBalanceOfficeRowDto(
    int? FirstLevel,
    string? FirstLevelName,
    string? DepartmentCode,
    string? OfficeName,
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
