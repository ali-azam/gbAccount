namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

/// <summary>
/// A rendered ledger ready to be handed back as a file download.
/// </summary>
public sealed record GeneralLedgerFileDto(
    byte[] Content,
    string ContentType,
    string FileName
);
