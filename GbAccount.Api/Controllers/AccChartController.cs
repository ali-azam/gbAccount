using GbAccount.Api.DTOs;
using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.Interfaces;
using GbAccount.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GbAccount.Api.Controllers;

/// <summary>
/// Chart of accounts. Route is /api/accounts to match the endpoint the existing
/// Next.js client already calls.
///
/// This controller only translates HTTP to and from the service layer: business
/// rules live in <see cref="IAccChartService"/>, and unhandled exceptions are
/// caught by ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/accounts")]
public class AccChartController : ControllerBase
{
    private readonly IAccChartService _accounts;

    public AccChartController(IAccChartService accounts)
    {
        _accounts = accounts;
    }

    /// <summary>
    /// GET /api/accounts
    ///
    /// Returns every account ordered by AccCode, with category and organization
    /// joined. Optional orgId/page/pageSize narrow the result; omitting them
    /// returns the full list, which is what the account list currently requests.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<AccChartDto>>>> GetAccounts(
        [FromQuery] int? orgId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        CancellationToken cancellationToken)
    {
        var accounts = await _accounts.GetAccountsAsync(orgId, page, pageSize, cancellationToken);

        return Ok(ApiResponse<IEnumerable<AccChartDto>>.Ok(accounts));
    }

    /// <summary>GET /api/accounts/{id}</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<AccChartDto>>> GetAccount(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _accounts.GetAccountAsync(id, cancellationToken);

        return result.Succeeded
            ? Ok(ApiResponse<AccChartDto>.Ok(result.Value!))
            : ToErrorResult(result);
    }

    /// <summary>POST /api/accounts</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AccChartDto>>> CreateAccount(
        [FromBody] SaveAccChartDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _accounts.CreateAccountAsync(dto, cancellationToken);

        if (!result.Succeeded)
        {
            return ToErrorResult(result);
        }

        return CreatedAtAction(
            nameof(GetAccount),
            new { id = result.Value!.AccID },
            ApiResponse<AccChartDto>.Ok(result.Value));
    }

    /// <summary>PUT /api/accounts/{id}</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<AccChartDto>>> UpdateAccount(
        int id,
        [FromBody] SaveAccChartDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _accounts.UpdateAccountAsync(id, dto, cancellationToken);

        return result.Succeeded
            ? Ok(ApiResponse<AccChartDto>.Ok(result.Value!))
            : ToErrorResult(result);
    }

    /// <summary>DELETE /api/accounts/{id}</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAccount(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _accounts.DeleteAccountAsync(id, cancellationToken);

        if (!result.Succeeded)
        {
            return result.ErrorKind switch
            {
                ServiceErrorKind.NotFound => NotFound(ApiResponse<object>.Fail(result.Error!)),
                ServiceErrorKind.Conflict => Conflict(ApiResponse<object>.Fail(result.Error!)),
                _ => BadRequest(ApiResponse<object>.Fail(result.Error!)),
            };
        }

        return Ok(ApiResponse<object>.Ok(new { AccID = result.Value }));
    }

    /// <summary>Maps a domain failure onto the matching HTTP status code.</summary>
    private ActionResult<ApiResponse<AccChartDto>> ToErrorResult(ServiceResult<AccChartDto> result) =>
        result.ErrorKind switch
        {
            ServiceErrorKind.NotFound => NotFound(ApiResponse<AccChartDto>.Fail(result.Error!)),
            ServiceErrorKind.Conflict => Conflict(ApiResponse<AccChartDto>.Fail(result.Error!)),
            _ => BadRequest(ApiResponse<AccChartDto>.Fail(result.Error!)),
        };
}
