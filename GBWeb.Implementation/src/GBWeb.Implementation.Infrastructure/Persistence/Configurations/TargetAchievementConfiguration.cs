using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public class TargetAchievementConfiguration : IEntityTypeConfiguration<TargetAchievement>
{
    public void Configure(EntityTypeBuilder<TargetAchievement> builder)
    {
        builder.ToTable("targetachievement", "dbo");
        builder.HasKey(x => x.TargetId);
        builder.Property(x => x.TargetId).ValueGeneratedOnAdd();
        builder.Property(x => x.BudgetParticularId).HasColumnName("ParticularId");
    }
}
