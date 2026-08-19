namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// One printed line of the trial balance, already reduced to the seven
/// money columns the report shows. Detail lines and subtotal lines use
/// the same shape so a renderer only has to walk a flat list.
/// </summary>
/// <param name="Serial">
/// SL No. for a detail line. Null on a subtotal line, which the legacy
/// report leaves blank.
/// </param>
/// <param name="Label">
/// What goes in the "Account Code &amp; Name" column, already formatted
/// — "101001, Cash in Hand" or "101000, Cash in Hand _Total".
/// </param>
public sealed record TrialBalanceExportRow(
    int? Serial,
    string Label,
    bool IsTotal,
    decimal OpeningBalance,
    decimal DebitCash,
    decimal DebitJournal,
    decimal DebitTotal,
    decimal CreditCash,
    decimal CreditJournal,
    decimal CreditTotal,
    decimal ClosingBalance
);
