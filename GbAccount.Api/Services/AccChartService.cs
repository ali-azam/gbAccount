using GbAccount.Api.Data;
using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Mapping;
using Microsoft.EntityFrameworkCore;

namespace GbAccount.Api.Services;

/// <summary>
/// Chart of accounts business logic.
///
/// The duplicate-AccCode rule lives here rather than in the controller so that
/// every write path is subject to it — create and update share one enforcement
/// point, and a future importer or background job gets the rule for free.
/// </summary>
public class AccChartService : IAccChartService
{
    private readonly GbAccountDbContext _db;

    public AccChartService(GbAccountDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<AccChartDto>> GetAccountsAsync(
        int? orgId,
        int? page,
        int? pageSize,
        CancellationToken cancellationToken)
    {
        var query = _db.AccCharts
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Org)
            .AsQueryable();

        if (orgId.HasValue)
        {
            query = query.Where(a => a.OrgId == orgId.Value);
        }

        query = query.OrderBy(a => a.AccCode);

        if (page.HasValue && pageSize.HasValue && page > 0 && pageSize > 0)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var accounts = await query.ToListAsync(cancellationToken);

        return accounts.Select(a => a.ToDto());
    }

    public async Task<ServiceResult<AccChartDto>> GetAccountAsync(int id, CancellationToken cancellationToken)
    {
        var account = await _db.AccCharts
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Org)
            .FirstOrDefaultAsync(a => a.AccId == id, cancellationToken);

        return account is null
            ? ServiceResult<AccChartDto>.NotFound($"Account {id} not found")
            : ServiceResult<AccChartDto>.Success(account.ToDto());
    }

    public async Task<ServiceResult<AccChartDto>> CreateAccountAsync(
        SaveAccChartDto dto,
        CancellationToken cancellationToken)
    {
        var guard = await ValidateWriteAsync(dto, existingAccId: null, cancellationToken);
        if (!guard.Succeeded)
        {
            return guard;
        }

        var entity = new Models.AccChart
        {
            // CreateUser and CreateDate are left unset so SQL Server's column
            // defaults (suser_sname(), getdate()) apply.
            CreateUser = null!,
        };
        dto.ApplyTo(entity);

        _db.AccCharts.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        await LoadReferencesAsync(entity, cancellationToken);

        return ServiceResult<AccChartDto>.Success(entity.ToDto());
    }

    public async Task<ServiceResult<AccChartDto>> UpdateAccountAsync(
        int id,
        SaveAccChartDto dto,
        CancellationToken cancellationToken)
    {
        var entity = await _db.AccCharts.FirstOrDefaultAsync(a => a.AccId == id, cancellationToken);

        if (entity is null)
        {
            return ServiceResult<AccChartDto>.NotFound($"Account {id} not found");
        }

        var guard = await ValidateWriteAsync(dto, existingAccId: id, cancellationToken);
        if (!guard.Succeeded)
        {
            return guard;
        }

        dto.ApplyTo(entity);
        await _db.SaveChangesAsync(cancellationToken);

        await LoadReferencesAsync(entity, cancellationToken);

        return ServiceResult<AccChartDto>.Success(entity.ToDto());
    }

    /// <summary>
    /// Hard delete. Accounting rows are often referenced by vouchers once those
    /// tables exist, so this may need to become a soft delete (IsActive = false)
    /// before it is exposed to end users.
    /// </summary>
    public async Task<ServiceResult<int>> DeleteAccountAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.AccCharts.FirstOrDefaultAsync(a => a.AccId == id, cancellationToken);

        if (entity is null)
        {
            return ServiceResult<int>.NotFound($"Account {id} not found");
        }

        _db.AccCharts.Remove(entity);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // A foreign key from vouchers or ledger rows still points here.
            return ServiceResult<int>.Conflict(
                "This account is referenced by other records and cannot be deleted.");
        }

        return ServiceResult<int>.Success(id);
    }

    /// <summary>
    /// Rules shared by create and update: AccCode must be unique within its
    /// organization, and the referenced organization and category must exist.
    /// existingAccId excludes the row being updated from the duplicate check.
    /// </summary>
    private async Task<ServiceResult<AccChartDto>> ValidateWriteAsync(
        SaveAccChartDto dto,
        int? existingAccId,
        CancellationToken cancellationToken)
    {
        var duplicate = await _db.AccCharts.AnyAsync(
            a => a.AccCode == dto.AccCode
                 && a.OrgId == dto.OrgID
                 && (existingAccId == null || a.AccId != existingAccId),
            cancellationToken);

        if (duplicate)
        {
            return ServiceResult<AccChartDto>.Conflict(
                $"Account code '{dto.AccCode}' already exists for organization {dto.OrgID}.");
        }

        if (!await _db.Organizations.AnyAsync(o => o.OrgId == dto.OrgID, cancellationToken))
        {
            return ServiceResult<AccChartDto>.Validation($"Organization {dto.OrgID} does not exist.");
        }

        if (dto.CategoryID.HasValue &&
            !await _db.AccCategories.AnyAsync(c => c.CategoryId == dto.CategoryID.Value, cancellationToken))
        {
            return ServiceResult<AccChartDto>.Validation($"Category {dto.CategoryID} does not exist.");
        }

        return ServiceResult<AccChartDto>.Success(default!);
    }

    /// <summary>
    /// Loads Category and Org after a write so the returned DTO carries the same
    /// nested objects a GET would return.
    /// </summary>
    private async Task LoadReferencesAsync(Models.AccChart entity, CancellationToken cancellationToken)
    {
        await _db.Entry(entity).Reference(a => a.Category).LoadAsync(cancellationToken);
        await _db.Entry(entity).Reference(a => a.Org).LoadAsync(cancellationToken);
    }
}
