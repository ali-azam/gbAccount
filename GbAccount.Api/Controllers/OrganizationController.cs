using GbAccount.Api.DTOs;
using GbAccount.Api.DTOs.Organization;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GbAccount.Api.Controllers;

/// <summary>
/// Organizations. Route matches the /api/organizations endpoint the existing
/// client calls.
/// </summary>
[ApiController]
[Route("api/organizations")]
public class OrganizationController : ControllerBase
{
    private readonly IOrganizationService _organizations;

    public OrganizationController(IOrganizationService organizations)
    {
        _organizations = organizations;
    }

    /// <summary>
    /// GET /api/organizations
    ///
    /// activeOnly filters to IsActive rows; omitted, every organization is
    /// returned so the current client behaviour is unchanged.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<OrganizationDto>>>> GetOrganizations(
        [FromQuery] bool? activeOnly,
        CancellationToken cancellationToken)
    {
        var organizations = await _organizations.GetOrganizationsAsync(activeOnly, cancellationToken);

        return Ok(ApiResponse<IEnumerable<OrganizationDto>>.Ok(organizations));
    }

    /// <summary>GET /api/organizations/{id}</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<OrganizationDto>>> GetOrganization(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _organizations.GetOrganizationAsync(id, cancellationToken);

        if (result.Succeeded)
        {
            return Ok(ApiResponse<OrganizationDto>.Ok(result.Value!));
        }

        return result.ErrorKind == ServiceErrorKind.NotFound
            ? NotFound(ApiResponse<OrganizationDto>.Fail(result.Error!))
            : BadRequest(ApiResponse<OrganizationDto>.Fail(result.Error!));
    }
}
