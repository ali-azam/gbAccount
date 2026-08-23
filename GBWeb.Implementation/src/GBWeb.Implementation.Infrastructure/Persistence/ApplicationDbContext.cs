using System.Text.Json;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Common.Entities;
using GBWeb.Implementation.Domain.Common.Interfaces;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    IHttpContextAccessor httpContextAccessor)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Branch> Branches => Set<Branch>();

    public DbSet<Office> Offices => Set<Office>();

    public DbSet<AccCategory> AccCategories => Set<AccCategory>();
    public DbSet<AccChart> AccCharts => Set<AccChart>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<GbAccount> GbAccounts => Set<GbAccount>();
    public DbSet<AccTrxMaster> AccTrxMasters => Set<AccTrxMaster>();
    public DbSet<AccTrxDetail> AccTrxDetails => Set<AccTrxDetail>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetParticular> BudgetParticulars => Set<BudgetParticular>();
    public DbSet<AccNote> AccNotes => Set<AccNote>();
    public DbSet<PKSFFundLoan> PKSFFundLoans => Set<PKSFFundLoan>();
    public DbSet<AccMappingForFundTransfer> AccMappingForFundTransfers => Set<AccMappingForFundTransfer>();
    public DbSet<TargetAchievement> TargetAchievements => Set<TargetAchievement>();
    public DbSet<YearlyTargetData> YearlyTargetDatas => Set<YearlyTargetData>();

    public DbSet<ApprovalRequest> ApprovalRequests =>
        Set<ApprovalRequest>();

    public DbSet<AuditLog> AuditLogs =>
        Set<AuditLog>();

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        if (ChangeTracker
            .Entries<AuditLog>()
            .Any(x => x.State is EntityState.Modified or EntityState.Deleted))
        {
            throw new InvalidOperationException(
                "Audit records are immutable.");
        }

        ApplyAuditFields();
        AppendAuditLogs();

        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditFields()
    {
        var now = DateTimeOffset.UtcNow;
        var userId = GetUserId();

        foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = now;
                entry.Entity.CreatedByUserId = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = now;
                entry.Entity.UpdatedByUserId = userId;
            }
            else if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAtUtc = now;
                entry.Entity.DeletedByUserId = userId;
            }
        }
    }

    private void AppendAuditLogs()
    {
        var context = httpContextAccessor.HttpContext;

        var logs = ChangeTracker
            .Entries<IAuditableEntity>()
            .Where(x =>
                x.State is EntityState.Added
                or EntityState.Modified
                or EntityState.Deleted)
            .Select(entry => new AuditLog
            {
                OccurredAtUtc = DateTimeOffset.UtcNow,

                UserId = GetUserId(),

                UserName = context?.User.Identity?.Name,

                Action =
                    entry.State == EntityState.Modified
                    && entry.Entity.IsDeleted
                        ? "SoftDeleted"
                        : entry.State.ToString(),

                EntityType = entry.Metadata.ClrType.Name,

                EntityId = string.Join(
                    ",",
                    entry.Properties
                        .Where(x => x.Metadata.IsPrimaryKey())
                        .Select(x => x.CurrentValue?.ToString())),

                OldValuesJson =
                    entry.State == EntityState.Added
                        ? null
                        : SerializeValues(entry, original: true),

                NewValuesJson =
                    entry.State == EntityState.Deleted
                        ? null
                        : SerializeValues(entry, original: false),

                CorrelationId = context?.TraceIdentifier,

                IpAddress =
                    context?.Connection.RemoteIpAddress?.ToString()
            })
            .ToArray();

        if (logs.Length != 0)
        {
            AuditLogs.AddRange(logs);
        }
    }

    private static string SerializeValues(
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry,
        bool original)
    {
        var values = entry.Properties
            .Where(x => !x.Metadata.IsShadowProperty())
            .ToDictionary(
                x => x.Metadata.Name,
                x => original
                    ? x.OriginalValue
                    : x.CurrentValue);

        return JsonSerializer.Serialize(values);
    }

    private string GetUserId()
    {
        return
            httpContextAccessor.HttpContext?
                .User
                .FindFirst(
                    "http://schemas.microsoft.com/identity/claims/objectidentifier")
                ?.Value
            ??
            httpContextAccessor.HttpContext?
                .User
                .FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value
            ??
            "system";
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);

        // ============================================================
        // OFFICE
        // Maps the C# Office entity to dbo.Office
        // ============================================================

        builder.Entity<Office>(entity =>
        {
            entity.ToTable("Office", "dbo");

            entity.HasKey(x => x.OfficeID);

            entity.Property(x => x.OfficeID)
                .ValueGeneratedOnAdd();

            entity.Property(x => x.OfficeCode)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsRequired();

            entity.Property(x => x.OfficeName)
                .HasMaxLength(40)
                .IsRequired();

            entity.Property(x => x.OfficeLevel)
                .IsRequired();

            entity.Property(x => x.FirstLevel)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsRequired();

            entity.Property(x => x.SecondLevel)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.Property(x => x.ThirdLevel)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.Property(x => x.FourthLevel)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.Property(x => x.OperationStartDate)
                .HasColumnType("date")
                .IsRequired();

            entity.Property(x => x.OfficeAddress)
                .HasMaxLength(155)
                .IsUnicode(false);

            entity.Property(x => x.PostCode)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.Property(x => x.GeoLocationID);

            entity.Property(x => x.Email)
                .HasMaxLength(45)
                .IsUnicode(false);

            entity.Property(x => x.Phone)
                .HasMaxLength(35)
                .IsUnicode(false);

            entity.Property(x => x.BankAsiaAccNo)
                .HasColumnName("bankasiaaccno")
                .HasMaxLength(35)
                .IsUnicode(false);

            entity.Property(x => x.PhonebKash)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.Property(x => x.OrgID)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .IsRequired();

            entity.Property(x => x.InActiveDate)
                .HasColumnType("smalldatetime");

            entity.Property(x => x.CreateUser)
                .HasMaxLength(35)
                .IsUnicode(false)
                .IsRequired();

            entity.Property(x => x.CreateDate)
                .HasColumnType("smalldatetime")
                .IsRequired();

            entity.Property(x => x.InvestorID);

            entity.Property(x => x.UnionID);

            entity.Property(x => x.IsProjectOffice);

            entity.Property(x => x.ProjectOffice)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.Property(x => x.UnionCode)
                .HasMaxLength(50);

            // Office -> Organization
            entity.HasOne<Organization>()
                .WithMany()
                .HasForeignKey(x => x.OrgID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Budget>(entity =>
        {
            entity.ToTable("Budget", "dbo");
            entity.HasKey(x => x.BudgetID);
            entity.Property(x => x.BudgetID).ValueGeneratedOnAdd();
            entity.Property(x => x.CreateUser).HasMaxLength(35).IsUnicode(false).IsRequired();
            entity.Property(x => x.CreateDate).HasColumnType("smalldatetime").IsRequired();
            entity.Property(x => x.InActiveDate).HasColumnType("smalldatetime");
            entity.Property(x => x.TrxDate).HasColumnType("date");

            // Budget -> AccChart relationship
            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<BudgetParticular>(entity =>
        {
            entity.ToTable("BudgetParticular", "dbo");
            entity.HasKey(x => x.BudgetParticularId);
            entity.Property(x => x.BudgetParticularId).ValueGeneratedOnAdd();
            entity.Property(x => x.BudgetParticularCode).HasMaxLength(50);
            entity.Property(x => x.BudgetParticularName).HasMaxLength(50);
            entity.Property(x => x.CreateUser).HasMaxLength(35).IsUnicode(false).IsRequired();
            entity.Property(x => x.CreateDate).HasColumnType("smalldatetime").IsRequired();
            entity.Property(x => x.InActiveDate).HasColumnType("smalldatetime");
        });

        builder.Entity<AccNote>(entity =>
        {
            entity.ToTable("AccNote", "dbo");
            entity.HasKey(x => x.NoteID);
            entity.Property(x => x.NoteID).ValueGeneratedOnAdd();
            entity.Property(x => x.NoteNo).IsRequired();
            entity.Property(x => x.NoteName).HasMaxLength(150);
            entity.Property(x => x.CreateUser).HasMaxLength(35).IsUnicode(false).IsRequired();
            entity.Property(x => x.CreateDate).HasColumnType("smalldatetime").IsRequired();
            entity.Property(x => x.InActiveDate).HasColumnType("smalldatetime");
        });

        builder.Entity<PKSFFundLoan>(entity =>
        {
            entity.ToTable("PKSFFundLoan", "dbo");
            entity.HasKey(x => x.FundLoanID);
            entity.Property(x => x.FundLoanID).ValueGeneratedOnAdd();
        });

        builder.Entity<AccMappingForFundTransfer>(entity =>
        {
            entity.ToTable("AccMappingForFundTransfer", "dbo");
            entity.HasKey(x => x.ID);
            entity.Property(x => x.ID).ValueGeneratedOnAdd();
        });

        builder.Entity<TargetAchievement>(entity =>
        {
            entity.ToTable("targetachievement", "dbo");
            entity.HasKey(x => x.TargetId);
            entity.Property(x => x.TargetId).ValueGeneratedOnAdd();
        });

        builder.Entity<YearlyTargetData>(entity =>
        {
            entity.ToTable("Yearly_Target_Data", "dbo");
            entity.HasKey(x => x.ID);
            entity.Property(x => x.ID).ValueGeneratedOnAdd();
        });
    }
}



