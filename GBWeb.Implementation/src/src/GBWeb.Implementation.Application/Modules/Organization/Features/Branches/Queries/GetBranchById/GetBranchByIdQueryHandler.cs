using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Queries.GetBranchById;

public sealed class GetBranchByIdQueryHandler(IApplicationDbContext dbContext) : IRequestHandler<GetBranchByIdQuery, BranchDto?>
{
    public Task<BranchDto?> Handle(GetBranchByIdQuery request, CancellationToken cancellationToken) =>
        dbContext.Branches.AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(x => new BranchDto(x.Id, x.BranchCode, x.BranchName, x.Status.ToString()))
            .SingleOrDefaultAsync(cancellationToken);
}
