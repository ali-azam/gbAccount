using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface IGeneralLedgerReportExcelService
{
    byte[] Generate(GeneralLedgerReportDto report);
}
