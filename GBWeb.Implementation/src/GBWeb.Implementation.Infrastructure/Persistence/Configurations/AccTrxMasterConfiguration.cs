using GBWeb.Implementation.Domain.Modules.Account.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public sealed class AccTrxMasterConfiguration
    : IEntityTypeConfiguration<AccTrxMaster>
{
    public void Configure(
        EntityTypeBuilder<AccTrxMaster> builder)
    {
        builder.ToTable("AccTrxMaster", "dbo");

        builder.HasKey(x => x.TrxMasterID);

        builder.Property(x => x.TrxMasterID)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.OfficeID)
            .IsRequired();

        builder.Property(x => x.TrxDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.VoucherNo)
            .HasMaxLength(50)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(x => x.VoucherDesc)
            .HasMaxLength(200)
            .IsUnicode(false);

        builder.Property(x => x.VoucherType)
            .HasMaxLength(3)
            .IsUnicode(false);

        builder.Property(x => x.Reference)
            .HasMaxLength(125)
            .IsUnicode(false);

        builder.Property(x => x.CreateUser)
            .HasMaxLength(35)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(x => x.CreateDate)
            .HasColumnType("smalldatetime")
            .IsRequired();

        builder.Property(x => x.InActiveDate)
            .HasColumnType("smalldatetime");

        builder.HasMany(x => x.Details)
            .WithOne(x => x.TrxMaster)
            .HasForeignKey(x => x.TrxMasterID);
    }
}