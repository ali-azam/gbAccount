using GBWeb.Implementation.Domain.Common.Entities;

namespace GBWeb.Implementation.Domain.Modules.Organization.Entities;

public sealed class Branch : AuditableEntity<Guid>
{
    public string BranchCode { get; private set; } = string.Empty;
    public string BranchName { get; private set; } = string.Empty;
    public Guid? ParentOfficeId { get; private set; }

    private Branch() { }

    public static Branch Create(string branchCode, string branchName, Guid? parentOfficeId)
    {
        if (string.IsNullOrWhiteSpace(branchCode)) throw new ArgumentException("Branch code is required.", nameof(branchCode));
        if (string.IsNullOrWhiteSpace(branchName)) throw new ArgumentException("Branch name is required.", nameof(branchName));
        return new Branch
        {
            Id = Guid.NewGuid(),
            BranchCode = branchCode.Trim().ToUpperInvariant(),
            BranchName = branchName.Trim(),
            ParentOfficeId = parentOfficeId
        };
    }
}
