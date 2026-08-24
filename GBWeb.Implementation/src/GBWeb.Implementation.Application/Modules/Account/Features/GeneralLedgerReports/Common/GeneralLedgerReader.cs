using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Common;

/// <summary>
/// Builds the subsidiary ledger from live transactions: AccTrxMaster for
/// the voucher, AccTrxDetail for the amounts, AccChart for the account
/// and Office for the branch.
/// </summary>
internal static class GeneralLedgerReader
{
    public const string ReportTitle = "Subsidiary Ledger";

    /// <summary>
    /// One posting, flattened out of the join. All five AccChart level
    /// columns come along so the rows can be grouped under the ancestor
    /// account for whichever Acc Level was asked for.
    /// </summary>
    private sealed record Line(
        DateTime TrxDate,
        long TrxMasterID,
        long TrxDetailsID,
        string? VoucherType,
        string VoucherNo,
        string? Narration,
        string AccCode,
        string? AccName,
        string? FirstLevel,
        string? SecondLevel,
        string? ThirdLevel,
        string? FourthLevel,
        string? FifthLevel,
        decimal Debit,
        decimal Credit);

    public static async Task<GeneralLedgerReportDto> ReadAsync(
        IApplicationDbContext dbContext,
        string companyName,
        DateTime dateFrom,
        DateTime dateTo,
        int? officeId,
        int? accLevel,
        string? accCode,
        CancellationToken cancellationToken)
    {
        var office = await ReportOfficeScope.ResolveAsync(
            dbContext, officeId, cancellationToken);

        // TrxDate carries a time component on some rows, so Date To is
        // compared against the start of the following day rather than
        // against midnight of the day itself.
        var from = dateFrom.Date;
        var toExclusive = dateTo.Date.AddDays(1);

        var opening = await Postings(
                dbContext, office.OfficeIds, accLevel, accCode,
                fromInclusive: null, toExclusive: from)
            .ToListAsync(cancellationToken);

        var period = await Postings(
                dbContext, office.OfficeIds, accLevel, accCode,
                fromInclusive: from, toExclusive: toExclusive)
            .ToListAsync(cancellationToken);

        var accounts = await BuildAccountsAsync(
            dbContext, opening, period, accLevel, accCode, cancellationToken);

        return new GeneralLedgerReportDto(
            companyName,
            office.Name,
            ReportTitle,
            from,
            dateTo.Date,
            accounts,
            accounts.Sum(x => x.TotalDebit),
            accounts.Sum(x => x.TotalCredit));
    }

    // ============================================================
    // QUERY
    // ============================================================

    /// <summary>
    /// The join, filtered and ordered. Every filter is applied before the
    /// projection: a <c>Where</c> or <c>OrderBy</c> written against the
    /// projected <see cref="Line"/> cannot be translated to SQL.
    /// </summary>
    private static IQueryable<Line> Postings(
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
                ? chart.Where(
                    ReportAccountFilter.Predicate(accLevel.Value, code))
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
                // InActiveDate, so leaving this out would print entries
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
            .OrderBy(x => x.master.TrxDate)
            .ThenBy(x => x.master.TrxMasterID)
            .ThenBy(x => x.detail.TrxDetailsID)
            .Select(x => new Line(
            x.master.TrxDate,
            x.master.TrxMasterID,
            x.detail.TrxDetailsID,
            x.master.VoucherType,
            x.master.VoucherNo,
            x.detail.Narration,
            x.account.AccCode,
            x.account.AccName,
            x.account.FirstLevel,
            x.account.SecondLevel,
            x.account.ThirdLevel,
            x.account.FourthLevel,
            x.account.FifthLevel,
            x.detail.Debit ?? 0m,
            x.detail.Credit ?? 0m));
    }

    // ============================================================
    // GROUPING
    // ============================================================

    private static async Task<List<GeneralLedgerAccountDto>>
        BuildAccountsAsync(
            IApplicationDbContext dbContext,
            List<Line> opening,
            List<Line> period,
            int? accLevel,
            string? accCode,
            CancellationToken cancellationToken)
    {
        var requested = accCode?.Trim();

        var openingByAccount = opening
            .GroupBy(line => SectionCode(line, accLevel))
            .ToDictionary(
                group => group.Key,
                group => (
                    Debit: group.Sum(line => line.Debit),
                    Credit: group.Sum(line => line.Credit)),
                StringComparer.OrdinalIgnoreCase);

        var periodByAccount = period
            .GroupBy(line => SectionCode(line, accLevel))
            .ToDictionary(
                group => group.Key,
                group => group.ToList(),
                StringComparer.OrdinalIgnoreCase);

        // An account asked for by code is printed even when it saw no
        // activity, so its opening position is still visible. Accounts
        // that only carry an opening balance are otherwise left out, or a
        // report with no code filter would list the whole chart.
        var codes = periodByAccount.Keys.ToHashSet(
            StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrEmpty(requested))
        {
            codes.Add(requested);
        }

        var names = await NamesAsync(dbContext, codes, cancellationToken);

        var accounts = new List<GeneralLedgerAccountDto>();

        foreach (var code in codes.OrderBy(x => x, StringComparer.Ordinal))
        {
            openingByAccount.TryGetValue(
                code, out var openingTotals);

            var openingBalance = openingTotals.Debit - openingTotals.Credit;

            var rows = new List<GeneralLedgerRowDto>();
            var balance = openingBalance;
            var debitTotal = 0m;
            var creditTotal = 0m;

            if (periodByAccount.TryGetValue(code, out var lines))
            {
                foreach (var line in lines)
                {
                    balance += line.Debit - line.Credit;
                    debitTotal += line.Debit;
                    creditTotal += line.Credit;

                    rows.Add(new GeneralLedgerRowDto(
                        line.TrxDate,
                        GeneralLedgerText.VoucherNumber(
                            line.VoucherType, line.VoucherNo),
                        GeneralLedgerText.Descripton(
                            line.Narration, line.AccCode),
                        line.Debit,
                        line.Credit,
                        balance));
                }
            }

            accounts.Add(new GeneralLedgerAccountDto(
                code,
                names.TryGetValue(code, out var name) ? name : string.Empty,
                openingTotals.Debit,
                openingTotals.Credit,
                openingBalance,
                rows,
                debitTotal,
                creditTotal,
                balance));
        }

        return accounts;
    }

    private static string SectionCode(Line line, int? accLevel)
    {
        return ReportAccountFilter.SectionCode(
            accLevel,
            line.AccCode,
            line.FirstLevel,
            line.SecondLevel,
            line.ThirdLevel,
            line.FourthLevel,
            line.FifthLevel);
    }

    /// <summary>
    /// Heading names for the grouped accounts. The rows only carry the
    /// name of the account they posted to, and a group is usually headed
    /// by an ancestor of that account.
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
