using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetGroupedVoucherReport;

public sealed record GetGroupedVoucherReportQuery(
    DateTime DateFrom,
    DateTime DateTo,
    string? VoucherType,
    string? VoucherNo,
    bool ViewAllVoucher
) : IRequest<IReadOnlyList<GroupedVoucherReportDto>>;