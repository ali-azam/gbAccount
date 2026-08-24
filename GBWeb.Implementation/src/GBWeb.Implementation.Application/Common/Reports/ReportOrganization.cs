using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Common.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Common.Reports;

/// <summary>
/// The organisation lines a report prints above the table: the name, and
/// the postal address the Cash Book prints under it.
/// </summary>
internal sealed record ReportOrganizationHeader(string Name, string Address);

/// <summary>
/// Resolves the organisation name printed on the first header line of
/// every report.
/// </summary>
internal static class ReportOrganization
{
    public static async Task<string> NameAsync(
        IApplicationDbContext dbContext,
        int organizationId,
        CancellationToken cancellationToken)
    {
        var name = await dbContext.Organizations
            .AsNoTracking()
            .Where(x => x.OrgID == organizationId)
            .Select(x => x.OrganizationName)
            .FirstOrDefaultAsync(cancellationToken);

        // A blank header would print a report that looks like it belongs
        // to nobody, so this fails with something the UI can show.
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException(Missing(organizationId));
        }

        return name.Trim();
    }

    /// <summary>
    /// Name and address together, for the reports whose header block has
    /// a second line. The address is optional — an organisation row with
    /// no OrgAddress simply prints one line instead of two.
    /// </summary>
    public static async Task<ReportOrganizationHeader> HeaderAsync(
        IApplicationDbContext dbContext,
        int organizationId,
        CancellationToken cancellationToken)
    {
        var row = await dbContext.Organizations
            .AsNoTracking()
            .Where(x => x.OrgID == organizationId)
            .Select(x => new
            {
                x.OrganizationName,
                x.OrgAddress
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null || string.IsNullOrWhiteSpace(row.OrganizationName))
        {
            throw new DomainException(Missing(organizationId));
        }

        return new ReportOrganizationHeader(
            row.OrganizationName.Trim(),
            row.OrgAddress?.Trim() ?? string.Empty);
    }

    private static string Missing(int organizationId)
    {
        return $"Reports:OrganizationId is set to {organizationId}, " +
               "which has no matching row with a name in the " +
               "Organization table. Point it at an existing OrgID.";
    }
}
