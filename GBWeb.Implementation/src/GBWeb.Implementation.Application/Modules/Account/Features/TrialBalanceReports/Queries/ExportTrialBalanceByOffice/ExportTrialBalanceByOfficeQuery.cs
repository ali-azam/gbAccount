using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByOffice;

/// <summary>
/// Office wise trial balance as a downloadable PDF or Excel file.
/// </summary>
public sealed record ExportTrialBalanceByOfficeQuery(
    DateTime? DateFrom,
    DateTime DateTo,
    int? AccLevel,
    string? AccCode,
    string? DepartmentCode,
    TrialBalanceExportFormat Format
) : IRequest<TrialBalanceFileDto>;
