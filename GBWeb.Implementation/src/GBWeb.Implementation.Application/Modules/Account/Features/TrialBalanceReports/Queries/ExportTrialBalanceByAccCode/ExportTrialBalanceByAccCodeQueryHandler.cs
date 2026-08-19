using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByAccCode;

public sealed class ExportTrialBalanceByAccCodeQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions,
    ITrialBalanceReportPdfService pdfService,
    ITrialBalanceReportExcelService excelService)
    : IRequestHandler<
        ExportTrialBalanceByAccCodeQuery,
        TrialBalanceFileDto>
{
    public async Task<TrialBalanceFileDto> Handle(
        ExportTrialBalanceByAccCodeQuery request,
        CancellationToken cancellationToken)
    {
        var report = await TrialBalanceReader.ByAccCodeAsync(
            dbContext,
            request.DateFrom,
            request.DateTo,
            request.AccLevel,
            request.AccCode,
            cancellationToken);

        var companyName = await TrialBalanceOrganization.NameAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        var document = TrialBalanceDocumentBuilder.FromAccCode(
            report,
            companyName,
            request.DateFrom,
            request.DateTo);

        return TrialBalanceExport.Render(
            document,
            request.Format,
            "trial-balance-account-code-wise",
            pdfService,
            excelService);
    }
}
