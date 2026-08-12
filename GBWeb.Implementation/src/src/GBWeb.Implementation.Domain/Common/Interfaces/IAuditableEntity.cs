using GBWeb.Implementation.Domain.Common.Enums;

namespace GBWeb.Implementation.Domain.Common.Interfaces;

public interface IAuditableEntity
{
    DateTimeOffset CreatedAtUtc { get; set; }
    string? CreatedByUserId { get; set; }
    DateTimeOffset? UpdatedAtUtc { get; set; }
    string? UpdatedByUserId { get; set; }
    RecordStatus Status { get; set; }
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedAtUtc { get; set; }
    string? DeletedByUserId { get; set; }
    byte[] RowVersion { get; set; }
}
