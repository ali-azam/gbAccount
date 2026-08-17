using GBWeb.Implementation.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherTypes;

public sealed class GetVoucherTypesQueryHandler
    : IRequestHandler<GetVoucherTypesQuery, IReadOnlyList<string>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetVoucherTypesQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<string>> Handle(
        GetVoucherTypesQuery request,
        CancellationToken cancellationToken)
    {
        return await _dbContext.AccTrxMasters
            .AsNoTracking()
            .Where(x =>
                x.VoucherType != null &&
                x.VoucherType != "")
            .Select(x => x.VoucherType!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync(cancellationToken);
    }
}