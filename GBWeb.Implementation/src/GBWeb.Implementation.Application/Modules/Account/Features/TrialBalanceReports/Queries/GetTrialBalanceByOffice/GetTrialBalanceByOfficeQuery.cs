using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByOffice;

/// <summary>
/// Office wise trial balance — one row per office and account, so the
/// same account appears once for each office that has a balance.
/// Backs the "View Office Wise" button on the Account Code wise
/// Trial Balance screen.
/// </summary>
public sealed record GetTrialBalanceByOfficeQuery(
    DateTime? DateFrom,
    DateTime DateTo,
    int? AccLevel,
    string? AccCode,
    string? DepartmentCode
) : IRequest<TrialBalanceOfficeReportDto>;
