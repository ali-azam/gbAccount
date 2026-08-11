using GbAccount.Api.DTOs;
using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GbAccount.Api.Controllers;

/// <summary>
/// Account categories (Assets, Liability, Expenditure, Income).
/// Route matches the /api/categories endpoint the existing client calls.
/// </summary>
[ApiController]
[Route("api/categories")]
public class AccCategoryController : ControllerBase
{
    private readonly IAccCategoryService _categories;

    public AccCategoryController(IAccCategoryService categories)
    {
        _categories = categories;
    }

    /// <summary>GET /api/categories</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<AccCategoryDto>>>> GetCategories(
        CancellationToken cancellationToken)
    {
        var categories = await _categories.GetCategoriesAsync(cancellationToken);

        return Ok(ApiResponse<IEnumerable<AccCategoryDto>>.Ok(categories));
    }

    /// <summary>GET /api/categories/{id}</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<AccCategoryDto>>> GetCategory(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _categories.GetCategoryAsync(id, cancellationToken);

        if (result.Succeeded)
        {
            return Ok(ApiResponse<AccCategoryDto>.Ok(result.Value!));
        }

        return result.ErrorKind == ServiceErrorKind.NotFound
            ? NotFound(ApiResponse<AccCategoryDto>.Fail(result.Error!))
            : BadRequest(ApiResponse<AccCategoryDto>.Fail(result.Error!));
    }
}
