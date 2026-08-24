using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.ExportGeneralLedger;

public sealed class ExportGeneralLedgerQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions,
    IGeneralLedgerReportPdfService pdfService,
    IGeneralLedgerReportExcelService excelService)
    : IRequestHandler<ExportGeneralLedgerQuery, GeneralLedgerFileDto>
{
    public async Task<GeneralLedgerFileDto> Handle(
        ExportGeneralLedgerQuery request,
        CancellationToken cancellationToken)
    {
        var companyName = await ReportOrganization.NameAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        var report = await GeneralLedgerReader.ReadAsync(
            dbContext,
            companyName,
            request.DateFrom,
            request.DateTo,
            request.OfficeId,
            request.AccLevel,
            request.AccCode,
            cancellationToken);

        return GeneralLedgerExport.Render(
            report,
            request.Format,
            "general-ledger",
            pdfService,
            excelService);
    }
}
