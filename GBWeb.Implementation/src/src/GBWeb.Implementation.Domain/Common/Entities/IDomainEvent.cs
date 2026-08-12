namespace GBWeb.Implementation.Domain.Common.Entities;

public interface IDomainEvent
{
    DateTimeOffset OccurredAtUtc { get; }
}
