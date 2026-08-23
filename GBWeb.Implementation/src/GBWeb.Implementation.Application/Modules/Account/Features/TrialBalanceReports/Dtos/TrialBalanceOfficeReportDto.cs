namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// Office wise trial balance response.
/// </summary>
public sealed record TrialBalanceOfficeReportDto(
    DateTime? AsOnDate,
    int? AccLevel,
    IReadOnlyList<TrialBalanceOfficeRowDto> Rows,
    TrialBalanceTotalsDto Totals
);
