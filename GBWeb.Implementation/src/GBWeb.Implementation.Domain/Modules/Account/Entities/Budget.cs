using System;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    public sealed class Budget
    {
        public int BudgetID { get; set; }
        public int OrgID { get; set; }
        public int OfficeID { get; set; }
        public DateTime? TrxDate { get; set; }
        public int? BudgetYear { get; set; }
        public int AccID { get; set; }
        public string? AccCode { get; set; }
        public decimal BudgetAmount { get; set; }
        public int? BudgetType { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? InActiveDate { get; set; }
        public string CreateUser { get; set; } = string.Empty;
        public DateTime CreateDate { get; set; }
        public bool? IsFinancial { get; set; }

        public AccChart? Account { get; set; }
    }
}
