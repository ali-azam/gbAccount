using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.GetCashBook;

/// <summary>
/// Cash Book for one office and date range, as JSON for the on-screen
/// table.
/// </summary>
/// <param name="OfficeId">
/// Any office in the hierarchy. Choosing a zone or an area includes every
/// office beneath it; leaving it out covers all offices.
/// </param>
/// <param name="AccLevel">
/// Which level of the chart the Account Name column names, 1 to 5. It does
/// not change which postings appear — a cash book lists every cash and
/// bank movement — only how far up the chart each one is labelled.
/// </param>
public sealed record GetCashBookQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel
) : IRequest<CashBookReportDto>;
