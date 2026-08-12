namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Dtos;

public sealed record BranchDto(Guid Id, string BranchCode, string BranchName, string Status);
