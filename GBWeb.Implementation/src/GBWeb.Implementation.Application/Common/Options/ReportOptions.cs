namespace GBWeb.Implementation.Application.Common.Options;

/// <summary>
/// Settings for printed reports.
///
/// The Organization table holds many rows, and the trial balance
/// snapshot carries office names only, so nothing in the data says
/// which organisation a report belongs to. A single-organisation
/// install names it once here.
/// </summary>
public sealed class ReportOptions
{
    public const string SectionName = "Reports";

    /// <summary>
    /// OrgID of the organisation whose name heads printed reports.
    /// </summary>
    public int OrganizationId { get; init; }
}
