using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReport;

public sealed record GetVoucherReportQuery(
    DateTime DateFrom,
    DateTime DateTo,
    string? VoucherType,
    string? VoucherNo,
    bool ViewAllVoucher
) : IRequest<IReadOnlyList<VoucherReportDto>>;