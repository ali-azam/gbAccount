using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("Yearly_Target_Data", Schema = "dbo")]
    public sealed class YearlyTargetData
    {
        [Key]
        public int ID { get; set; }
        public int? OrgID { get; set; }
        public int? OfficeID { get; set; }
        public string? TargetYear { get; set; }
        public int? MonthID { get; set; }
        public int? EmpID { get; set; }
        public int? ParticularID { get; set; }
        public decimal? TargetValue { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? InActiveDate { get; set; }
        public int? CreateUser { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
