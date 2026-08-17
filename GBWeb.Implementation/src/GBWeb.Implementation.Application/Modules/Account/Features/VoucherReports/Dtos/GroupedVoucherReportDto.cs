namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;

public sealed record GroupedVoucherReportDto(
    long TrxMasterID,
    int? OfficeID,
    DateTime TrxDate,
    string VoucherNo,
    string? VoucherDesc,
    string VoucherType,
    string? Reference,
    IReadOnlyList<VoucherReportDetailDto> Details
);