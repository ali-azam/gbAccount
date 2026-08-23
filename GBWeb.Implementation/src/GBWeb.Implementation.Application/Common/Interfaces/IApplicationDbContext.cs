using GBWeb.Implementation.Domain.Common.Entities;
using GBWeb.Implementation.Domain.Modules.Organization.Entities;
using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Branch> Branches { get; }
    DbSet<Office> Offices { get; }
    DbSet<ApprovalRequest> ApprovalRequests { get; }
    DbSet<AccCategory> AccCategories { get; }
    DbSet<AccChart> AccCharts { get; }
    DbSet<Organization> Organizations { get; }
    DbSet<AccTrxMaster> AccTrxMasters { get; }
    DbSet<AccTrxDetail> AccTrxDetails { get; }
    DbSet<GbAccount> GbAccounts { get; }
    DbSet<Budget> Budgets { get; }
    DbSet<BudgetParticular> BudgetParticulars { get; }
    DbSet<PKSFFundLoan> PKSFFundLoans { get; }
    DbSet<AccMappingForFundTransfer> AccMappingForFundTransfers { get; }
    DbSet<TargetAchievement> TargetAchievements { get; }
    DbSet<YearlyTargetData> YearlyTargetDatas { get; }
    DbSet<OlrsTrialBalance> OlrsTrialBalances { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}