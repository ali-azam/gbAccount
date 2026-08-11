using System;
using System.Collections.Generic;
using GbAccount.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GbAccount.Api.Data;

public partial class GbAccountDbContext : DbContext
{
    public GbAccountDbContext(DbContextOptions<GbAccountDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AccCategory> AccCategories { get; set; }

    public virtual DbSet<AccChart> AccCharts { get; set; }

    public virtual DbSet<Organization> Organizations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AccCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId);

            entity.ToTable("AccCategory");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryName).HasMaxLength(50);
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())", "DF_AccCategory_CreateDate")
                .HasColumnType("smalldatetime");
            entity.Property(e => e.CreateUser)
                .HasMaxLength(35)
                .IsUnicode(false)
                .HasDefaultValueSql("(suser_sname())", "DF_AccCategory_CreateUser");
        });

        modelBuilder.Entity<AccChart>(entity =>
        {
            entity.HasKey(e => e.AccId);

            entity.ToTable("AccChart");

            entity.Property(e => e.AccId).HasColumnName("AccID");
            entity.Property(e => e.AccCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.AccName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Address).HasMaxLength(150);
            entity.Property(e => e.BankAccountNo).HasMaxLength(50);
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())", "DF_AccChart_CreateDate")
                .HasColumnType("smalldatetime");
            entity.Property(e => e.CreateUser)
                .HasMaxLength(35)
                .IsUnicode(false)
                .HasDefaultValueSql("(suser_sname())", "DF_AccChart_CreateUser");
            entity.Property(e => e.FifthLevel)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FirstLevel)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FourthLevel)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.InActiveDate).HasColumnType("smalldatetime");
            entity.Property(e => e.ModuleId)
                .HasComment("1=Accounting, 2= Portfolio")
                .HasColumnName("ModuleID");
            entity.Property(e => e.Nature)
                .HasMaxLength(2)
                .IsUnicode(false);
            entity.Property(e => e.NoteId).HasColumnName("NoteID");
            entity.Property(e => e.OrgId)
                .HasDefaultValue(1, "DF_AccChart_OrgID")
                .HasColumnName("OrgID");
            entity.Property(e => e.SecondLevel)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ThirdLevel)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Category).WithMany(p => p.AccCharts)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_AccChart_AccCategory");

            entity.HasOne(d => d.Org).WithMany(p => p.AccCharts)
                .HasForeignKey(d => d.OrgId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AccChart_Organization");
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.OrgId);

            entity.ToTable("Organization");

            entity.Property(e => e.OrgId)
                .ValueGeneratedNever()
                .HasColumnName("OrgID");
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())", "DF_Organization_CreateDate")
                .HasColumnType("smalldatetime");
            entity.Property(e => e.CreateUser)
                .HasMaxLength(35)
                .IsUnicode(false)
                .HasDefaultValueSql("(suser_sname())", "DF_Organization_CreateUser");
            entity.Property(e => e.GuarantorAge).HasDefaultValue(0, "DF__Organizat__Guara__43CE8565");
            entity.Property(e => e.InActiveDate).HasColumnType("smalldatetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true, "DF_Organization_IsActive");
            entity.Property(e => e.OrgAddress)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasDefaultValue("ABC", "DF__Organizat__OrgAd__702B5F39");
            entity.Property(e => e.OrgLogo).HasColumnName("OrgLOGO");
            entity.Property(e => e.OrganizationCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.OrganizationName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
