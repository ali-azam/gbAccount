using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Services;

namespace GbAccount.Api.Interfaces;

/// <summary>
/// Chart of accounts operations. Holds the rules the database does not enforce
/// itself — notably that AccCode is unique per organization, for which there is
/// no unique constraint in SQL Server.
/// </summary>
public interface IAccChartService
{
    /// <summary>
    /// Accounts ordered by AccCode, with category and organization joined.
    /// Passing null for every argument returns the full list, which is what the
    /// account list screen requests.
    /// </summary>
    Task<IEnumerable<AccChartDto>> GetAccountsAsync(
        int? orgId,
        int? page,
        int? pageSize,
        CancellationToken cancellationToken);

    Task<ServiceResult<AccChartDto>> GetAccountAsync(int id, CancellationToken cancellationToken);

    Task<ServiceResult<AccChartDto>> CreateAccountAsync(
        SaveAccChartDto dto,
        CancellationToken cancellationToken);

    Task<ServiceResult<AccChartDto>> UpdateAccountAsync(
        int id,
        SaveAccChartDto dto,
        CancellationToken cancellationToken);

    Task<ServiceResult<int>> DeleteAccountAsync(int id, CancellationToken cancellationToken);
}
