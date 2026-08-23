using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GBWeb.Implementation.Domain.Modules.Account.Entities
{
    [Table("AccNote", Schema = "dbo")]
    public class AccNote
    {
        [Key]
        [Column("NoteID")]
        public int NoteID { get; set; }

        [Required]
        public int NoteNo { get; set; }

        [StringLength(150)]
        public string? NoteName { get; set; }

        [Required]
        public int OrgID { get; set; } = 1;

        public bool? IsActive { get; set; } = true;

        public DateTime? InActiveDate { get; set; }

        [Required]
        [StringLength(35)]
        public string CreateUser { get; set; } = "system";

        [Required]
        public DateTime CreateDate { get; set; } = DateTime.Now;
    }
}
