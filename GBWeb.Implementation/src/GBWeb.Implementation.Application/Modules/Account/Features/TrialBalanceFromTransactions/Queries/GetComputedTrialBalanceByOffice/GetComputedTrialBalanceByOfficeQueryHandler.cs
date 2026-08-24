using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalanceByOffice;

public sealed class GetComputedTrialBalanceByOfficeQueryHandler(
    IApplicationDbContext dbContext)
    : IRequestHandler<
        GetComputedTrialBalanceByOfficeQuery,
        TrialBalanceOfficeReportDto>
{
    public async Task<TrialBalanceOfficeReportDto> Handle(
        GetComputedTrialBalanceByOfficeQuery request,
        CancellationToken cancellationToken)
    {
        // An empty result is returned as an empty report rather than as
        // an error: the screen has a row for saying so, and only the
        // export has nothing to show for it.
        var (report, _) = await TrialBalanceTransactionReader
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

        return report;
    }
}
