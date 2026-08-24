using GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Queries.GetOffices;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GBWeb.Implementation.Api.Controllers;

[ApiController]
[Route("api/offices")]
[AllowAnonymous]
public sealed class OfficesController(
    IMediator mediator)
    : ControllerBase
{
    /// <summary>
    /// Every active office, with the level columns the report screens use
    /// to cascade Head Office → Zone → Area → Office.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetOfficesQuery(),
            cancellationToken);

        return Ok(result);
    }
}
