namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;

/// <summary>
/// The Report View toggle on the Office Trial Balance form.
/// </summary>
public enum TrialBalanceDetailLevel
{
    /// <summary>One line per account at the requested Acc Level.</summary>
    Detail = 0,

    /// <summary>One line per account head, members rolled up.</summary>
    Summary = 1
}
