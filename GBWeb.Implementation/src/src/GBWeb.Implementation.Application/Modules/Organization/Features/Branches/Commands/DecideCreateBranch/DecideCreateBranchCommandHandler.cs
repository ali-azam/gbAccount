using System.Text.Json;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Models;
using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.SubmitCreateBranch;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.DecideCreateBranch;

public sealed class DecideCreateBranchCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUser)
    : IRequestHandler<DecideCreateBranchCommand, Result<Guid?>>
{
    public async Task<Result<Guid?>> Handle(DecideCreateBranchCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result<Guid?>.Failure("An authenticated checker is required.");

        var approval = await dbContext.ApprovalRequests.SingleOrDefaultAsync(x => x.Id == request.ApprovalRequestId, cancellationToken);
        if (approval is null || approval.Module != "Organization" || approval.Operation != "CreateBranch")
            return Result<Guid?>.Failure("Approval request was not found.");

        if (!request.Approve)
        {
            approval.Reject(currentUser.UserId, request.Comment ?? string.Empty);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result<Guid?>.Success(null);
        }

        var payload = JsonSerializer.Deserialize<SubmitCreateBranchCommand>(approval.PayloadJson)
            ?? throw new InvalidOperationException("Approval payload is invalid.");
        var normalizedCode = payload.BranchCode.Trim().ToUpperInvariant();
        if (await dbContext.Branches.AnyAsync(x => x.BranchCode == normalizedCode, cancellationToken))
            return Result<Guid?>.Failure("A branch with this code already exists.");

        approval.Approve(currentUser.UserId, request.Comment);
        var branch = Branch.Create(payload.BranchCode, payload.BranchName, payload.ParentOfficeId);
        dbContext.Branches.Add(branch);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<Guid?>.Success(branch.Id);
    }
}
