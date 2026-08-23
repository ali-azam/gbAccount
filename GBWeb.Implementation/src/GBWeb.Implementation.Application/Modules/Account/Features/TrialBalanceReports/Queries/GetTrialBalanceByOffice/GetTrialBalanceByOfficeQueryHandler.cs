using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByOffice;

public sealed class GetTrialBalanceByOfficeQueryHandler
    : IRequestHandler<
        GetTrialBalanceByOfficeQuery,
        TrialBalanceOfficeReportDto>
{
    private readonly IApplicationDbContext _dbContext;

    public GetTrialBalanceByOfficeQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<TrialBalanceOfficeReportDto> Handle(
        GetTrialBalanceByOfficeQuery request,
        CancellationToken cancellationToken)
    {
        return TrialBalanceReader.ByOfficeAsync(
            _dbContext,
            request.DateFrom,
            request.DateTo,
            request.AccLevel,
            request.AccCode,
            request.DepartmentCode,
            cancellationToken);
    }
}
