namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

/// <summary>
/// The whole subsidiary ledger for one office and date range. The screen
/// table, the PDF and the worksheet are all rendered from this one shape.
/// </summary>
/// <param name="CompanyName">
/// Organisation name from the Organization table, resolved through
/// Reports:OrganizationId — never hardcoded.
/// </param>
/// <param name="OfficeName">
/// Name of the selected office. Selecting a zone or an area prints that
/// name while still including every office beneath it.
/// </param>
/// <param name="ReportTitle">Always "Subsidiary Ledger".</param>
/// <param name="TotalDebit">
/// Period debits across every account block. The legacy report prints
/// this and <paramref name="TotalCredit"/> on a closing Total line and
/// leaves the Balance column of that line empty.
/// </param>
public sealed record GeneralLedgerReportDto(
    string CompanyName,
    string OfficeName,
    string ReportTitle,
    DateTime DateFrom,
    DateTime DateTo,
    IReadOnlyList<GeneralLedgerAccountDto> Accounts,
    decimal TotalDebit,
    decimal TotalCredit
);
