using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// The two trial balance reads, in one place.
///
/// The JSON endpoints and the PDF/Excel exports both go through here so
/// a downloaded report can never show different figures from what the
/// screen requested.
/// </summary>
internal static class TrialBalanceReader
{
    public static async Task<TrialBalanceAccCodeReportDto> ByAccCodeAsync(
        IApplicationDbContext dbContext,
        DateTime? dateFrom,
        DateTime dateTo,
        int? accLevel,
        string? accCode,
        CancellationToken cancellationToken)
    {
        var window = TrialBalanceSnapshot.Window(
            dbContext.OlrsTrialBalances,
            dateFrom,
            dateTo,
            accLevel);

        var asOnDate = await TrialBalanceSnapshot
            .ResolveDateAsync(window, cancellationToken);

        if (asOnDate is null)
        {
            return new TrialBalanceAccCodeReportDto(
                null,
                accLevel,
                Array.Empty<TrialBalanceAccCodeRowDto>(),
                TrialBalanceSnapshot.Empty());
        }

        var snapshot = window
            .Where(x => x.ToDate == asOnDate);

        if (!string.IsNullOrWhiteSpace(accCode))
        {
            var wanted = accCode.Trim();

            snapshot = snapshot
                .Where(x => x.AccCode == wanted);
        }

        // Offices are collapsed here: one row per account.
        var rows = await snapshot
            .GroupBy(x => new
            {
                x.AccCode,
                x.AccName,
                x.AccLevel,
                x.TopLevelCode,
                x.TopLevelName
            })
            .OrderBy(g => g.Key.AccCode)
            .Select(g => new TrialBalanceAccCodeRowDto(
                g.Key.AccCode,
                g.Key.AccName,
                g.Key.AccLevel,
                g.Key.TopLevelCode,
                g.Key.TopLevelName,
                g.Sum(x => x.OpeningDebit ?? 0m),
                g.Sum(x => x.OpeningCredit ?? 0m),
                g.Sum(x => x.CurrentDebit ?? 0m),
                g.Sum(x => x.CurrentCredit ?? 0m),
                g.Sum(x => x.JournalDebit ?? 0m),
                g.Sum(x => x.JournalCredit ?? 0m),
                g.Sum(x => x.PreviousJournalDebit ?? 0m),
                g.Sum(x => x.PreviousJournalCredit ?? 0m),
                g.Sum(x => x.BalanceDebit ?? 0m),
                g.Sum(x => x.BalanceCredit ?? 0m)))
            .ToListAsync(cancellationToken);

        return new TrialBalanceAccCodeReportDto(
            asOnDate,
            accLevel,
            rows,
            TrialBalanceSnapshot.Total(rows));
    }

    public static async Task<TrialBalanceOfficeReportDto> ByOfficeAsync(
        IApplicationDbContext dbContext,
        DateTime? dateFrom,
        DateTime dateTo,
        int? accLevel,
        string? accCode,
        string? departmentCode,
        CancellationToken cancellationToken)
    {
        var window = TrialBalanceSnapshot.Window(
            dbContext.OlrsTrialBalances,
            dateFrom,
            dateTo,
            accLevel);

        var asOnDate = await TrialBalanceSnapshot
            .ResolveDateAsync(window, cancellationToken);

        if (asOnDate is null)
        {
            return new TrialBalanceOfficeReportDto(
                null,
                accLevel,
                Array.Empty<TrialBalanceOfficeRowDto>(),
                TrialBalanceSnapshot.Empty());
        }

        var snapshot = window
            .Where(x => x.ToDate == asOnDate);

        if (!string.IsNullOrWhiteSpace(accCode))
        {
            var wanted = accCode.Trim();

            snapshot = snapshot
                .Where(x => x.AccCode == wanted);
        }

        if (!string.IsNullOrWhiteSpace(departmentCode))
        {
            var wanted = departmentCode.Trim();

            snapshot = snapshot
                .Where(x => x.DepartmentCode == wanted);
        }

        // Grouped rather than read raw so a snapshot that happens to
        // hold more than one row per office and account still totals
        // correctly.
        var rows = await snapshot
            .GroupBy(x => new
            {
                x.FirstLevel,
                x.FirstLevelName,
                x.DepartmentCode,
                x.OfficeName,
                x.AccCode,
                x.AccName,
                x.AccLevel,
                x.TopLevelCode,
                x.TopLevelName
            })
            .OrderBy(g => g.Key.DepartmentCode)
            .ThenBy(g => g.Key.AccCode)
            .Select(g => new TrialBalanceOfficeRowDto(
                g.Key.FirstLevel,
                g.Key.FirstLevelName,
                g.Key.DepartmentCode,
                g.Key.OfficeName,
                g.Key.AccCode,
                g.Key.AccName,
                g.Key.AccLevel,
                g.Key.TopLevelCode,
                g.Key.TopLevelName,
                g.Sum(x => x.OpeningDebit ?? 0m),
                g.Sum(x => x.OpeningCredit ?? 0m),
                g.Sum(x => x.CurrentDebit ?? 0m),
                g.Sum(x => x.CurrentCredit ?? 0m),
                g.Sum(x => x.JournalDebit ?? 0m),
                g.Sum(x => x.JournalCredit ?? 0m),
                g.Sum(x => x.PreviousJournalDebit ?? 0m),
                g.Sum(x => x.PreviousJournalCredit ?? 0m),
                g.Sum(x => x.BalanceDebit ?? 0m),
                g.Sum(x => x.BalanceCredit ?? 0m)))
            .ToListAsync(cancellationToken);

        return new TrialBalanceOfficeReportDto(
            asOnDate,
            accLevel,
            rows,
            TrialBalanceSnapshot.Total(rows));
    }
}
