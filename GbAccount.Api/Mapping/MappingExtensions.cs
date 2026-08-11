using GbAccount.Api.DTOs.AccChart;
using GbAccount.Api.DTOs.Organization;
using GbAccount.Api.Models;

namespace GbAccount.Api.Mapping;


/// <summary>
/// Entity -> DTO projections, kept in one place so the JSON contract the React
/// client depends on is defined once rather than restated in each controller.
/// </summary>
public static class MappingExtensions
{
    public static AccChartDto ToDto(this Models.AccChart entity) => new()
    {
        AccID = entity.AccId,
        AccCode = entity.AccCode,
        AccName = entity.AccName,
        AccLevel = entity.AccLevel,
        FirstLevel = entity.FirstLevel,
        SecondLevel = entity.SecondLevel,
        ThirdLevel = entity.ThirdLevel,
        FourthLevel = entity.FourthLevel,
        FifthLevel = entity.FifthLevel,
        CategoryID = entity.CategoryId,
        OfficeLevel = entity.OfficeLevel,
        IsTransaction = entity.IsTransaction,
        Nature = entity.Nature,
        ModuleID = entity.ModuleId,
        NoteID = entity.NoteId,
        OrgID = entity.OrgId,
        IsActive = entity.IsActive,
        InActiveDate = entity.InActiveDate,
        CreateUser = entity.CreateUser,
        CreateDate = entity.CreateDate,
        BankAccountNo = entity.BankAccountNo,
        Address = entity.Address,
        AccCategory = entity.Category?.ToDto(),
        Organization = entity.Org?.ToSummaryDto(),
    };

    public static AccCategoryDto ToDto(this Models.AccCategory entity) => new()
    {
        CategoryID = entity.CategoryId,
        CategoryName = entity.CategoryName,
        CreateUser = entity.CreateUser,
        CreateDate = entity.CreateDate,
    };

    public static OrganizationSummaryDto ToSummaryDto(this Models.Organization entity) => new()
    {
        OrgID = entity.OrgId,
        OrganizationCode = entity.OrganizationCode,
        OrganizationName = entity.OrganizationName,
        IsActive = entity.IsActive,
    };

    public static OrganizationDto ToDto(this Models.Organization entity) => new()
    {
        OrgID = entity.OrgId,
        OrganizationCode = entity.OrganizationCode,
        OrganizationName = entity.OrganizationName,
        IsActive = entity.IsActive,
        InActiveDate = entity.InActiveDate,
        CreateUser = entity.CreateUser,
        CreateDate = entity.CreateDate,
        OrgAddress = entity.OrgAddress,
        MemberAge = entity.MemberAge,
        LoanAge = entity.LoanAge,
        GuarantorAge = entity.GuarantorAge,
    };

    
    /// <summary>
    /// Copies write-model fields onto an entity. CreateUser and CreateDate are
    /// deliberately not touched — the database owns those via column defaults.
    /// </summary>
    public static void ApplyTo(this SaveAccChartDto dto, Models.AccChart entity)
    {
        entity.AccCode = dto.AccCode;
        entity.AccName = dto.AccName;
        entity.AccLevel = dto.AccLevel;
        entity.FirstLevel = dto.FirstLevel;
        entity.SecondLevel = dto.SecondLevel;
        entity.ThirdLevel = dto.ThirdLevel;
        entity.FourthLevel = dto.FourthLevel;
        entity.FifthLevel = dto.FifthLevel;
        entity.CategoryId = dto.CategoryID;
        entity.OfficeLevel = dto.OfficeLevel;
        entity.IsTransaction = dto.IsTransaction;
        entity.Nature = dto.Nature;
        entity.ModuleId = dto.ModuleID;
        entity.NoteId = dto.NoteID;
        entity.OrgId = dto.OrgID;
        entity.IsActive = dto.IsActive;
        entity.BankAccountNo = dto.BankAccountNo;
        entity.Address = dto.Address;
    }
}
