using GBWeb.Implementation.Domain.Common.Enums;
using GBWeb.Implementation.Domain.Common.Exceptions;

namespace GBWeb.Implementation.Domain.Common.Entities;

public sealed class ApprovalRequest : AuditableEntity<Guid>
{
    public string Module { get; private set; } = string.Empty;
    public string Operation { get; private set; } = string.Empty;
    public string PayloadJson { get; private set; } = string.Empty;
    public ApprovalStatus ApprovalStatus { get; private set; } = ApprovalStatus.Pending;
    public string RequestedByUserId { get; private set; } = string.Empty;
    public DateTimeOffset RequestedAtUtc { get; private set; }
    public string? DecidedByUserId { get; private set; }
    public DateTimeOffset? DecidedAtUtc { get; private set; }
    public string? DecisionComment { get; private set; }

    private ApprovalRequest() { }

    public static ApprovalRequest Create(string module, string operation, string payloadJson, string requestedByUserId)
    {
        if (string.IsNullOrWhiteSpace(requestedByUserId))
            throw new DomainException("An authenticated maker is required.");

        return new ApprovalRequest
        {
            Id = Guid.NewGuid(),
            Module = module.Trim(),
            Operation = operation.Trim(),
            PayloadJson = payloadJson,
            RequestedByUserId = requestedByUserId,
            RequestedAtUtc = DateTimeOffset.UtcNow
        };
    }

    public void Approve(string checkerUserId, string? comment)
    {
        EnsurePendingAndDifferentUser(checkerUserId);
        ApprovalStatus = ApprovalStatus.Approved;
        CompleteDecision(checkerUserId, comment);
    }

    public void Reject(string checkerUserId, string comment)
    {
        EnsurePendingAndDifferentUser(checkerUserId);
        if (string.IsNullOrWhiteSpace(comment))
            throw new DomainException("A rejection reason is required.");
        ApprovalStatus = ApprovalStatus.Rejected;
        CompleteDecision(checkerUserId, comment);
    }

    private void EnsurePendingAndDifferentUser(string checkerUserId)
    {
        if (ApprovalStatus != ApprovalStatus.Pending)
            throw new DomainException("Only pending requests can be decided.");
        if (string.Equals(RequestedByUserId, checkerUserId, StringComparison.OrdinalIgnoreCase))
            throw new DomainException("The maker cannot approve or reject their own request.");
    }

    private void CompleteDecision(string checkerUserId, string? comment)
    {
        DecidedByUserId = checkerUserId;
        DecidedAtUtc = DateTimeOffset.UtcNow;
        DecisionComment = comment?.Trim();
    }
}
