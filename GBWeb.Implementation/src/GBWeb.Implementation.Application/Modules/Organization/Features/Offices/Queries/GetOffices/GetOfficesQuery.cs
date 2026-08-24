using GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Queries.GetOffices;

/// <summary>
/// Every active office of the reporting organisation, for the office
/// pickers on the report screens. The whole list is returned in one go
/// so the UI can cascade Head → Zone → Area → Office locally.
/// </summary>
public sealed record GetOfficesQuery : IRequest<IReadOnlyList<OfficeOptionDto>>;
