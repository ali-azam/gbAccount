using System;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    public sealed class BudgetParticular
    {
        public long BudgetParticularId { get; set; }
        public string? BudgetParticularCode { get; set; }
        public string? BudgetParticularName { get; set; }
        public int GroupId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? InActiveDate { get; set; }
        public string CreateUser { get; set; } = string.Empty;
        public DateTime CreateDate { get; set; }
    }
}
