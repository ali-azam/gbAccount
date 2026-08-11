using System;
using System.Collections.Generic;

namespace GbAccount.Api.Models;

public partial class AccChart
{
    public int AccId { get; set; }

    public string AccCode { get; set; } = null!;

    public string? AccName { get; set; }

    public int? AccLevel { get; set; }

    public string? FirstLevel { get; set; }

    public string? SecondLevel { get; set; }

    public string? ThirdLevel { get; set; }

    public string? FourthLevel { get; set; }

    public string? FifthLevel { get; set; }

    public int? CategoryId { get; set; }

    public int? OfficeLevel { get; set; }

    public bool? IsTransaction { get; set; }

    public string? Nature { get; set; }

  
    /// 1=Accounting, 2= Portfolio
    
    public int? ModuleId { get; set; }

    public int? NoteId { get; set; }

    public int OrgId { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? InActiveDate { get; set; }

    public string CreateUser { get; set; } = null!;

    public DateTime CreateDate { get; set; }

    public string? BankAccountNo { get; set; }

    public string? Address { get; set; }

    public virtual AccCategory? Category { get; set; }

    public virtual Organization Org { get; set; } = null!;
}
