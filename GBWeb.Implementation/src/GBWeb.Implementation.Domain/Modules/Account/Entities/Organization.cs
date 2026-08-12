using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("Organization")]
    public class Organization
    {
        [Key]
        [Column("OrgID")]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OrgID { get; set; }

        [StringLength(20)]
        public string? OrganizationCode { get; set; }

        [StringLength(50)]
        public string? OrganizationName { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? InActiveDate { get; set; }

        [Required]
        [StringLength(35)]
        public string CreateUser { get; set; } = "suser_sname()";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        [StringLength(150)]
        public string? OrgAddress { get; set; } = "ABC";

        public byte[]? OrgLOGO { get; set; }

        public int? MemberAge { get; set; }

        public int? LoanAge { get; set; }

        public int? GuarantorAge { get; set; } = 0;

        // Navigation property for related AccChart records
        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<AccChart> AccCharts { get; set; } = new List<AccChart>();
    }
}
