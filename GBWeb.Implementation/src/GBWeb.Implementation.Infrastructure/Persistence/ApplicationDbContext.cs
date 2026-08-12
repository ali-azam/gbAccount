using System.Text.Json;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Common.Entities;
using GBWeb.Implementation.Domain.Common.Interfaces;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    IHttpContextAccessor httpContextAccessor)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<AccCategory> AccCategories => Set<AccCategory>();
    public DbSet<AccChart> AccCharts => Set<AccChart>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<GbAccount> GbAccounts => Set<GbAccount>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (ChangeTracker.Entries<AuditLog>().Any(x => x.State is EntityState.Modified or EntityState.Deleted))
            throw new InvalidOperationException("Audit records are immutable.");
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
        var logs = ChangeTracker.Entries<IAuditableEntity>()
            .Where(x => x.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Select(entry => new AuditLog
            {
                OccurredAtUtc = DateTimeOffset.UtcNow,
                UserId = GetUserId(),
                UserName = context?.User.Identity?.Name,
                Action = entry.State == EntityState.Modified && entry.Entity.IsDeleted ? "SoftDeleted" : entry.State.ToString(),
                EntityType = entry.Metadata.ClrType.Name,
                EntityId = string.Join(",", entry.Properties.Where(x => x.Metadata.IsPrimaryKey()).Select(x => x.CurrentValue?.ToString())),
                OldValuesJson = entry.State == EntityState.Added ? null : SerializeValues(entry, original: true),
                NewValuesJson = entry.State == EntityState.Deleted ? null : SerializeValues(entry, original: false),
                CorrelationId = context?.TraceIdentifier,
                IpAddress = context?.Connection.RemoteIpAddress?.ToString()
            }).ToArray();

        if (logs.Length != 0)
            AuditLogs.AddRange(logs);
    }

    private static string SerializeValues(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, bool original)
    {
        var values = entry.Properties
            .Where(x => !x.Metadata.IsShadowProperty())
            .ToDictionary(x => x.Metadata.Name, x => original ? x.OriginalValue : x.CurrentValue);
        return JsonSerializer.Serialize(values);
    }

    private string GetUserId() =>
        httpContextAccessor.HttpContext?.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
        ?? httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? "system";

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
