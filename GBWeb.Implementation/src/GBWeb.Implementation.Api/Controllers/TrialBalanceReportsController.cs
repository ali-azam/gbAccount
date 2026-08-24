using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.ExportComputedTrialBalance;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.ExportComputedTrialBalanceByOffice;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalance;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalanceByOffice;
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

    // The four routes above read the OLRSTrailBalance snapshot, which
    // holds a handful of month-end dates for one consolidated office.
    // The four below compute the same columns from the vouchers, so they
    // answer for any date range and any office in the hierarchy.

    /// <summary>
    /// Trial balance computed from vouchers over a date range. One row
    /// per account, summed across the offices in scope.
    /// </summary>
    [HttpGet("computed")]
    public async Task<IActionResult> GetComputed(
        [FromQuery] GetComputedTrialBalanceQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Trial balance computed from vouchers over a date range. One row
    /// per office and account.
    /// </summary>
    [HttpGet("computed/office-wise")]
    public async Task<IActionResult> GetComputedByOffice(
        [FromQuery] GetComputedTrialBalanceByOfficeQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// The computed trial balance as a PDF or Excel download.
    /// </summary>
    [HttpGet("computed/export")]
    public async Task<IActionResult> ExportComputed(
        [FromQuery] ExportComputedTrialBalanceQuery query,
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
    /// The office wise computed trial balance as a PDF or Excel
    /// download.
    /// </summary>
    [HttpGet("computed/office-wise/export")]
    public async Task<IActionResult> ExportComputedByOffice(
        [FromQuery] ExportComputedTrialBalanceByOfficeQuery query,
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
