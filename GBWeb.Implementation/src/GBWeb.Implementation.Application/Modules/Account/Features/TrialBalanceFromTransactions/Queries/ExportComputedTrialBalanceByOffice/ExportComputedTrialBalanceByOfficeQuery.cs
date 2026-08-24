using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.ExportComputedTrialBalanceByOffice;

/// <summary>
/// The office-wise computed trial balance as a downloadable PDF or Excel
/// file.
/// </summary>
/// <remarks>
/// Every parameter except <see cref="Format"/> matches
/// GetComputedTrialBalanceByOfficeQuery, so the file always shows the
/// same figures as the table the user is looking at.
/// </remarks>
public sealed record ExportComputedTrialBalanceByOfficeQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    string? AccCode,
    bool ExceptHeadOffice,
    bool ExceptProjectOffice,
    TrialBalanceDetailLevel DetailLevel,
    TrialBalanceExportFormat Format
) : IRequest<TrialBalanceFileDto>;
