using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;

/// <summary>
/// Builds a trial balance from live transactions — AccTrxMaster for the
/// voucher, AccTrxDetail for the amounts, AccChart for the account and
/// Office for the branch — instead of reading the OLRSTrailBalance
/// snapshot.
/// </summary>
/// <remarks>
/// The snapshot holds two dates and one office, so it cannot answer a
/// form that asks for an arbitrary date range per branch. Computing from
/// the transactions gives every office that has postings, at every
/// account level, for any range — and it agrees with the general ledger
/// because both read the same two tables through the same office and
/// account helpers.
///
/// The ten money columns are produced so that the identity
/// <see cref="TrialBalanceColumns"/> documents holds exactly:
/// <c>(opening debit - opening credit) + period debits - period credits
/// = closing debit - closing credit</c>. Opening and closing are each
/// netted onto a single side, and PreviousJournal is always zero: a live
/// opening balance already contains every earlier journal posting, so
/// repeating them in their own column would double count.
/// </remarks>
internal static class TrialBalanceTransactionReader
{
    /// <summary>
    /// Whether a measured amount sits before the report period or inside
    /// it, which is what separates the Opening columns from the Debit and
    /// Credit ones.
    /// </summary>
    private enum Phase
    {
        Opening,
        Period
    }

    /// <summary>
    /// Postings summed in SQL down to one row per office, account and
    /// voucher type. Voucher type stays in the key rather than being
    /// folded into a journal flag inside the query, so the journal test
    /// runs in C# against <see cref="TrialBalanceVoucherKind"/> and does
    /// not depend on the database collation.
    /// </summary>
    private sealed record Bucket(
        int OfficeId,
        string AccCode,
        string? AccName,
        int? ChartLevel,
        string? FirstLevel,
        string? SecondLevel,
        string? ThirdLevel,
        string? FourthLevel,
        string? FifthLevel,
        string? VoucherType,
        decimal Debit,
        decimal Credit);

    /// <summary>
    /// A bucket resolved against the requested Acc Level: which report
    /// line it belongs to, which account head that line subtotals under,
    /// and which side of the period it falls on.
    /// </summary>
    private sealed record Measured(
        int OfficeId,
        string SectionCode,
        string HeadCode,
        string? AccLevel,
        Phase Phase,
        bool IsJournal,
        decimal Debit,
        decimal Credit);

    /// <summary>
    /// Everything read for one request: the measured postings, the office
    /// selection behind them and the account names needed to label them.
    /// </summary>
    private sealed record Reading(
        List<Measured> Lines,
        ReportOfficeScope.Selection Office,
        Dictionary<int, OfficeLabel> Offices,
        Dictionary<string, string> AccountNames);

    private sealed record OfficeLabel(string Code, string Name);

    /// <summary>
    /// One trial balance line's ten money columns, already netted.
    /// </summary>
    private sealed record Amounts(
        decimal OpeningDebit,
        decimal OpeningCredit,
        decimal CurrentDebit,
        decimal CurrentCredit,
        decimal JournalDebit,
        decimal JournalCredit,
        decimal BalanceDebit,
        decimal BalanceCredit);

    // ============================================================
    // ENTRY POINTS
    // ============================================================

    /// <summary>
    /// Account wise: offices collapsed, one line per account at the
    /// requested Acc Level.
    /// </summary>
    public static async Task<(TrialBalanceAccCodeReportDto Report,
            string OfficeName)>
        ByAccountAsync(
            IApplicationDbContext dbContext,
            DateTime dateFrom,
            DateTime dateTo,
            int? officeId,
            int? accLevel,
            string? accCode,
            bool exceptHeadOffice,
            bool exceptProjectOffice,
            TrialBalanceDetailLevel detailLevel,
            CancellationToken cancellationToken)
    {
        var reading = await ReadAsync(
            dbContext,
            dateFrom,
            dateTo,
            officeId,
            accLevel,
            accCode,
            exceptHeadOffice,
            exceptProjectOffice,
            detailLevel,
            cancellationToken);

        var rows = reading.Lines
            .GroupBy(line => line.SectionCode, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var first = group.First();
                var amounts = Net(group);

                return new TrialBalanceAccCodeRowDto(
                    group.Key,
                    Name(reading.AccountNames, group.Key),
                    first.AccLevel,
                    first.HeadCode,
                    Name(reading.AccountNames, first.HeadCode),
                    amounts.OpeningDebit,
                    amounts.OpeningCredit,
                    amounts.CurrentDebit,
                    amounts.CurrentCredit,
                    amounts.JournalDebit,
                    amounts.JournalCredit,
                    0m,
                    0m,
                    amounts.BalanceDebit,
                    amounts.BalanceCredit);
            })
            .OrderBy(row => row.TopLevelCode, StringComparer.Ordinal)
            .ThenBy(row => row.AccCode, StringComparer.Ordinal)
            .ToList();

        // AsOnDate is Date To rather than a snapshot date: the closing
        // balance of a computed trial balance is the position at the end
        // of the requested range.
        var report = new TrialBalanceAccCodeReportDto(
            dateTo.Date,
            accLevel,
            rows,
            TrialBalanceSnapshot.Total(rows));

        return (report, reading.Office.Name);
    }

    /// <summary>
    /// Office wise: one line per office and account, so a consolidation
    /// can be read branch by branch.
    /// </summary>
    public static async Task<(TrialBalanceOfficeReportDto Report,
            string OfficeName)>
        ByOfficeAsync(
            IApplicationDbContext dbContext,
            DateTime dateFrom,
            DateTime dateTo,
            int? officeId,
            int? accLevel,
            string? accCode,
            bool exceptHeadOffice,
            bool exceptProjectOffice,
            TrialBalanceDetailLevel detailLevel,
            CancellationToken cancellationToken)
    {
        var reading = await ReadAsync(
            dbContext,
            dateFrom,
            dateTo,
            officeId,
            accLevel,
            accCode,
            exceptHeadOffice,
            exceptProjectOffice,
            detailLevel,
            cancellationToken);

        var rows = reading.Lines
            .GroupBy(line => new
            {
                line.OfficeId,
                line.SectionCode
            })
            .Select(group =>
            {
                var first = group.First();
                var amounts = Net(group);
                var office = OfficeOf(reading.Offices, group.Key.OfficeId);

                return new TrialBalanceOfficeRowDto(
                    // FirstLevel and FirstLevelName carry the snapshot's
                    // own account groupings, which have no counterpart in
                    // the chart, so a computed report leaves them out.
                    null,
                    null,
                    office.Code,
                    office.Name,
                    group.Key.SectionCode,
                    Name(reading.AccountNames, group.Key.SectionCode),
                    first.AccLevel,
                    first.HeadCode,
                    Name(reading.AccountNames, first.HeadCode),
                    amounts.OpeningDebit,
                    amounts.OpeningCredit,
                    amounts.CurrentDebit,
                    amounts.CurrentCredit,
                    amounts.JournalDebit,
                    amounts.JournalCredit,
                    0m,
                    0m,
                    amounts.BalanceDebit,
                    amounts.BalanceCredit);
            })
            .OrderBy(row => row.DepartmentCode, StringComparer.Ordinal)
            .ThenBy(row => row.TopLevelCode, StringComparer.Ordinal)
            .ThenBy(row => row.AccCode, StringComparer.Ordinal)
            .ToList();

        var report = new TrialBalanceOfficeReportDto(
            dateTo.Date,
            accLevel,
            rows,
            TrialBalanceSnapshot.Total(rows));

        return (report, reading.Office.Name);
    }

    // ============================================================
    // READ
    // ============================================================

    private static async Task<Reading> ReadAsync(
        IApplicationDbContext dbContext,
        DateTime dateFrom,
        DateTime dateTo,
        int? officeId,
        int? accLevel,
        string? accCode,
        bool exceptHeadOffice,
        bool exceptProjectOffice,
        TrialBalanceDetailLevel detailLevel,
        CancellationToken cancellationToken)
    {
        var office = await ReportOfficeScope.ResolveAsync(
            dbContext,
            officeId,
            exceptHeadOffice,
            exceptProjectOffice,
            cancellationToken);

        // TrxDate carries a time component on some rows, so Date To is
        // compared against the start of the following day rather than
        // against midnight of the day itself.
        var from = dateFrom.Date;
        var toExclusive = dateTo.Date.AddDays(1);

        var opening = await Buckets(
                dbContext, office.OfficeIds, accLevel, accCode,
                fromInclusive: null, toExclusive: from)
            .ToListAsync(cancellationToken);

        var period = await Buckets(
                dbContext, office.OfficeIds, accLevel, accCode,
                fromInclusive: from, toExclusive: toExclusive)
            .ToListAsync(cancellationToken);

        var lines = Measure(opening, Phase.Opening, accLevel, detailLevel)
            .Concat(Measure(period, Phase.Period, accLevel, detailLevel))
            .ToList();

        var offices = await OfficesAsync(
            dbContext,
            lines.Select(line => line.OfficeId).Distinct().ToList(),
            cancellationToken);

        var codes = lines
            .SelectMany(line => new[] { line.SectionCode, line.HeadCode })
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var names = await NamesAsync(dbContext, codes, cancellationToken);

        return new Reading(lines, office, offices, names);
    }

    /// <summary>
    /// The join, summed in SQL. Every filter is applied before the
    /// projection: a <c>Where</c> written against the projected shape
    /// cannot be translated.
    /// </summary>
    private static IQueryable<Bucket> Buckets(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> officeIds,
        int? accLevel,
        string? accCode,
        DateTime? fromInclusive,
        DateTime? toExclusive)
    {
        var chart = dbContext.AccCharts.AsNoTracking();

        var code = accCode?.Trim();

        if (!string.IsNullOrEmpty(code))
        {
            // With a level, the code selects that account and everything
            // beneath it; without one it selects the account alone.
            chart = accLevel.HasValue
                ? chart.Where(ReportAccountFilter.Predicate(accLevel.Value, code))
                : chart.Where(account => account.AccCode == code);
        }

        var query =
            from master in dbContext.AccTrxMasters.AsNoTracking()
            join detail in dbContext.AccTrxDetails.AsNoTracking()
                on master.TrxMasterID equals detail.TrxMasterID
            join account in chart
                on detail.AccID equals account.AccID
                // IsActive doubles as the void flag on both tables — a
                // reversed voucher keeps its row and gains an
                // InActiveDate, so leaving this out would count entries
                // that were cancelled.
            where master.IsActive == true && detail.IsActive == true
            select new { master, detail, account };

        if (officeIds.Count > 0)
        {
            query = query.Where(x => officeIds.Contains(x.master.OfficeID));
        }

        if (fromInclusive.HasValue)
        {
            var from = fromInclusive.Value;
            query = query.Where(x => x.master.TrxDate >= from);
        }

        if (toExclusive.HasValue)
        {
            var to = toExclusive.Value;
            query = query.Where(x => x.master.TrxDate < to);
        }

        return query
            .GroupBy(x => new
            {
                x.master.OfficeID,
                x.account.AccCode,
                x.account.AccName,
                x.account.AccLevel,
                x.account.FirstLevel,
                x.account.SecondLevel,
                x.account.ThirdLevel,
                x.account.FourthLevel,
                x.account.FifthLevel,
                x.master.VoucherType
            })
            .Select(g => new Bucket(
                g.Key.OfficeID,
                g.Key.AccCode,
                g.Key.AccName,
                g.Key.AccLevel,
                g.Key.FirstLevel,
                g.Key.SecondLevel,
                g.Key.ThirdLevel,
                g.Key.FourthLevel,
                g.Key.FifthLevel,
                g.Key.VoucherType,
                g.Sum(x => x.detail.Debit ?? 0m),
                g.Sum(x => x.detail.Credit ?? 0m)));
    }

    // ============================================================
    // SHAPING
    // ============================================================

    /// <summary>
    /// Resolves each bucket onto the report line it belongs to.
    /// </summary>
    /// <remarks>
    /// Detail groups postings under the account at the requested Acc
    /// Level; Summary groups them one level higher, under the account
    /// head, so the two views are the same figures at two depths rather
    /// than two separate calculations.
    /// </remarks>
    private static IEnumerable<Measured> Measure(
        IEnumerable<Bucket> buckets,
        Phase phase,
        int? accLevel,
        TrialBalanceDetailLevel detailLevel)
    {
        foreach (var bucket in buckets)
        {
            // A level 5 account asked for at level 4 rolls up to its
            // level 4 parent; a level shallower than the request keeps
            // its own code.
            var level = accLevel ?? bucket.ChartLevel;

            var section = detailLevel == TrialBalanceDetailLevel.Summary
                ? Head(bucket, level)
                : Section(bucket, level);

            var head = detailLevel == TrialBalanceDetailLevel.Summary
                ? section
                : Head(bucket, level);

            yield return new Measured(
                bucket.OfficeId,
                section,
                head,
                level?.ToString(),
                phase,
                TrialBalanceVoucherKind.IsJournal(bucket.VoucherType),
                bucket.Debit,
                bucket.Credit);
        }
    }

    private static string Section(Bucket bucket, int? level)
    {
        return ReportAccountFilter.SectionCode(
            level,
            bucket.AccCode,
            bucket.FirstLevel,
            bucket.SecondLevel,
            bucket.ThirdLevel,
            bucket.FourthLevel,
            bucket.FifthLevel);
    }

    private static string Head(Bucket bucket, int? level)
    {
        return ReportAccountFilter.HeadCode(
            level,
            bucket.AccCode,
            bucket.FirstLevel,
            bucket.SecondLevel,
            bucket.ThirdLevel,
            bucket.FourthLevel,
            bucket.FifthLevel);
    }

    /// <summary>
    /// Turns raw debits and credits into the printed columns.
    /// </summary>
    /// <remarks>
    /// Opening and closing are netted onto one side each, which is what
    /// makes a trial balance readable: an account is either a debit or a
    /// credit balance, never both. Everything inside the period stays
    /// gross, split into the cash and journal columns the report prints.
    /// </remarks>
    private static Amounts Net(IEnumerable<Measured> lines)
    {
        var measured = lines as ICollection<Measured> ?? lines.ToList();

        var openingNet = measured
            .Where(x => x.Phase == Phase.Opening)
            .Sum(x => x.Debit - x.Credit);

        var currentDebit = measured
            .Where(x => x.Phase == Phase.Period && !x.IsJournal)
            .Sum(x => x.Debit);

        var currentCredit = measured
            .Where(x => x.Phase == Phase.Period && !x.IsJournal)
            .Sum(x => x.Credit);

        var journalDebit = measured
            .Where(x => x.Phase == Phase.Period && x.IsJournal)
            .Sum(x => x.Debit);

        var journalCredit = measured
            .Where(x => x.Phase == Phase.Period && x.IsJournal)
            .Sum(x => x.Credit);

        var closingNet = openingNet +
                         (currentDebit + journalDebit) -
                         (currentCredit + journalCredit);

        return new Amounts(
            Math.Max(openingNet, 0m),
            Math.Max(-openingNet, 0m),
            currentDebit,
            currentCredit,
            journalDebit,
            journalCredit,
            Math.Max(closingNet, 0m),
            Math.Max(-closingNet, 0m));
    }

    // ============================================================
    // LOOKUPS
    // ============================================================

    private static OfficeLabel OfficeOf(
        Dictionary<int, OfficeLabel> offices,
        int officeId)
    {
        return offices.TryGetValue(officeId, out var office)
            ? office
            : new OfficeLabel(officeId.ToString(), string.Empty);
    }

    private static string Name(
        Dictionary<string, string> names,
        string code)
    {
        return names.TryGetValue(code, out var name)
            ? name
            : string.Empty;
    }

    private static async Task<Dictionary<int, OfficeLabel>> OfficesAsync(
        IApplicationDbContext dbContext,
        List<int> officeIds,
        CancellationToken cancellationToken)
    {
        if (officeIds.Count == 0)
        {
            return new Dictionary<int, OfficeLabel>();
        }

        var rows = await dbContext.Offices
            .AsNoTracking()
            .Where(x => officeIds.Contains(x.OfficeID))
            .Select(x => new
            {
                x.OfficeID,
                x.OfficeCode,
                x.OfficeName
            })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(
            row => row.OfficeID,
            row => new OfficeLabel(
                row.OfficeCode.Trim(),
                row.OfficeName.Trim()));
    }

    /// <summary>
    /// Names for the report lines and their account heads. The postings
    /// only carry the name of the account they hit, and a line is often
    /// headed by an ancestor of that account.
    /// </summary>
    private static async Task<Dictionary<string, string>> NamesAsync(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<string> codes,
        CancellationToken cancellationToken)
    {
        if (codes.Count == 0)
        {
            return new Dictionary<string, string>(
                StringComparer.OrdinalIgnoreCase);
        }

        var wanted = codes.ToList();

        var rows = await dbContext.AccCharts
            .AsNoTracking()
            .Where(account => wanted.Contains(account.AccCode))
            .Select(account => new
            {
                account.AccCode,
                account.AccName
            })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(row => row.AccCode, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.First().AccName?.Trim() ?? string.Empty,
                StringComparer.OrdinalIgnoreCase);
    }
}
