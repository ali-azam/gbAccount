using System.Linq.Expressions;
using GBWeb.Implementation.Domain.Modules.Account.Entities;

namespace GBWeb.Implementation.Application.Common.Reports;

/// <summary>
/// Turns an Acc Level plus Account Code into a filter over AccChart, and
/// works out which ancestor a posting rolls up to.
/// </summary>
/// <remarks>
/// AccChart.FirstLevel..FifthLevel hold the ancestor code at each level,
/// and at an account's own level the column equals the account's own
/// code. Matching <c>Level{N} == code</c> therefore selects the account
/// together with everything beneath it, which is what these reports
/// need: the legacy layout groups under a parent such as <c>101000</c>
/// while the transactions themselves sit on children such as
/// <c>101001</c>.
///
/// Shared by the general ledger and the trial balance so the two reports
/// can never disagree about which accounts a level covers.
/// </remarks>
internal static class ReportAccountFilter
{
    public const int MinLevel = 1;

    public const int MaxLevel = 5;

    /// <summary>
    /// Accounts at <paramref name="level"/> whose code is
    /// <paramref name="accCode"/>, plus their descendants.
    /// </summary>
    public static Expression<Func<AccChart, bool>> Predicate(
        int level,
        string accCode)
    {
        return level switch
        {
            1 => account => account.FirstLevel == accCode,
            2 => account => account.SecondLevel == accCode,
            3 => account => account.ThirdLevel == accCode,
            4 => account => account.FourthLevel == accCode,
            5 => account => account.FifthLevel == accCode,
            _ => account => account.AccCode == accCode
        };
    }

    /// <summary>
    /// The ancestor code a transaction account rolls up to at
    /// <paramref name="level"/>. Falls back to the account's own code
    /// when the account is shallower than the requested level, so a row
    /// is never dropped out of the report for want of a heading.
    /// </summary>
    public static string SectionCode(
        int? level,
        string accCode,
        string? firstLevel,
        string? secondLevel,
        string? thirdLevel,
        string? fourthLevel,
        string? fifthLevel)
    {
        var code = level switch
        {
            1 => firstLevel,
            2 => secondLevel,
            3 => thirdLevel,
            4 => fourthLevel,
            5 => fifthLevel,
            _ => accCode
        };

        return Coalesce(code, accCode);
    }

    /// <summary>
    /// The account head one level above <paramref name="level"/> — the
    /// code the printed report subtotals under.
    /// </summary>
    /// <remarks>
    /// Verified against real snapshot rows: a level 4 account such as
    /// <c>101001</c> subtotals under its ThirdLevel <c>101000 Cash in
    /// Hand</c>, and a level 5 account such as <c>150101</c> under its
    /// FourthLevel <c>150100 Land</c>. At level 1 there is no ancestor,
    /// so the account heads itself.
    /// </remarks>
    public static string HeadCode(
        int? level,
        string accCode,
        string? firstLevel,
        string? secondLevel,
        string? thirdLevel,
        string? fourthLevel,
        string? fifthLevel)
    {
        var parentLevel = level.HasValue
            ? level.Value - 1
            : MaxLevel - 1;

        if (parentLevel < MinLevel)
        {
            return SectionCode(
                level,
                accCode,
                firstLevel,
                secondLevel,
                thirdLevel,
                fourthLevel,
                fifthLevel);
        }

        return SectionCode(
            parentLevel,
            accCode,
            firstLevel,
            secondLevel,
            thirdLevel,
            fourthLevel,
            fifthLevel);
    }

    /// <summary>
    /// Unused level columns are stored as "-" in AccChart rather than
    /// left null, so both have to be treated as absent.
    /// </summary>
    private static string Coalesce(string? code, string fallback)
    {
        return string.IsNullOrWhiteSpace(code) || code.Trim() == "-"
            ? fallback
            : code.Trim();
    }
}
