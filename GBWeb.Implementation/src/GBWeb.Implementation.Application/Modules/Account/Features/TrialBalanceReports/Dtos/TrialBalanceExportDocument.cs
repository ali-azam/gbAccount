namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// Everything a renderer needs to draw the trial balance, with no
/// grouping, ordering or arithmetic left to do. Both the PDF and the
/// Excel writer consume this so the two stay identical.
/// </summary>
/// <param name="AsOnDate">
/// The snapshot the figures came from. OLRSTrailBalance stores one
/// complete trial balance per to_date, so this is usually earlier than
/// <paramref name="DateTo"/> and is printed to make that visible.
/// </param>
public sealed record TrialBalanceExportDocument(
    string CompanyName,
    string StatementTitle,
    string ReportTitle,
    DateTime? DateFrom,
    DateTime DateTo,
    DateTime? AsOnDate,
    IReadOnlyList<TrialBalanceExportSection> Sections,
    TrialBalanceExportRow GrandTotal
);
