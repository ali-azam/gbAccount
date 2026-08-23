namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// One office block of the printed report.
/// </summary>
/// <param name="Band">
/// The full width heading printed above the block, e.g.
/// "OfficeCode: 0001, GRAM". Null on the Account Code wise report,
/// which is consolidated and therefore has no office heading.
/// </param>
/// <param name="Rows">
/// Detail and subtotal lines in print order.
/// </param>
public sealed record TrialBalanceExportSection(
    string? Band,
    IReadOnlyList<TrialBalanceExportRow> Rows
);
