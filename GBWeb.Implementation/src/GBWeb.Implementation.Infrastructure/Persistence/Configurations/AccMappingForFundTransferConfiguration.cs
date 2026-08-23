using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public class AccMappingForFundTransferConfiguration : IEntityTypeConfiguration<AccMappingForFundTransfer>
{
    public void Configure(EntityTypeBuilder<AccMappingForFundTransfer> builder)
    {
        builder.ToTable("AccMappingForFundTransfer", "dbo");
        builder.HasKey(x => x.ID);
        builder.Property(x => x.ID).ValueGeneratedOnAdd();
    }
}
