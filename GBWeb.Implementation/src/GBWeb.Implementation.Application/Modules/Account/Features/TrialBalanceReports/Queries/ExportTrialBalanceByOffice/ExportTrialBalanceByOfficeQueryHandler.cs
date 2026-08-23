using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByOffice;

public sealed class ExportTrialBalanceByOfficeQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions,
    ITrialBalanceReportPdfService pdfService,
    ITrialBalanceReportExcelService excelService)
    : IRequestHandler<
        ExportTrialBalanceByOfficeQuery,
        TrialBalanceFileDto>
{
    public async Task<TrialBalanceFileDto> Handle(
        ExportTrialBalanceByOfficeQuery request,
        CancellationToken cancellationToken)
    {
        var report = await TrialBalanceReader.ByOfficeAsync(
            dbContext,
            request.DateFrom,
            request.DateTo,
            request.AccLevel,
            request.AccCode,
            request.DepartmentCode,
            cancellationToken);

        var companyName = await TrialBalanceOrganization.NameAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        var document = TrialBalanceDocumentBuilder.FromOffice(
            report,
            companyName,
            request.DateFrom,
            request.DateTo);

        return TrialBalanceExport.Render(
            document,
            request.Format,
            "trial-balance-office-wise",
            pdfService,
            excelService);
    }
}
