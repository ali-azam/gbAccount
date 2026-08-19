using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using GBWeb.Implementation.Domain.Common.Exceptions;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Picks the renderer for the requested Report Type and names the file.
/// </summary>
internal static class TrialBalanceExport
{
    private const string PdfContentType = "application/pdf";

    private const string ExcelContentType =
        "application/vnd.openxmlformats-officedocument" +
        ".spreadsheetml.sheet";

    public static TrialBalanceFileDto Render(
        TrialBalanceExportDocument document,
        TrialBalanceExportFormat format,
        string fileNameStem,
        ITrialBalanceReportPdfService pdfService,
        ITrialBalanceReportExcelService excelService)
    {
        // Two different failures used to share one message, which blamed
        // the date even when the date was fine and an Account Code or
        // Office filter was what emptied the report.
        if (document.AsOnDate is null)
        {
            var range = document.DateFrom.HasValue
                ? $"between {document.DateFrom.Value:dd-MMM-yyyy} and " +
                  $"{document.DateTo:dd-MMM-yyyy}"
                : $"on or before {document.DateTo:dd-MMM-yyyy}";

            throw new DomainException(
                $"No trial balance snapshot exists {range}. " +
                "OLRSTrailBalance holds one snapshot per to_date, so " +
                "widen the date range until it covers one.");
        }

        if (document.Sections.Count == 0)
        {
            throw new DomainException(
                $"The {document.AsOnDate.Value:dd-MMM-yyyy} snapshot was " +
                "found, but it holds no rows matching the selected " +
                "Account Code or Office. Clear those filters, or pick a " +
                "code that exists in this snapshot.");
        }

        var stamp = document.AsOnDate.Value.ToString("yyyyMMdd");

        return format == TrialBalanceExportFormat.Excel
            ? new TrialBalanceFileDto(
                excelService.Generate(document),
                ExcelContentType,
                $"{fileNameStem}-{stamp}.xlsx")
            : new TrialBalanceFileDto(
                pdfService.Generate(document),
                PdfContentType,
                $"{fileNameStem}-{stamp}.pdf");
    }
}
