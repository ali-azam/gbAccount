using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public class YearlyTargetDataConfiguration : IEntityTypeConfiguration<YearlyTargetData>
{
    public void Configure(EntityTypeBuilder<YearlyTargetData> builder)
    {
        builder.ToTable("Yearly_Target_Data", "dbo");
        builder.HasKey(x => x.ID);
        builder.Property(x => x.ID).ValueGeneratedOnAdd();
    }
}
