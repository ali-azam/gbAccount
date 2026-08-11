using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Services;

namespace GbAccount.Api.Interfaces;

/// <summary>Account categories (Assets, Liability, Expenditure, Income).</summary>
public interface IAccCategoryService
{
    Task<IEnumerable<AccCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken);

    Task<ServiceResult<AccCategoryDto>> GetCategoryAsync(int id, CancellationToken cancellationToken);
}
