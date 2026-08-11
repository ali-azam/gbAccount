using GbAccount.Api.Data;
using GbAccount.Api.DTOs.Organization;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Mapping;
using Microsoft.EntityFrameworkCore;

namespace GbAccount.Api.Services;

/// <summary>Organizations that own chart-of-accounts rows.</summary>
public class OrganizationService : IOrganizationService
{
    private readonly GbAccountDbContext _db;

    public OrganizationService(GbAccountDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<OrganizationDto>> GetOrganizationsAsync(
        bool? activeOnly,
        CancellationToken cancellationToken)
    {
        var query = _db.Organizations.AsNoTracking().AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(o => o.IsActive);
        }

        var organizations = await query
            .OrderBy(o => o.OrgId)
            .ToListAsync(cancellationToken);

        return organizations.Select(o => o.ToDto());
    }

    public async Task<ServiceResult<OrganizationDto>> GetOrganizationAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var organization = await _db.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrgId == id, cancellationToken);

        return organization is null
            ? ServiceResult<OrganizationDto>.NotFound($"Organization {id} not found")
            : ServiceResult<OrganizationDto>.Success(organization.ToDto());
    }
}
