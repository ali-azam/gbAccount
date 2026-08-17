namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;

public sealed record VoucherReportDto(
    long TrxMasterID,
    long TrxDetailsID,
    int OfficeID,
    DateTime TrxDate,
    string VoucherNo,
    string? VoucherDesc,
    string? VoucherType,
    string? Reference,
    int? AccID,
    string? AccCode,
    string? AccName,
    int? AccLevel,
    decimal? Debit,
    decimal? Credit,
    string? Narration,
    string OfficeName
);