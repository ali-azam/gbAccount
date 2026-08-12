namespace GBWeb.Implementation.Domain.Common.Entities;

public sealed class AuditLog : BaseEntity<long>
{
    public DateTimeOffset OccurredAtUtc { get; init; }
    public string UserId { get; init; } = "system";
    public string? UserName { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string? OldValuesJson { get; init; }
    public string? NewValuesJson { get; init; }
    public string? CorrelationId { get; init; }
    public string? IpAddress { get; init; }
}
