using System.Linq.Expressions;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Common.Exceptions;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Common.Reports;

/// <summary>
/// Resolves the selected office into the name printed on the report
/// header and the set of offices whose vouchers belong in the report.
/// </summary>
/// <remarks>
/// Office.FirstLevel..FourthLevel hold the ancestor office code at each
/// level — head office, zone, area, branch — so picking a zone can pull
/// in every branch under it with a single equality test, the same way
/// <see cref="ReportAccountFilter"/> works on the chart.
///
/// Shared by the general ledger and the trial balance so the two reports
/// resolve an office selection identically.
/// </remarks>
internal static class ReportOfficeScope
{
    /// <summary>Header text when no office was selected.</summary>
    public const string AllOffices = "All Offices";

    /// <summary>
    /// An empty <paramref name="OfficeIds"/> means every office — no
    /// office filter is applied at all.
    /// </summary>
    public sealed record Selection(
        string Name,
        IReadOnlyCollection<int> OfficeIds);

    public static Task<Selection> ResolveAsync(
        IApplicationDbContext dbContext,
        int? officeId,
        CancellationToken cancellationToken)
    {
        return ResolveAsync(
            dbContext,
            officeId,
            exceptHeadOffice: false,
            exceptProjectOffice: false,
            cancellationToken);
    }

    public static async Task<Selection> ResolveAsync(
        IApplicationDbContext dbContext,
        int? officeId,
        bool exceptHeadOffice,
        bool exceptProjectOffice,
        CancellationToken cancellationToken)
    {
        var excluding = exceptHeadOffice || exceptProjectOffice;

        if (officeId is null or <= 0)
        {
            // Nothing to narrow: leave the set empty so the caller skips
            // the office filter altogether.
            if (!excluding)
            {
                return new Selection(AllOffices, Array.Empty<int>());
            }

            var kept = await Filtered(
                    dbContext.Offices.AsNoTracking(),
                    exceptHeadOffice,
                    exceptProjectOffice)
                .Select(x => x.OfficeID)
                .ToListAsync(cancellationToken);

            return new Selection(AllOffices, kept);
        }

        var selected = await dbContext.Offices
            .AsNoTracking()
            .Where(x => x.OfficeID == officeId.Value)
            .Select(x => new
            {
                x.OfficeCode,
                x.OfficeName,
                x.OfficeLevel,
                x.IsProjectOffice
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (selected is null)
        {
            throw new DomainException(
                $"Office {officeId.Value} does not exist. Pick an office " +
                "from the list.");
        }

        var code = selected.OfficeCode.Trim();

        // Levels below the selected one roll up to it, so the whole
        // subtree is found by comparing the column for that level.
        var officeIds = await Filtered(
                dbContext.Offices
                    .AsNoTracking()
                    .Where(Predicate(selected.OfficeLevel, code)),
                exceptHeadOffice,
                exceptProjectOffice)
            .Select(x => x.OfficeID)
            .ToListAsync(cancellationToken);

        // A branch that is its own leaf still has to appear in the list,
        // and the level columns of the oldest rows are not always filled
        // in, so the selected office is added back — unless one of the
        // Except boxes is what removed it, which is a deliberate choice.
        var selectedSurvives =
            !(exceptHeadOffice && selected.OfficeLevel == 1) &&
            !(exceptProjectOffice && selected.IsProjectOffice == true);

        if (selectedSurvives && !officeIds.Contains(officeId.Value))
        {
            officeIds.Add(officeId.Value);
        }

        var name = string.IsNullOrWhiteSpace(selected.OfficeName)
            ? code
            : selected.OfficeName.Trim();

        return new Selection(name, officeIds);
    }

    /// <summary>
    /// Applies the two Except boxes the legacy report forms carry.
    /// </summary>
    /// <remarks>
    /// Except ProjectOffice tests <c>IsProjectOffice == true</c>, so an
    /// office left null counts as a normal office. Nothing in the
    /// current data sets that column, so the box removes no rows until
    /// it is populated.
    /// </remarks>
    private static IQueryable<Office> Filtered(
        IQueryable<Office> offices,
        bool exceptHeadOffice,
        bool exceptProjectOffice)
    {
        if (exceptHeadOffice)
        {
            offices = offices.Where(x => x.OfficeLevel != 1);
        }

        if (exceptProjectOffice)
        {
            offices = offices.Where(x => x.IsProjectOffice != true);
        }

        return offices;
    }

    /// <summary>
    /// Offices at <paramref name="level"/> whose code is
    /// <paramref name="officeCode"/>, plus their descendants. Built here
    /// rather than inline because an expression tree cannot hold a
    /// <c>switch</c>.
    /// </summary>
    private static Expression<Func<Office, bool>> Predicate(
        byte level,
        string officeCode)
    {
        return level switch
        {
            1 => office => office.FirstLevel == officeCode,
            2 => office => office.SecondLevel == officeCode,
            3 => office => office.ThirdLevel == officeCode,
            _ => office => office.FourthLevel == officeCode
        };
    }
}
