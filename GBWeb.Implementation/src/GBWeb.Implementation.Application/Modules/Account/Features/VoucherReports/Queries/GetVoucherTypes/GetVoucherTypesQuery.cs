using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherTypes;

public sealed record GetVoucherTypesQuery
    : IRequest<IReadOnlyList<string>>;