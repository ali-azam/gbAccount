namespace GBWeb.Implementation.Infrastructure.Identity;

public sealed class EntraIdOptions
{
    public const string SectionName = "EntraId";
    public string Instance { get; init; } = "https://login.microsoftonline.com/";
    public string TenantId { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string[] ValidIssuers { get; init; } = [];
}
