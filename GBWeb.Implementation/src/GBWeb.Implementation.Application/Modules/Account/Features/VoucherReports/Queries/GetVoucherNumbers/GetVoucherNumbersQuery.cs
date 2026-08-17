using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherNumbers;

public sealed record GetVoucherNumbersQuery(
    DateTime DateFrom,
    DateTime DateTo,
    string? VoucherType
) : IRequest<IReadOnlyList<string>>;