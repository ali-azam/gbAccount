using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.ExportCashBook;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Queries.GetCashBook;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

[ApiController]
[Route("api/cash-book-reports")]
[AllowAnonymous]
public sealed class CashBookReportsController(
    IMediator mediator)
    : ControllerBase
{
    /// <summary>
    /// Cash Book: every cash and bank movement for the selected office and
    /// date range, bracketed by the opening and closing cash and bank
    /// balances.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] GetCashBookQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            query,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// The same cash book as a PDF or Excel download.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] ExportCashBookQuery query,
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
