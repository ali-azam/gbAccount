using GbAccount.Api.Data;
using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Mapping;
using Microsoft.EntityFrameworkCore;

namespace GbAccount.Api.Services;

/// <summary>Account categories (Assets, Liability, Expenditure, Income).</summary>
public class AccCategoryService : IAccCategoryService
{
    private readonly GbAccountDbContext _db;

    public AccCategoryService(GbAccountDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<AccCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken)
    {
        var categories = await _db.AccCategories
            .AsNoTracking()
            .OrderBy(c => c.CategoryId)
            .ToListAsync(cancellationToken);

        return categories.Select(c => c.ToDto());
    }

    public async Task<ServiceResult<AccCategoryDto>> GetCategoryAsync(int id, CancellationToken cancellationToken)
    {
        var category = await _db.AccCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CategoryId == id, cancellationToken);

        return category is null
            ? ServiceResult<AccCategoryDto>.NotFound($"Category {id} not found")
            : ServiceResult<AccCategoryDto>.Success(category.ToDto());
    }
}
