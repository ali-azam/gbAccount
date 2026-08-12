using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("AccCategory")]
    public class AccCategory
    {
        [Key]
        [Column("CategoryID")]
        public int CategoryID { get; set; }

        [StringLength(50)]
        public string? CategoryName { get; set; }

        [Required]
        [StringLength(35)]
        public string CreateUser { get; set; } = "suser_sname()";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        // Navigation property for related AccChart records
        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<AccChart> AccCharts { get; set; } = new List<AccChart>();
    }
}
