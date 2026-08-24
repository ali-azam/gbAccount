namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

/// <summary>
/// One line of the Cash Book: a voucher posting that moved money into or
/// out of cash or bank. Exactly one of the four money columns is non-zero.
/// </summary>
/// <param name="AccountName">
/// The account on the other side of the cash or bank leg — where the money
/// came from on a receipt, where it went on a payment. Rolled up to the
/// requested Acc Level, and <c>-</c> when the chart has no name for it.
/// </param>
/// <param name="Description">
/// The posting's narration, as stored. Blank when the entry was made
/// without one, which is how the legacy report prints it.
/// </param>
public sealed record CashBookRowDto(
    string VoucherNo,
    string AccountName,
    string Description,
    decimal CashReceipt,
    decimal CashPayment,
    decimal BankReceipt,
    decimal BankPayment
);
