using GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Queries.GetBranchById;

public sealed record GetBranchByIdQuery(Guid Id) : IRequest<BranchDto?>;
