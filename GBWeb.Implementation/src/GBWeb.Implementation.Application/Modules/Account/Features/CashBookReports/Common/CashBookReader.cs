using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Reports;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;

/// <summary>
/// Builds the Cash Book from live transactions: AccTrxMaster for the
/// voucher, AccTrxDetail for the amounts, AccChart for the account and
/// Office for the branch.
/// </summary>
/// <remarks>
/// The Cash Book is a cash and bank book, not a per-account summary. It
/// reports the movements of two accounts — cash and bank — and names, for
/// each movement, the account on the other side of it. Which postings are
/// those two accounts' own is decided by
/// <see cref="CashBookControlAccounts"/>.
///
/// Everything is therefore read a voucher at a time and driven by the cash
/// or bank leg, never by the counter-entries. That is what keeps Sum of
/// Transaction in agreement with Opening and Closing Balance: both are
/// measured off the same legs, so <c>opening + receipts - payments =
/// closing</c> holds by construction. Driving the rows from the
/// counter-entries instead would break it, because the opening-balance
/// journals in this data debit two dozen accounts at once alongside cash,
/// and those debits are not cash movements.
///
/// Detail is still printed wherever it is free. When a voucher moved money
/// on one side of one family only, its counter-entries add up to exactly
/// the amount that moved, so each is listed on its own line. When it did
/// not — a cash-to-bank transfer, or one of those journals — the movement
/// is printed as one line instead.
/// </remarks>
internal static class CashBookReader
{
    public const string ReportTitle = "Cash Book";

    /// <summary>
    /// One posting, flattened out of the join. All five AccChart level
    /// columns come along, both to place the posting and so the Account
    /// Name can be rolled up to whichever Acc Level was asked for.
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

    /// <summary>A posting and the part it plays in its voucher.</summary>
    private sealed record Leg(Line Line, CashBookLeg Kind);

    /// <summary>
    /// One printed line: an amount in one of the four money columns, the
    /// posting it is reported from, and the account it is named after.
    /// Three of the four amounts are always zero.
    /// </summary>
    private sealed record Entry(
        Line Source,
        Line? NameSource,
        decimal CashReceipt,
        decimal CashPayment,
        decimal BankReceipt,
        decimal BankPayment);

    public static async Task<CashBookReportDto> ReadAsync(
        IApplicationDbContext dbContext,
        ReportOrganizationHeader company,
        CashBookControlAccounts controls,
        DateTime dateFrom,
        DateTime dateTo,
        int? officeId,
        int? accLevel,
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
                dbContext, office.OfficeIds,
                fromInclusive: null, toExclusive: from)
            .ToListAsync(cancellationToken);

        var period = await Postings(
                dbContext, office.OfficeIds,
                fromInclusive: from, toExclusive: toExclusive)
            .ToListAsync(cancellationToken);

        // Cash and bank are asset accounts, so a debit is money in.
        var (openingCash, openingBank) = Balance(opening, controls);

        var entries = BuildEntries(period, controls, accLevel);

        var rows = await BuildRowsAsync(
            dbContext, entries, accLevel, cancellationToken);

        var cashReceipt = rows.Sum(x => x.CashReceipt);
        var cashPayment = rows.Sum(x => x.CashPayment);
        var bankReceipt = rows.Sum(x => x.BankReceipt);
        var bankPayment = rows.Sum(x => x.BankPayment);

        return new CashBookReportDto(
            company.Name,
            company.Address,
            ReportTitle,
            office.Name,
            from,
            dateTo.Date,
            openingCash,
            openingBank,
            rows,
            cashReceipt,
            cashPayment,
            bankReceipt,
            bankPayment,
            openingCash + cashReceipt - cashPayment,
            openingBank + bankReceipt - bankPayment);
    }

    // ============================================================
    // QUERY
    // ============================================================

    /// <summary>
    /// The join, filtered and ordered. Every filter is applied before the
    /// projection: a <c>Where</c> or <c>OrderBy</c> written against the
    /// projected <see cref="Line"/> cannot be translated to SQL.
    /// </summary>
    /// <remarks>
    /// Both sides of every voucher are fetched, including the ones that
    /// turn out to have no cash or bank leg at all. Narrowing that in SQL
    /// would mean either naming the cash and bank accounts twice or
    /// fetching the chart to find them, and the counter-entries are wanted
    /// anyway — they are what the Account Name column shows.
    /// </remarks>
    private static IQueryable<Line> Postings(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> officeIds,
        DateTime? fromInclusive,
        DateTime? toExclusive)
    {
        var query =
            from master in dbContext.AccTrxMasters.AsNoTracking()
            join detail in dbContext.AccTrxDetails.AsNoTracking()
                on master.TrxMasterID equals detail.TrxMasterID
            join account in dbContext.AccCharts.AsNoTracking()
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
    // BALANCES
    // ============================================================

    /// <summary>
    /// What cash and bank stand at over the given postings, taken from
    /// their own legs alone.
    /// </summary>
    private static (decimal Cash, decimal Bank) Balance(
        IEnumerable<Line> lines,
        CashBookControlAccounts controls)
    {
        var cash = 0m;
        var bank = 0m;

        foreach (var line in lines)
        {
            switch (Classify(line, controls))
            {
                case CashBookLeg.Cash:
                    cash += line.Debit - line.Credit;
                    break;

                case CashBookLeg.Bank:
                    bank += line.Debit - line.Credit;
                    break;
            }
        }

        return (cash, bank);
    }

    // ============================================================
    // COLUMN PLACEMENT
    // ============================================================

    /// <summary>
    /// Turns the period's postings into printed lines, one voucher at a
    /// time. A voucher that never touched cash or bank is not a cash book
    /// entry and is dropped whole.
    /// </summary>
    private static List<Entry> BuildEntries(
        IReadOnlyList<Line> lines,
        CashBookControlAccounts controls,
        int? accLevel)
    {
        var entries = new List<Entry>();

        // GroupBy keeps both the order the vouchers first appear in and
        // the order of the postings inside each, so the query's ordering
        // carries through to the printed page.
        foreach (var voucher in lines.GroupBy(line => line.TrxMasterID))
        {
            var legs = voucher
                .Select(line => new Leg(line, Classify(line, controls)))
                .ToList();

            var cash = legs.Where(x => x.Kind == CashBookLeg.Cash).ToList();
            var bank = legs.Where(x => x.Kind == CashBookLeg.Bank).ToList();

            if (cash.Count == 0 && bank.Count == 0)
            {
                continue;
            }

            var contra = legs
                .Where(x => x.Kind == CashBookLeg.Contra)
                .ToList();

            // Detail can only be attributed when one family moved: with
            // both, there is no telling which counter-entry belonged to
            // the cash side and which to the bank side.
            var single = cash.Count == 0 || bank.Count == 0;

            AddMovement(entries, cash, isCash: true, contra, bank, single, accLevel);
            AddMovement(entries, bank, isCash: false, contra, cash, single, accLevel);
        }

        return entries;
    }

    /// <summary>
    /// Adds the lines for one family's movement in one voucher.
    /// </summary>
    /// <param name="control">That family's own legs. None means nothing to add.</param>
    /// <param name="contra">The voucher's counter-entries.</param>
    /// <param name="otherControl">The other family's legs, for naming a transfer.</param>
    /// <param name="single">Whether this is the only family the voucher touched.</param>
    private static void AddMovement(
        List<Entry> entries,
        List<Leg> control,
        bool isCash,
        List<Leg> contra,
        List<Leg> otherControl,
        bool single,
        int? accLevel)
    {
        if (control.Count == 0)
        {
            return;
        }

        var debit = control.Sum(x => x.Line.Debit);
        var credit = control.Sum(x => x.Line.Credit);

        // Money in and out of the same family in one voucher is not one
        // movement, so each leg is listed on its own instead.
        if (debit != 0m && credit != 0m)
        {
            var name = CounterName(contra, otherControl, accLevel);

            foreach (var leg in control)
            {
                if (leg.Line.Debit != 0m)
                {
                    entries.Add(Money(
                        leg.Line, name, isCash,
                        receipt: true, leg.Line.Debit));
                }
                else if (leg.Line.Credit != 0m)
                {
                    entries.Add(Money(
                        leg.Line, name, isCash,
                        receipt: false, leg.Line.Credit));
                }
            }

            return;
        }

        var receipt = debit != 0m;
        var amount = receipt ? debit : credit;

        if (amount == 0m)
        {
            return;
        }

        // A receipt debits cash or bank and credits where the money came
        // from, so the counter-entries to read are the credits; a payment
        // is the other way round.
        if (single && contra.Count > 0)
        {
            var counter = contra
                .Select(x => (
                    x.Line,
                    Amount: receipt ? x.Line.Credit : x.Line.Debit))
                .Where(x => x.Amount != 0m)
                .ToList();

            // Only when they account for the whole movement, or the four
            // column totals would stop agreeing with the balances.
            if (counter.Count > 0 &&
                counter.Sum(x => x.Amount) == amount)
            {
                foreach (var (line, value) in counter)
                {
                    entries.Add(Money(line, line, isCash, receipt, value));
                }

                return;
            }
        }

        entries.Add(Money(
            control[0].Line,
            CounterName(contra, otherControl, accLevel),
            isCash,
            receipt,
            amount));
    }

    /// <summary>
    /// The account a summarised movement is named after: the other side of
    /// it, where that side is one account — or several that roll up to the
    /// same heading at the requested Acc Level, which prints the same. A
    /// mixed voucher has no single answer and prints a dash.
    /// </summary>
    private static Line? CounterName(
        List<Leg> contra,
        List<Leg> otherControl,
        int? accLevel)
    {
        // A transfer between cash and bank has no counter-entry of its
        // own: each side is named after the other.
        var candidates = contra.Count > 0 ? contra : otherControl;

        if (candidates.Count == 0)
        {
            return null;
        }

        var first = candidates[0].Line;
        var code = SectionCode(first, accLevel);

        return candidates.All(x =>
                string.Equals(
                    SectionCode(x.Line, accLevel),
                    code,
                    StringComparison.OrdinalIgnoreCase))
            ? first
            : null;
    }

    private static Entry Money(
        Line source,
        Line? nameSource,
        bool isCash,
        bool receipt,
        decimal amount)
    {
        return new Entry(
            source,
            nameSource,
            isCash && receipt ? amount : 0m,
            isCash && !receipt ? amount : 0m,
            !isCash && receipt ? amount : 0m,
            !isCash && !receipt ? amount : 0m);
    }

    private static CashBookLeg Classify(
        Line line,
        CashBookControlAccounts controls)
    {
        return controls.Classify(
            line.AccCode,
            line.FirstLevel,
            line.SecondLevel,
            line.ThirdLevel,
            line.FourthLevel,
            line.FifthLevel);
    }

    // ============================================================
    // ROWS
    // ============================================================

    private static async Task<List<CashBookRowDto>> BuildRowsAsync(
        IApplicationDbContext dbContext,
        List<Entry> entries,
        int? accLevel,
        CancellationToken cancellationToken)
    {
        var codes = entries
            .Where(x => x.NameSource is not null)
            .Select(x => SectionCode(x.NameSource!, accLevel))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var names = await NamesAsync(dbContext, codes, cancellationToken);

        var rows = new List<CashBookRowDto>(entries.Count);

        foreach (var entry in entries)
        {
            rows.Add(new CashBookRowDto(
                CashBookText.VoucherNumber(
                    entry.Source.VoucherType, entry.Source.VoucherNo),
                CashBookText.AccountName(AccountName(entry, names, accLevel)),
                CashBookText.Description(entry.Source.Narration),
                entry.CashReceipt,
                entry.CashPayment,
                entry.BankReceipt,
                entry.BankPayment));
        }

        return rows;
    }

    private static string? AccountName(
        Entry entry,
        Dictionary<string, string> names,
        int? accLevel)
    {
        if (entry.NameSource is null)
        {
            return null;
        }

        var code = SectionCode(entry.NameSource, accLevel);

        // The roll-up name is preferred, but a posting on an account
        // shallower than the requested level heads itself, and then the
        // account's own name is the right one to print.
        return names.TryGetValue(code, out var heading) &&
               !string.IsNullOrWhiteSpace(heading)
            ? heading
            : entry.NameSource.AccName;
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
    /// Heading names for the rolled-up accounts. A posting only carries
    /// the name of the account it posted to, and the Account Name column
    /// shows the ancestor at the requested Acc Level.
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
