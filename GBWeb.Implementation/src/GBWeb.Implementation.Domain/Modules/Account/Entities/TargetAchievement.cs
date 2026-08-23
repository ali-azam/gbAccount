using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("targetachievement", Schema = "dbo")]
    public sealed class TargetAchievement
    {
        [Key]
        public int TargetId { get; set; }

        [Column("ParticularId")]
        public int? BudgetParticularId { get; set; }

        public decimal? Balance { get; set; }
        public decimal? TargetCurrentYear { get; set; }
        public decimal? Target { get; set; }
        public decimal? Achievement { get; set; }
        public DateTime? Date { get; set; }
        public bool? IsActive { get; set; }
        public int? CreateUser { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? OfficeID { get; set; }
        public int? ProductID { get; set; }
    }
}
