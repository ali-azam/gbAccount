using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReportPdf;

public sealed record GetVoucherReportPdfQuery(
    DateTime DateFrom,
    DateTime DateTo,
    string? VoucherType,
    string? VoucherNo,
    bool ViewAllVoucher
) : IRequest<byte[]>;