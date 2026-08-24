using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Options;
using GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Queries.GetOffices;

public sealed class GetOfficesQueryHandler(
    IApplicationDbContext dbContext,
    IOptions<ReportOptions> reportOptions)
    : IRequestHandler<GetOfficesQuery, IReadOnlyList<OfficeOptionDto>>
{
    public async Task<IReadOnlyList<OfficeOptionDto>> Handle(
        GetOfficesQuery request,
        CancellationToken cancellationToken)
    {
        // The installation runs one organisation, the same one the
        // reports print in their header.
        var organizationId = reportOptions.Value.OrganizationId;

        return await dbContext.Offices
            .AsNoTracking()
            .Where(office =>
                office.OrgID == organizationId &&
                office.IsActive)
            .OrderBy(office => office.OfficeLevel)
            .ThenBy(office => office.OfficeCode)
            .Select(office => new OfficeOptionDto(
                office.OfficeID,
                office.OfficeCode,
                office.OfficeName,
                office.OfficeLevel,
                office.FirstLevel,
                office.SecondLevel,
                office.ThirdLevel,
                office.FourthLevel,
                office.IsProjectOffice ?? false))
            .ToListAsync(cancellationToken);
    }
}
