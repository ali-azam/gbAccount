using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.ExportComputedTrialBalanceByOffice;

public sealed class ExportComputedTrialBalanceByOfficeQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions,
    ITrialBalanceReportPdfService pdfService,
    ITrialBalanceReportExcelService excelService)
    : IRequestHandler<
        ExportComputedTrialBalanceByOfficeQuery,
        TrialBalanceFileDto>
{
    public async Task<TrialBalanceFileDto> Handle(
        ExportComputedTrialBalanceByOfficeQuery request,
        CancellationToken cancellationToken)
    {
        var (report, officeName) = await TrialBalanceTransactionReader
            .ByOfficeAsync(
                dbContext,
                request.DateFrom,
                request.DateTo,
                request.OfficeId,
                request.AccLevel,
                request.AccCode,
                request.ExceptHeadOffice,
                request.ExceptProjectOffice,
                request.DetailLevel,
                cancellationToken);

        var companyName = await TrialBalanceOrganization.NameAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        var document = TrialBalanceDocumentBuilder.FromOffice(
            report,
            companyName,
            request.DateFrom,
            request.DateTo,
            officeName,
            detail: request.DetailLevel == TrialBalanceDetailLevel.Detail,
            fromSnapshot: false);

        return TrialBalanceTransactionExport.Render(
            document,
            request.Format,
            "trial-balance-office-wise",
            officeName,
            pdfService,
            excelService);
    }
}
