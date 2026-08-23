using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByAccCode;

public sealed class GetTrialBalanceByAccCodeQueryHandler
    : IRequestHandler<
        GetTrialBalanceByAccCodeQuery,
        TrialBalanceAccCodeReportDto>
{
    private readonly IApplicationDbContext _dbContext;

    public GetTrialBalanceByAccCodeQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<TrialBalanceAccCodeReportDto> Handle(
        GetTrialBalanceByAccCodeQuery request,
        CancellationToken cancellationToken)
    {
        return TrialBalanceReader.ByAccCodeAsync(
            _dbContext,
            request.DateFrom,
            request.DateTo,
            request.AccLevel,
            request.AccCode,
            cancellationToken);
    }
}
