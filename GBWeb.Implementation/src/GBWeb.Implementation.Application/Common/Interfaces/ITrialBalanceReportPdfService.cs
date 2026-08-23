using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

namespace GBWeb.Implementation.Application.Common.Interfaces;

public interface ITrialBalanceReportPdfService
{
    byte[] Generate(TrialBalanceExportDocument document);
}
