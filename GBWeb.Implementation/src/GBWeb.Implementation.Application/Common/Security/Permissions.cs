namespace GBWeb.Implementation.Application.Common.Security;

public static class Permissions
{
    public const string BranchCreate = "organization.branch.create";
    public const string BranchRead = "organization.branch.read";
    public const string ApprovalDecide = "workflow.approval.decide";

    public static readonly IReadOnlyCollection<string> All =
    [
        BranchCreate,
        BranchRead,
        ApprovalDecide
    ];
}
