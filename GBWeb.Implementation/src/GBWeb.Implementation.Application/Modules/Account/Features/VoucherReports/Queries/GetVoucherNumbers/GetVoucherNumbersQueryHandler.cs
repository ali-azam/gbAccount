using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherNumbers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReportsQueries.GetVoucherNumbers;

public sealed class GetVoucherNumbersQueryHandler
    : IRequestHandler<GetVoucherNumbersQuery, IReadOnlyList<string>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetVoucherNumbersQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<string>> Handle(
        GetVoucherNumbersQuery request,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.AccTrxMasters
            .AsNoTracking()
            .Where(x =>
                x.TrxDate >= request.DateFrom &&
                x.TrxDate <= request.DateTo);

        if (!string.IsNullOrWhiteSpace(request.VoucherType))
        {
            query = query.Where(x =>
                x.VoucherType == request.VoucherType);
        }

        return await query
            .Where(x => x.VoucherNo != null)
            .Select(x => x.VoucherNo!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync(cancellationToken);
    }
}