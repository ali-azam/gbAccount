using System.Security.Claims;
using GBWeb.Implementation.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace GBWeb.Implementation.Infrastructure.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;
    public string? UserId => User?.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
        ?? User?.FindFirstValue("oid")
        ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? UserName => User?.Identity?.Name;
    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
    public IReadOnlyCollection<string> Roles => User?.FindAll(ClaimTypes.Role).Select(x => x.Value).ToArray() ?? [];
    public IReadOnlyCollection<string> Permissions => User is null ? [] : User.FindAll("permissions")
        .Concat(User.FindAll("roles"))
        .Concat(User.FindAll("scp"))
        .SelectMany(x => x.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        .Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    public string? BranchId => User?.FindFirstValue("branch_id");
    public bool HasPermission(string permission) => Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);
}
