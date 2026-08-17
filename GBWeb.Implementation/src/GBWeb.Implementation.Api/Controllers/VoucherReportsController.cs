using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetGroupedVoucherReport;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherNumbers;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReport;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherTypes;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReportPdf;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

[ApiController]
[Route("api/voucher-reports")]
[AllowAnonymous]
public sealed class VoucherReportsController(
    IMediator mediator)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] GetVoucherReportQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("voucher-types")]
    public async Task<IActionResult> GetVoucherTypes(
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetVoucherTypesQuery(),
            cancellationToken);

        return Ok(result);
    }
    [HttpGet("voucher-numbers")]
    public async Task<IActionResult> GetVoucherNumbers(
    [FromQuery] GetVoucherNumbersQuery query,
    CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("grouped")]
    public async Task<IActionResult> GetGrouped(
    [FromQuery] GetGroupedVoucherReportQuery query,
    CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }
    [HttpGet("pdf")]
    public async Task<IActionResult> GetPdf(
    [FromQuery] GetVoucherReportPdfQuery query,
    CancellationToken cancellationToken)
    {
        var pdf = await mediator.Send(query, cancellationToken);

        return File(
            pdf,
            "application/pdf",
            "voucher-report.pdf");
    }
}