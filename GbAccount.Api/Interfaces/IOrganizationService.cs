using GbAccount.Api.DTOs.Organization;
using GbAccount.Api.Services;

namespace GbAccount.Api.Interfaces;

/// <summary>Organizations that own chart-of-accounts rows.</summary>
public interface IOrganizationService
{
    /// <summary>
    /// Organizations ordered by OrgID. activeOnly true filters to IsActive rows;
    /// null or false returns every organization.
    /// </summary>
    Task<IEnumerable<OrganizationDto>> GetOrganizationsAsync(
        bool? activeOnly,
        CancellationToken cancellationToken);

    Task<ServiceResult<OrganizationDto>> GetOrganizationAsync(int id, CancellationToken cancellationToken);
}
