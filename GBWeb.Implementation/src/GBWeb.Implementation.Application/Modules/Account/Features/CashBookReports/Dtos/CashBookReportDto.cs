namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

/// <summary>
/// The whole Cash Book for one office and date range. The screen table,
/// the PDF and the worksheet are all rendered from this one shape.
/// </summary>
/// <param name="CompanyName">
/// Organisation name from the Organization table, resolved through
/// Reports:OrganizationId — never hardcoded.
/// </param>
/// <param name="CompanyAddress">
/// OrgAddress from the same row, printed under the name. Empty when the
/// organisation has no address on file.
/// </param>
/// <param name="OfficeName">
/// Name of the selected office. Selecting a zone or an area prints that
/// name while still including every office beneath it.
/// </param>
/// <param name="OpeningCash">
/// Cash receipts less cash payments over every date before Date From. A
/// cash book's opening balance is its own running total carried forward,
/// which is why it is measured the same way the period columns are rather
/// than read off the chart.
/// </param>
/// <param name="ClosingCash">
/// <paramref name="OpeningCash"/> plus the period's cash receipts less its
/// cash payments. This is also the Cash In Hand figure the header prints.
/// </param>
public sealed record CashBookReportDto(
    string CompanyName,
    string CompanyAddress,
    string ReportTitle,
    string OfficeName,
    DateTime DateFrom,
    DateTime DateTo,
    decimal OpeningCash,
    decimal OpeningBank,
    IReadOnlyList<CashBookRowDto> Rows,
    decimal TotalCashReceipt,
    decimal TotalCashPayment,
    decimal TotalBankReceipt,
    decimal TotalBankPayment,
    decimal ClosingCash,
    decimal ClosingBank
);
