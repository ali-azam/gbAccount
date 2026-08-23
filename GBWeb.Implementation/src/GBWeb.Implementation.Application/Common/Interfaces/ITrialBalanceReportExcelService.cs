using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface ITrialBalanceReportExcelService
{
    byte[] Generate(TrialBalanceExportDocument document);
}
