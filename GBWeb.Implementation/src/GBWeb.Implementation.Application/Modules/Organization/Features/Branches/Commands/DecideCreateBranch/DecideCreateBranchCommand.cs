using GBWeb.Implementation.Application.Common.Models;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.DecideCreateBranch;

public sealed record DecideCreateBranchCommand(Guid ApprovalRequestId, bool Approve, string? Comment)
    : IRequest<Result<Guid?>>;
