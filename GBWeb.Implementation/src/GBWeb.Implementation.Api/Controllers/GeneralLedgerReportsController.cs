using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.ExportGeneralLedger;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Queries.GetGeneralLedger;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

[ApiController]
[Route("api/general-ledger-reports")]
[AllowAnonymous]
public sealed class GeneralLedgerReportsController(
    IMediator mediator)
    : ControllerBase
{
    /// <summary>
    /// Subsidiary ledger: every posting for the selected office, accounts
    /// and date range, grouped by account with a running balance.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] GetGeneralLedgerQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// The same ledger as a PDF or Excel download.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] ExportGeneralLedgerQuery query,
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
