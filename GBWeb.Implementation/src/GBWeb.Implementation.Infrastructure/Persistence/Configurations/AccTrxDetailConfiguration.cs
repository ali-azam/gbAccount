using GBWeb.Implementation.Domain.Modules.Account.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public sealed class AccTrxDetailConfiguration
    : IEntityTypeConfiguration<AccTrxDetail>
{
    public void Configure(
        EntityTypeBuilder<AccTrxDetail> builder)
    {
        builder.ToTable("AccTrxDetail", "dbo");

        builder.HasKey(x => x.TrxDetailsID);

        builder.Property(x => x.TrxDetailsID)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Credit)
            .HasPrecision(18, 2);

        builder.Property(x => x.Debit)
            .HasPrecision(18, 2);

        builder.Property(x => x.Narration)
            .HasMaxLength(200)
            .IsUnicode(true);

        builder.Property(x => x.CreateUser)
            .HasMaxLength(35)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(x => x.CreateDate)
            .HasColumnType("smalldatetime")
            .IsRequired();

        builder.Property(x => x.InActiveDate)
            .HasColumnType("smalldatetime");

        builder.HasOne(x => x.TrxMaster)
            .WithMany(x => x.Details)
            .HasForeignKey(x => x.TrxMasterID)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Account)
            .WithMany()
            .HasForeignKey(x => x.AccID)
            .OnDelete(DeleteBehavior.Restrict);
    }
}