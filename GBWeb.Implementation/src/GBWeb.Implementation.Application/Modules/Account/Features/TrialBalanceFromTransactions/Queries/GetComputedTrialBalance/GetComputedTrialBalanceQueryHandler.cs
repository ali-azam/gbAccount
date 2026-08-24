using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalance;

public sealed class GetComputedTrialBalanceQueryHandler(
    IApplicationDbContext dbContext)
    : IRequestHandler<
        GetComputedTrialBalanceQuery,
        TrialBalanceAccCodeReportDto>
{
    public async Task<TrialBalanceAccCodeReportDto> Handle(
        GetComputedTrialBalanceQuery request,
        CancellationToken cancellationToken)
    {
        // An empty result is returned as an empty report rather than as
        // an error: the screen has a row for saying so, and only the
        // export has nothing to show for it.
        var (report, _) = await TrialBalanceTransactionReader
            .ByAccountAsync(
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

        return report;
    }
}
