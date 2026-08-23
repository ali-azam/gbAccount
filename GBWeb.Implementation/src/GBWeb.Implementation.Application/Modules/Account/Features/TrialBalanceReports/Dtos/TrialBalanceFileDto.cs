namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// A rendered report ready to be handed back as a file download.
/// </summary>
public sealed record TrialBalanceFileDto(
    byte[] Content,
    string ContentType,
    string FileName
);
