namespace GBWeb.Implementation.Application.Common.Models;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int PageNumber, int PageSize, long TotalCount);
