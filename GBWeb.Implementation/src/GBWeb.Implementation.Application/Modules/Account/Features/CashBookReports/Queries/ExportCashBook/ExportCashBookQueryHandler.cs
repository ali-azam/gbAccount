using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.ExportCashBook;

public sealed class ExportCashBookQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions,
    ICashBookReportPdfService pdfService,
    ICashBookReportExcelService excelService)
    : IRequestHandler<ExportCashBookQuery, CashBookFileDto>
{
    public async Task<CashBookFileDto> Handle(
        ExportCashBookQuery request,
        CancellationToken cancellationToken)
    {
        var company = await ReportOrganization.HeaderAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        var report = await CashBookReader.ReadAsync(
            dbContext,
            company,
            CashBookControlAccounts.From(reportOptions.Value),
            request.DateFrom,
            request.DateTo,
            request.OfficeId,
            request.AccLevel,
            cancellationToken);

        return CashBookExport.Render(
            report,
            request.Format,
            "cash-book",
            pdfService,
            excelService);
    }
}
