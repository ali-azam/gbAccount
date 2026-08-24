using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.ExportComputedTrialBalance;

/// <summary>
/// Trial balance computed from live vouchers, one row per account, as a
/// downloadable PDF or Excel file.
/// </summary>
public sealed record ExportComputedTrialBalanceQuery(
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
