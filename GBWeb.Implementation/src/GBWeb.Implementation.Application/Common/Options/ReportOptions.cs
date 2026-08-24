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

    /// <summary>
    /// AccChart code of the account head holding the cash accounts, used
    /// by the Cash Book to tell a cash movement from its counter-entry.
    /// </summary>
    /// <remarks>
    /// The chart names these heads in a way no column marks as special —
    /// "Cash in Hand" sits under 101000 and "Cash at Bank" under 102000 —
    /// and matching on the name is not safe, because dozens of ordinary
    /// accounts are named after a bank. The head code is the reliable
    /// signal, and it is settable here so a chart that numbers these
    /// differently does not need a code change.
    /// </remarks>
    public string CashHeadCode { get; init; } = "101000";

    /// <summary>
    /// AccChart code of the account head holding the bank accounts. See
    /// <see cref="CashHeadCode"/>.
    /// </summary>
    public string BankHeadCode { get; init; } = "102000";
}
