using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface IVoucherReportPdfService
{
    byte[] Generate(IReadOnlyList<VoucherReportDto> vouchers);
}