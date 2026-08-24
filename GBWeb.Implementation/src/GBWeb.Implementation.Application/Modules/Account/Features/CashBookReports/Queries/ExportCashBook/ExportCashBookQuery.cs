using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.ExportCashBook;

/// <summary>
/// Cash Book as a downloadable PDF or Excel file. Takes the same filters
/// as <see cref="GetCashBook.GetCashBookQuery"/> plus the Report Type
/// chosen in the UI.
/// </summary>
public sealed record ExportCashBookQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    CashBookExportFormat Format
) : IRequest<CashBookFileDto>;
