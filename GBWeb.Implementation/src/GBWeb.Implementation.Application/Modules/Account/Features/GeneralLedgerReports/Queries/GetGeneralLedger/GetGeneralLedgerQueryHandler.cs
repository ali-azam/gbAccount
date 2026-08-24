using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.GetGeneralLedger;

public sealed class GetGeneralLedgerQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions)
    : IRequestHandler<GetGeneralLedgerQuery, GeneralLedgerReportDto>
{
    public async Task<GeneralLedgerReportDto> Handle(
        GetGeneralLedgerQuery request,
        CancellationToken cancellationToken)
    {
        var companyName = await ReportOrganization.NameAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        // An empty result is returned as an empty report rather than as
        // an error: the screen has a row for saying so, and only the
        // export has nothing to show for it.
        return await GeneralLedgerReader.ReadAsync(
            dbContext,
            companyName,
            request.DateFrom,
            request.DateTo,
            request.OfficeId,
            request.AccLevel,
            request.AccCode,
            cancellationToken);
    }
}
