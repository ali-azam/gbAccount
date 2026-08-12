using Microsoft.AspNetCore.Authorization;

namespace GBWeb.Implementation.Api.Security;

public sealed class PermissionAuthorizeAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Permission:";
    public PermissionAuthorizeAttribute(string permission) => Policy = PolicyPrefix + permission;
}
