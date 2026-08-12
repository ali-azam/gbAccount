using GBWeb.Implementation.Domain.Common.Entities;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Branch> Branches { get; }
    DbSet<ApprovalRequest> ApprovalRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
