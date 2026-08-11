using System.ComponentModel.DataAnnotations;

namespace GbAccount.Api.DTOs.AccChart;


/// Write model for creating or updating a chart-of-accounts row.
///
/// String lengths mirror the column widths in the existing database so a bad
/// payload is rejected with a 400 here rather than surfacing as a truncation
/// error from SQL Server.

public class SaveAccChartDto
{
    [Required(ErrorMessage = "AccCode is required.")]
    [StringLength(50, ErrorMessage = "AccCode cannot exceed 50 characters.")]
    public string AccCode { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "AccName cannot exceed 100 characters.")]
    public string? AccName { get; set; }

    [Range(1, 5, ErrorMessage = "AccLevel must be between 1 and 5.")]
    public int? AccLevel { get; set; }

    [StringLength(50)] public string? FirstLevel { get; set; }
    [StringLength(50)] public string? SecondLevel { get; set; }
    [StringLength(50)] public string? ThirdLevel { get; set; }
    [StringLength(50)] public string? FourthLevel { get; set; }
    [StringLength(50)] public string? FifthLevel { get; set; }

    public int? CategoryID { get; set; }
    public int? OfficeLevel { get; set; }
    public bool? IsTransaction { get; set; }

    [StringLength(2, ErrorMessage = "Nature cannot exceed 2 characters.")]
    public string? Nature { get; set; }

    public int? ModuleID { get; set; }

    
    /// 0 means "no note assigned" in this database — it is not a real note.
    /// See NOTE_UNASSIGNED in src/lib/lookups.ts.
    
    public int? NoteID { get; set; }

    [Required(ErrorMessage = "OrgID is required.")]
    public int OrgID { get; set; }

    public bool? IsActive { get; set; }

    [StringLength(50)] public string? BankAccountNo { get; set; }
    [StringLength(150)] public string? Address { get; set; }
}
