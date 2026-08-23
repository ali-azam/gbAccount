using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByAccCode;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.ExportTrialBalanceByOffice;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByAccCode;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByOffice;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

[ApiController]
[Route("api/trial-balance-reports")]
[AllowAnonymous]
public sealed class TrialBalanceReportsController(
    IMediator mediator)
    : ControllerBase
{
    /// <summary>
    /// Account Code wise trial balance. One row per account, summed
    /// across offices.
    /// </summary>
    [HttpGet("acc-code-wise")]
    public async Task<IActionResult> GetByAccCode(
        [FromQuery] GetTrialBalanceByAccCodeQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Office wise trial balance. One row per office and account.
    /// </summary>
    [HttpGet("office-wise")]
    public async Task<IActionResult> GetByOffice(
        [FromQuery] GetTrialBalanceByOfficeQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Account Code wise trial balance as a PDF or Excel download.
    /// </summary>
    [HttpGet("acc-code-wise/export")]
    public async Task<IActionResult> ExportByAccCode(
        [FromQuery] ExportTrialBalanceByAccCodeQuery query,
        CancellationToken cancellationToken)
    {
        var file = await mediator.Send(
            query,
            cancellationToken);

        return File(
            file.Content,
            file.ContentType,
            file.FileName);
    }

    /// <summary>
    /// Office wise trial balance as a PDF or Excel download.
    /// </summary>
    [HttpGet("office-wise/export")]
    public async Task<IActionResult> ExportByOffice(
        [FromQuery] ExportTrialBalanceByOfficeQuery query,
        CancellationToken cancellationToken)
    {
        var file = await mediator.Send(
            query,
            cancellationToken);

        return File(
            file.Content,
            file.ContentType,
            file.FileName);
    }
}
