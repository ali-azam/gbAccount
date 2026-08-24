using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface ICashBookReportExcelService
{
    byte[] Generate(CashBookReportDto report);
}
