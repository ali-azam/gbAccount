using System.Text.Json;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Models;
using GBWeb.Implementation.Domain.Common.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.SubmitCreateBranch;

public sealed class SubmitCreateBranchCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUser)
    : IRequestHandler<SubmitCreateBranchCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(SubmitCreateBranchCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result<Guid>.Failure("An authenticated maker is required.");

        var normalizedCode = request.BranchCode.Trim().ToUpperInvariant();
        if (await dbContext.Branches.AnyAsync(x => x.BranchCode == normalizedCode, cancellationToken))
            return Result<Guid>.Failure("A branch with this code already exists.");

        var approval = ApprovalRequest.Create(
            "Organization",
            "CreateBranch",
            JsonSerializer.Serialize(request),
            currentUser.UserId);

        dbContext.ApprovalRequests.Add(approval);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<Guid>.Success(approval.Id);
    }
}
