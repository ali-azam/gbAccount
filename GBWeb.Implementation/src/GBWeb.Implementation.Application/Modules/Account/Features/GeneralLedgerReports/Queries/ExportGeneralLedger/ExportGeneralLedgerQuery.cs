using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.ExportGeneralLedger;

/// <summary>
/// Subsidiary ledger as a downloadable PDF or Excel file. Takes the same
/// filters as
/// <see cref="GetGeneralLedger.GetGeneralLedgerQuery"/> plus the Report
/// Type chosen in the UI.
/// </summary>
public sealed record ExportGeneralLedgerQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    string? AccCode,
    GeneralLedgerExportFormat Format
) : IRequest<GeneralLedgerFileDto>;
