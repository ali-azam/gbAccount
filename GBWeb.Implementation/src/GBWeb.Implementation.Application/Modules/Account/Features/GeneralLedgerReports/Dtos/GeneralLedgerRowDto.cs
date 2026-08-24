namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

/// <summary>
/// One transaction line of the subsidiary ledger.
/// </summary>
/// <param name="TrxDate">Voucher date, printed as dd-MMM-yyyy.</param>
/// <param name="VoucherNo">
/// Voucher type and number joined the way the legacy report prints them,
/// e.g. <c>Cr-756-2026</c>.
/// </param>
/// <param name="Descripton">
/// Narration and transaction account code, e.g. <c>Bank Deposit-1001</c>.
/// Spelled the way the legacy column heading spells it so the two match.
/// </param>
/// <param name="Balance">
/// Running balance: the opening balance plus every debit and minus every
/// credit down to and including this row.
/// </param>
public sealed record GeneralLedgerRowDto(
    DateTime TrxDate,
    string VoucherNo,
    string Descripton,
    decimal Debit,
    decimal Credit,
    decimal Balance
);
