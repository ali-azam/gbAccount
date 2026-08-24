namespace GBWeb.Implementation.Application.Modules.Organization.Features.Offices.Dtos;

/// <summary>
/// One office as the report filters need it: enough to fill a dropdown
/// and enough to work out which offices sit under which.
/// </summary>
/// <param name="OfficeLevel">
/// 1 head office, 2 zone, 3 area, 4 branch.
/// </param>
/// <param name="FirstLevel">
/// Office code of the ancestor at level 1. The four level columns are
/// what let the UI cascade Head → Zone → Area → Office without a request
/// per step.
/// </param>
public sealed record OfficeOptionDto(
    int OfficeId,
    string OfficeCode,
    string OfficeName,
    byte OfficeLevel,
    string? FirstLevel,
    string? SecondLevel,
    string? ThirdLevel,
    string? FourthLevel,
    bool IsProjectOffice
);
