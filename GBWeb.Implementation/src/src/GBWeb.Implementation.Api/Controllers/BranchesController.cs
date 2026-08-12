using GBWeb.Implementation.Api.Security;
using GBWeb.Implementation.Application.Common.Security;
using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.DecideCreateBranch;
using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.SubmitCreateBranch;
using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Queries.GetBranchById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

public sealed class BranchesController(IMediator mediator) : ApiControllerBase
{
    [PermissionAuthorize(Permissions.BranchCreate)]
    [HttpPost]
    public async Task<IActionResult> Submit(SubmitCreateBranchCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded
            ? AcceptedAtAction(nameof(Decide), new { approvalRequestId = result.Value }, new { approvalRequestId = result.Value, status = "Pending" })
            : Conflict(new ProblemDetails { Title = result.Error, Status = StatusCodes.Status409Conflict });
    }

    [PermissionAuthorize(Permissions.ApprovalDecide)]
    [HttpPost("approvals/{approvalRequestId:guid}/decision")]
    public async Task<IActionResult> Decide(Guid approvalRequestId, ApprovalDecisionRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DecideCreateBranchCommand(approvalRequestId, request.Approve, request.Comment), cancellationToken);
        return result.Succeeded
            ? Ok(new { approvalRequestId, branchId = result.Value, status = request.Approve ? "Approved" : "Rejected" })
            : Conflict(new ProblemDetails { Title = result.Error, Status = StatusCodes.Status409Conflict });
    }

    [PermissionAuthorize(Permissions.BranchRead)]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var branch = await mediator.Send(new GetBranchByIdQuery(id), cancellationToken);
        return branch is null ? NotFound() : Ok(branch);
    }
}

public sealed record ApprovalDecisionRequest(bool Approve, string? Comment);
