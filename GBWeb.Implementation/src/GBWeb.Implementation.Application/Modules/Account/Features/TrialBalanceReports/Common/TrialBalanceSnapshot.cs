using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Shared query pieces for the trial balance reports.
///
/// OLRSTrailBalance holds one complete trial balance per to_date, so
/// a report must read exactly one snapshot. Summing every snapshot
/// inside a date range would double count, which is why the window
/// is only used to pick a snapshot, never to aggregate across them.
/// </summary>
internal static class TrialBalanceSnapshot
{
    /// <summary>
    /// Every snapshot that could satisfy the request: on or before
    /// Date To, no earlier than Date From when one was supplied, and
    /// rolled up to the requested account level.
    /// </summary>
    public static IQueryable<OlrsTrialBalance> Window(
        IQueryable<OlrsTrialBalance> source,
        DateTime? dateFrom,
        DateTime dateTo,
        int? accLevel)
    {
        var query = source
            .AsNoTracking()
            .Where(x =>
                x.ToDate != null &&
                x.ToDate <= dateTo);

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.ToDate >= dateFrom.Value);
        }

        if (accLevel.HasValue)
        {
            query = query.Where(x =>
                x.AccountLevel == accLevel.Value);
        }

        return query;
    }

    /// <summary>
    /// The most recent snapshot date inside the window, or null when
    /// the window holds no snapshot at all.
    ///
    /// Resolved before any account code filter is applied, so asking
    /// for a single account cannot drag the report back onto an older
    /// snapshot that happens to contain it.
    /// </summary>
    public static async Task<DateTime?> ResolveDateAsync(
        IQueryable<OlrsTrialBalance> window,
        CancellationToken cancellationToken)
    {
        // TOP(1) ORDER BY DESC rather than MAX, so an empty window is
        // an empty list instead of a NULL aggregate to interpret.
        var latest = await window
            .Select(x => x.ToDate)
            .OrderByDescending(x => x)
            .Take(1)
            .ToListAsync(cancellationToken);

        return latest.Count > 0
            ? latest[0]
            : null;
    }

    public static TrialBalanceTotalsDto Total<TRow>(
        IReadOnlyList<TRow> rows)
        where TRow : ITrialBalanceAmounts
    {
        return new TrialBalanceTotalsDto(
            rows.Sum(x => x.OpeningDebit),
            rows.Sum(x => x.OpeningCredit),
            rows.Sum(x => x.CurrentDebit),
            rows.Sum(x => x.CurrentCredit),
            rows.Sum(x => x.JournalDebit),
            rows.Sum(x => x.JournalCredit),
            rows.Sum(x => x.PreviousJournalDebit),
            rows.Sum(x => x.PreviousJournalCredit),
            rows.Sum(x => x.BalanceDebit),
            rows.Sum(x => x.BalanceCredit));
    }

    public static TrialBalanceTotalsDto Empty()
    {
        return new TrialBalanceTotalsDto(
            0m, 0m, 0m, 0m, 0m, 0m, 0m, 0m, 0m, 0m);
    }
}
