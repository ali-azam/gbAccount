namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;

public sealed record VoucherReportDetailDto(
    long TrxDetailsID,
    int? AccID,
    string AccCode,
    string AccName,
    int? AccLevel,
    decimal? Debit,
    decimal? Credit,
    string? Narration
);