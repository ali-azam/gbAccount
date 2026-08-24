using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Common.Reports;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Resolves the organisation name printed on the first header line of
/// the trial balance reports.
/// </summary>
internal static class TrialBalanceOrganization
{
    public static Task<string> NameAsync(
        IApplicationDbContext dbContext,
        int organizationId,
        CancellationToken cancellationToken)
    {
        return ReportOrganization.NameAsync(
            dbContext, organizationId, cancellationToken);
    }
}
