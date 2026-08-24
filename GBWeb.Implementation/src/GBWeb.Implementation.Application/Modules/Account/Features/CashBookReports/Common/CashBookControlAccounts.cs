using GBWeb.Implementation.Application.Common.Options;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;

/// <summary>
/// Which side of a cash book entry a posting sits on.
/// </summary>
internal enum CashBookLeg
{
    /// <summary>
    /// Neither cash nor bank: the account on the other side of the money,
    /// which is what the Cash Book names in its Account Name column.
    /// </summary>
    Contra = 0,

    Cash = 1,

    Bank = 2
}

/// <summary>
/// Tells a cash or bank posting from its counter-entry by the account head
/// it belongs to.
/// </summary>
/// <remarks>
/// The obvious signals all fail on this chart. AccTrxMaster.VoucherType
/// does not say: every type in the data — <c>CA</c>, <c>Jr</c>, <c>Bc</c>,
/// <c>Ba</c>, <c>Dr</c>, <c>Cr</c> — posts to both the cash and the bank
/// account, and in both directions. AccChart.BankAccountNo is blank on the
/// bank accounts themselves. Matching the name is worse than useless:
/// dozens of level 5 liability accounts are named after a bank ("RRL
/// Support One Bank - CHAR-BATA"), and a stray account named "cash in
/// hand" sits outside the chart's levels altogether.
///
/// What does hold is the chart's own shape. Cash accounts descend from the
/// <c>101000 Cash in Hand</c> head and bank accounts from
/// <c>102000 Cash at Bank</c>, which is the same ancestry
/// <see cref="Common.Reports.ReportAccountFilter"/> already relies on to
/// subtotal a report. So the head code is the test, and it is matched
/// against the account's own code as well as its level columns, so that a
/// posting to the head itself counts too.
/// </remarks>
internal readonly record struct CashBookControlAccounts(
    string CashHeadCode,
    string BankHeadCode)
{
    public static CashBookControlAccounts From(ReportOptions options)
    {
        return new CashBookControlAccounts(
            options.CashHeadCode,
            options.BankHeadCode);
    }

    public CashBookLeg Classify(
        string accCode,
        string? firstLevel,
        string? secondLevel,
        string? thirdLevel,
        string? fourthLevel,
        string? fifthLevel)
    {
        if (Under(
                CashHeadCode, accCode, firstLevel, secondLevel,
                thirdLevel, fourthLevel, fifthLevel))
        {
            return CashBookLeg.Cash;
        }

        if (Under(
                BankHeadCode, accCode, firstLevel, secondLevel,
                thirdLevel, fourthLevel, fifthLevel))
        {
            return CashBookLeg.Bank;
        }

        return CashBookLeg.Contra;
    }

    /// <summary>
    /// True when the account is the head itself or sits somewhere beneath
    /// it. A descendant carries the head's code in whichever level column
    /// matches the head's own depth, and which column that is does not
    /// have to be known — no two heads share a code, so finding it in any
    /// of them is answer enough.
    /// </summary>
    private static bool Under(
        string headCode,
        string accCode,
        string? firstLevel,
        string? secondLevel,
        string? thirdLevel,
        string? fourthLevel,
        string? fifthLevel)
    {
        if (string.IsNullOrWhiteSpace(headCode))
        {
            return false;
        }

        return Same(accCode, headCode)
            || Same(firstLevel, headCode)
            || Same(secondLevel, headCode)
            || Same(thirdLevel, headCode)
            || Same(fourthLevel, headCode)
            || Same(fifthLevel, headCode);
    }

    private static bool Same(string? code, string headCode)
    {
        return !string.IsNullOrWhiteSpace(code) &&
               string.Equals(
                   code.Trim(), headCode, StringComparison.OrdinalIgnoreCase);
    }
}
