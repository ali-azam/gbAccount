using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches", "org");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.BranchCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.BranchName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasIndex(x => x.BranchCode).IsUnique();
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
