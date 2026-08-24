using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.GetGeneralLedger;

/// <summary>
/// Subsidiary ledger for one office and date range, as JSON for the
/// on-screen table.
/// </summary>
/// <param name="OfficeId">
/// Any office in the hierarchy. Choosing a zone or an area includes every
/// office beneath it; leaving it out covers all offices.
/// </param>
/// <param name="AccLevel">
/// Which level of the chart the ledger is grouped under, 1 to 5. Combined
/// with <paramref name="AccCode"/> it also selects the accounts to
/// include: the named account and its descendants.
/// </param>
public sealed record GetGeneralLedgerQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    string? AccCode
) : IRequest<GeneralLedgerReportDto>;
