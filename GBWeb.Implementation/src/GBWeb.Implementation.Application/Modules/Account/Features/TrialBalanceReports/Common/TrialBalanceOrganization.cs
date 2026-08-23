using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Domain.Common.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Resolves the organisation name printed on the first header line of
/// the trial balance reports.
/// </summary>
internal static class TrialBalanceOrganization
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
            throw new DomainException(
                $"Reports:OrganizationId is set to {organizationId}, " +
                "which has no matching row with a name in the " +
                "Organization table. Point it at an existing OrgID.");
        }

        return name.Trim();
    }
}
