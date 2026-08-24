namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

/// <summary>
/// One account block of the subsidiary ledger: the account heading, its
/// opening position, its transactions for the period, and its closing
/// position.
/// </summary>
/// <param name="AccCode">
/// The account the block is grouped under. When the request names an
/// Acc Level this is the ancestor code at that level, which is why the
/// rows underneath can carry a longer, deeper account code.
/// </param>
/// <param name="OpeningDebit">
/// Debits accumulated before Date From, so the opening line can print
/// the same three figures the legacy report prints.
/// </param>
/// <param name="OpeningBalance">
/// <paramref name="OpeningDebit"/> minus <paramref name="OpeningCredit"/>.
/// </param>
/// <param name="ClosingBalance">
/// Running balance after the last row, i.e. the opening balance plus the
/// period debits minus the period credits.
/// </param>
public sealed record GeneralLedgerAccountDto(
    string AccCode,
    string AccName,
    decimal OpeningDebit,
    decimal OpeningCredit,
    decimal OpeningBalance,
    IReadOnlyList<GeneralLedgerRowDto> Rows,
    decimal TotalDebit,
    decimal TotalCredit,
    decimal ClosingBalance
);
