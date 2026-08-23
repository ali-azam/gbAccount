namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// The ten money columns every trial balance row carries. Both the
/// account code wise and office wise rows implement this so totals
/// only have to be summed in one place.
/// </summary>
public interface ITrialBalanceAmounts
{
    decimal OpeningDebit { get; }

    decimal OpeningCredit { get; }

    decimal CurrentDebit { get; }

    decimal CurrentCredit { get; }

    decimal JournalDebit { get; }

    decimal JournalCredit { get; }

    decimal PreviousJournalDebit { get; }

    decimal PreviousJournalCredit { get; }

    decimal BalanceDebit { get; }

    decimal BalanceCredit { get; }
}
