using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using GBWeb.Implementation.Domain.Common.Exceptions;

namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Common;

/// <summary>
/// Picks the renderer for the requested Report Type and names the file.
/// </summary>
internal static class GeneralLedgerExport
{
    private const string PdfContentType = "application/pdf";

    private const string ExcelContentType =
        "application/vnd.openxmlformats-officedocument" +
        ".spreadsheetml.sheet";

    public static GeneralLedgerFileDto Render(
        GeneralLedgerReportDto report,
        GeneralLedgerExportFormat format,
        string fileNameStem,
        IGeneralLedgerReportPdfService pdfService,
        IGeneralLedgerReportExcelService excelService)
    {
        // Downloading a file with nothing but headers in it looks like a
        // broken export, so this says which filter came back empty.
        if (report.Accounts.All(account => account.Rows.Count == 0))
        {
            throw new DomainException(
                "No ledger entries were found for " +
                $"{report.OfficeName} between " +
                $"{report.DateFrom:dd-MMM-yyyy} and " +
                $"{report.DateTo:dd-MMM-yyyy}. Widen the date range, or " +
                "check the Office and Account Code selections.");
        }

        var stamp = report.DateTo.ToString("yyyyMMdd");

        return format == GeneralLedgerExportFormat.Excel
            ? new GeneralLedgerFileDto(
                excelService.Generate(report),
                ExcelContentType,
                $"{fileNameStem}-{stamp}.xlsx")
            : new GeneralLedgerFileDto(
                pdfService.Generate(report),
                PdfContentType,
                $"{fileNameStem}-{stamp}.pdf");
    }
}
