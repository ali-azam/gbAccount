namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

/// <summary>
/// A rendered Cash Book ready to be handed back as a file download.
/// </summary>
public sealed record CashBookFileDto(
    byte[] Content,
    string ContentType,
    string FileName
);
