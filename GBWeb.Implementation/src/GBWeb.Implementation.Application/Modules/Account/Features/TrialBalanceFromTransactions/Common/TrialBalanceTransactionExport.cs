using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using GBWeb.Implementation.Domain.Common.Exceptions;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;

/// <summary>
/// Picks the renderer for the requested Report Type and names the file,
/// for the trial balances computed from transactions.
/// </summary>
/// <remarks>
/// Separate from the snapshot's export only because of the failure
/// message. A snapshot report fails when OLRSTrailBalance holds no
/// snapshot in range, and telling the user to widen the range is the fix.
/// A computed report cannot fail that way — it fails when no voucher in
/// range matched the office and account filters, and the fix is to change
/// the filters.
/// </remarks>
internal static class TrialBalanceTransactionExport
{
    private const string PdfContentType = "application/pdf";

    private const string ExcelContentType =
        "application/vnd.openxmlformats-officedocument" +
        ".spreadsheetml.sheet";

    public static TrialBalanceFileDto Render(
        TrialBalanceExportDocument document,
        TrialBalanceExportFormat format,
        string fileNameStem,
        string officeName,
        ITrialBalanceReportPdfService pdfService,
        ITrialBalanceReportExcelService excelService)
    {
        if (document.Sections.Count == 0)
        {
            var range = document.DateFrom.HasValue
                ? $"between {document.DateFrom.Value:dd-MMM-yyyy} and " +
                  $"{document.DateTo:dd-MMM-yyyy}"
                : $"on or before {document.DateTo:dd-MMM-yyyy}";

            throw new DomainException(
                $"No vouchers were posted {range} for {officeName} " +
                "matching the selected Account Code and Acc Level. " +
                "Widen the date range, pick a different office, or clear " +
                "the Account Code.");
        }

        // Stamped with Date To: a computed trial balance closes on the
        // last day of the requested range.
        var stamp = document.DateTo.ToString("yyyyMMdd");

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
