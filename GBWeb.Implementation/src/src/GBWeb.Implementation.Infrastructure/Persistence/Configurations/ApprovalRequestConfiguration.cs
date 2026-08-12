using GBWeb.Implementation.Domain.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public sealed class ApprovalRequestConfiguration : IEntityTypeConfiguration<ApprovalRequest>
{
    public void Configure(EntityTypeBuilder<ApprovalRequest> builder)
    {
        builder.ToTable("ApprovalRequests", "workflow");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Module).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Operation).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.RequestedByUserId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DecidedByUserId).HasMaxLength(100);
        builder.Property(x => x.DecisionComment).HasMaxLength(1000);
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasIndex(x => new { x.ApprovalStatus, x.Module, x.RequestedAtUtc });
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
