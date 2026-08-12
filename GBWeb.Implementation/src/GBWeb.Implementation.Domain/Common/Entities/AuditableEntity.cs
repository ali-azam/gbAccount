using GBWeb.Implementation.Domain.Common.Enums;
using GBWeb.Implementation.Domain.Common.Interfaces;

namespace GBWeb.Implementation.Domain.Common.Entities;

public abstract class AuditableEntity<TKey> : BaseEntity<TKey>, IAuditableEntity
{
    public DateTimeOffset CreatedAtUtc { get; set; }
    public string? CreatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }
    public string? UpdatedByUserId { get; set; }
    public RecordStatus Status { get; set; } = RecordStatus.Active;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAtUtc { get; set; }
    public string? DeletedByUserId { get; set; }
    public byte[] RowVersion { get; set; } = [];
}
