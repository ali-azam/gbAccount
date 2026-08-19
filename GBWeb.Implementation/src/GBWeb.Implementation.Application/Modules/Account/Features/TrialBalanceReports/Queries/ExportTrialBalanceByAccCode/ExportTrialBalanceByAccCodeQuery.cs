using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByAccCode;

/// <summary>
/// Account Code wise trial balance as a downloadable PDF or Excel file.
/// Takes the same filters as
/// <see cref="GetTrialBalanceByAccCode.GetTrialBalanceByAccCodeQuery"/>
/// plus the Report Type chosen in the UI.
/// </summary>
public sealed record ExportTrialBalanceByAccCodeQuery(
    DateTime? DateFrom,
    DateTime DateTo,
    int? AccLevel,
    string? AccCode,
    TrialBalanceExportFormat Format
) : IRequest<TrialBalanceFileDto>;
