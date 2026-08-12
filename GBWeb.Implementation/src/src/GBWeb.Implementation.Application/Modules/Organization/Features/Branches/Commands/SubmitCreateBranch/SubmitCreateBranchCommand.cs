using GBWeb.Implementation.Application.Common.Models;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.SubmitCreateBranch;

public sealed record SubmitCreateBranchCommand(string BranchCode, string BranchName, Guid? ParentOfficeId)
    : IRequest<Result<Guid>>;
