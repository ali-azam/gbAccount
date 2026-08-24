using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using MediatR;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.GetCashBook;

public sealed class GetCashBookQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions)
    : IRequestHandler<GetCashBookQuery, CashBookReportDto>
{
    public async Task<CashBookReportDto> Handle(
        GetCashBookQuery request,
        CancellationToken cancellationToken)
    {
        var company = await ReportOrganization.HeaderAsync(
            dbContext,
            reportOptions.Value.OrganizationId,
            cancellationToken);

        // An empty result is returned as an empty report rather than as
        // an error: the screen has a row for saying so, and a day with no
        // movement still has an opening and a closing position, which is
        // what the printed report shows too.
        return await CashBookReader.ReadAsync(
            dbContext,
            company,
            CashBookControlAccounts.From(reportOptions.Value),
            request.DateFrom,
            request.DateTo,
            request.OfficeId,
            request.AccLevel,
            cancellationToken);
    }
}
