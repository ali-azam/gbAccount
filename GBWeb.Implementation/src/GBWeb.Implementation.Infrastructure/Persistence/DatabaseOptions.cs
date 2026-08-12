namespace GBWeb.Implementation.Infrastructure.Persistence;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";
    public int MaxRetryCount { get; init; } = 5;
    public int MaxRetryDelaySeconds { get; init; } = 10;
    public int CommandTimeoutSeconds { get; init; } = 30;
}
