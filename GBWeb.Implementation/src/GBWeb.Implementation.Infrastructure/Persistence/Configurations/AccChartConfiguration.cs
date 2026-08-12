using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations
{
    public sealed class AccChartConfiguration : IEntityTypeConfiguration<AccChart>
    {
        public void Configure(EntityTypeBuilder<AccChart> builder)
        {
            builder.HasOne(c => c.AccCategory)
                .WithMany(cat => cat.AccCharts)
                .HasForeignKey(c => c.CategoryID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.Organization)
                .WithMany(org => org.AccCharts)
                .HasForeignKey(c => c.OrgID)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
