using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("AccChart")]
    public class AccChart
    {
        [Key]
        [Column("AccID")]
        public int AccID { get; set; }

        [Required]
        [StringLength(50)]
        public string AccCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string? AccName { get; set; }

        public int? AccLevel { get; set; }

        [StringLength(50)]
        public string? FirstLevel { get; set; }

        [StringLength(50)]
        public string? SecondLevel { get; set; }

        [StringLength(50)]
        public string? ThirdLevel { get; set; }

        [StringLength(50)]
        public string? FourthLevel { get; set; }

        [StringLength(50)]
        public string? FifthLevel { get; set; }

        public int? CategoryID { get; set; }

        public int? OfficeLevel { get; set; }

        public bool? IsTransaction { get; set; }

        [StringLength(2)]
        public string? Nature { get; set; }

        public int? ModuleID { get; set; }

        public int? NoteID { get; set; }

        public int OrgID { get; set; } = 1;

        public bool? IsActive { get; set; }

        public DateTime? InActiveDate { get; set; }

        [Required]
        [StringLength(35)]
        public string CreateUser { get; set; } = "suser_sname()";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string? BankAccountNo { get; set; }

        [StringLength(150)]
        public string? Address { get; set; }

        // Navigation properties
        [ForeignKey("CategoryID")]
        public AccCategory? AccCategory { get; set; }

        [ForeignKey("OrgID")]
        public Organization? Organization { get; set; }
    }
}
