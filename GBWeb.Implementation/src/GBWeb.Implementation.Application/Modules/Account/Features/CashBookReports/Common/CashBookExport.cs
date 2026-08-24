using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;

/// <summary>
/// Picks the renderer for the requested Report Type and names the file.
/// </summary>
internal static class CashBookExport
{
    private const string PdfContentType = "application/pdf";

    private const string ExcelContentType =
        "application/vnd.openxmlformats-officedocument" +
        ".spreadsheetml.sheet";

    public static CashBookFileDto Render(
        CashBookReportDto report,
        CashBookExportFormat format,
        string fileNameStem,
        ICashBookReportPdfService pdfService,
        ICashBookReportExcelService excelService)
    {
        // Unlike the other reports here, an empty cash book is not refused.
        // A day with no cash or bank movement still has an opening and a
        // closing position, and the legacy report prints exactly that.
        var stamp = report.DateTo.ToString("yyyyMMdd");

        return format == CashBookExportFormat.Excel
            ? new CashBookFileDto(
                excelService.Generate(report),
                ExcelContentType,
                $"{fileNameStem}-{stamp}.xlsx")
            : new CashBookFileDto(
                pdfService.Generate(report),
                PdfContentType,
                $"{fileNameStem}-{stamp}.pdf");
    }
}
