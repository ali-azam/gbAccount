using ClosedXML.Excel;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// The same report as
/// <see cref="TrialBalanceReportPdfService"/>, written to a worksheet:
/// identical header lines, identical column layout, identical grouping.
/// Amounts are written as numbers rather than text so the sheet stays
/// usable for further work.
/// </summary>
public sealed class TrialBalanceReportExcelService
    : ITrialBalanceReportExcelService
{
    private const int FirstColumn = 1;

    private const int LastColumn = 10;

    private const int AccountColumn = 2;

    private const int FirstAmountColumn = 3;

    /// <summary>
    /// Matches the PDF: no thousands separators, no trailing zeros.
    /// </summary>
    private const string AmountFormat = "0.##";

    public byte[] Generate(TrialBalanceExportDocument document)
    {
        using var workbook = new XLWorkbook();

        var sheet = workbook.Worksheets.Add("Trial Balance");

        var row = WriteTitles(sheet, document);

        row = WriteColumnHeaders(sheet, row);

        var firstDataRow = row;

        foreach (var section in document.Sections)
        {
            if (!string.IsNullOrWhiteSpace(section.Band))
            {
                sheet.Range(row, FirstColumn, row, LastColumn).Merge();

                var band = sheet.Cell(row, FirstColumn);
                band.Value = section.Band;
                band.Style.Font.Bold = true;

                row++;
            }

            foreach (var line in section.Rows)
            {
                WriteRow(sheet, row, line, bordered: true);
                row++;
            }
        }

        // The grand total sits outside the grid, as in the PDF.
        row++;
        WriteRow(sheet, row, document.GrandTotal, bordered: false);
        sheet.Cell(row, AccountColumn)
            .Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        // Keep the column headings visible while scrolling.
        sheet.SheetView.FreezeRows(firstDataRow - 1);

        sheet.Column(AccountColumn).Width = 42;
        for (var column = FirstAmountColumn;
             column <= LastColumn;
             column++)
        {
            sheet.Column(column).Width = 16;
        }
        sheet.Column(FirstColumn).Width = 6;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return stream.ToArray();
    }

    // ============================================================
    // HEADER LINES
    // ============================================================

    private static int WriteTitles(
        IXLWorksheet sheet,
        TrialBalanceExportDocument document)
    {
        var row = 1;

        row = WriteCentredTitle(
            sheet, row, document.CompanyName, fontSize: 14);

        row = WriteCentredTitle(
            sheet, row, document.StatementTitle, fontSize: 11);

        row = WriteCentredTitle(
            sheet, row, document.ReportTitle, fontSize: 11);

        row = WriteRightAlignedNote(
            sheet, row, $"Date:  {DateRange(document)}");

        if (document.AsOnDate.HasValue)
        {
            row = WriteRightAlignedNote(
                sheet,
                row,
                "Figures as on snapshot " +
                $"{document.AsOnDate.Value:dd-MMM-yyyy}",
                italic: true);
        }

        // Blank spacer row.
        return row + 1;
    }

    private static int WriteCentredTitle(
        IXLWorksheet sheet,
        int row,
        string text,
        int fontSize)
    {
        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var cell = sheet.Cell(row, FirstColumn);
        cell.Value = text;
        cell.Style.Font.FontSize = fontSize;
        cell.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        return row + 1;
    }

    private static int WriteRightAlignedNote(
        IXLWorksheet sheet,
        int row,
        string text,
        bool italic = false)
    {
        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var cell = sheet.Cell(row, FirstColumn);
        cell.Value = text;
        cell.Style.Font.FontSize = 8;
        cell.Style.Font.Italic = italic;
        cell.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Right;

        return row + 1;
    }

    private static string DateRange(
        TrialBalanceExportDocument document)
    {
        const string Pattern = "yy-MM-dd h:mm:ss tt";

        var from = document.DateFrom ?? document.DateTo;

        return $"{from.ToString(Pattern)} to " +
               $"{document.DateTo.ToString(Pattern)}";
    }

    // ============================================================
    // COLUMN HEADERS
    // ============================================================

    private static int WriteColumnHeaders(
        IXLWorksheet sheet,
        int row)
    {
        var second = row + 1;

        // Columns that span both header rows.
        MergeAndCaption(sheet, row, second, 1, 1, "SL No.");
        MergeAndCaption(
            sheet, row, second, 2, 2, "Account Code & Name");
        MergeAndCaption(sheet, row, second, 3, 3, "Opening balance");
        MergeAndCaption(sheet, row, second, 10, 10, "Closing balance");

        // Group headings across their three sub columns.
        MergeAndCaption(sheet, row, row, 4, 6, "Debit");
        MergeAndCaption(sheet, row, row, 7, 9, "Credit");

        var subHeadings = new[]
        {
            "Cash", "Journal", "Total", "Cash", "journal", "Total"
        };

        for (var index = 0; index < subHeadings.Length; index++)
        {
            Caption(sheet.Cell(second, 4 + index), subHeadings[index]);
        }

        Border(sheet.Range(row, FirstColumn, second, LastColumn));

        return second + 1;
    }

    private static void MergeAndCaption(
        IXLWorksheet sheet,
        int firstRow,
        int lastRow,
        int firstColumn,
        int lastColumn,
        string caption)
    {
        sheet.Range(firstRow, firstColumn, lastRow, lastColumn)
            .Merge();

        Caption(sheet.Cell(firstRow, firstColumn), caption);
    }

    private static void Caption(IXLCell cell, string caption)
    {
        cell.Value = caption;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;
        cell.Style.Alignment.Vertical =
            XLAlignmentVerticalValues.Center;
        cell.Style.Alignment.WrapText = true;
    }

    // ============================================================
    // DATA
    // ============================================================

    private static void WriteRow(
        IXLWorksheet sheet,
        int row,
        TrialBalanceExportRow line,
        bool bordered)
    {
        var serial = sheet.Cell(row, FirstColumn);

        if (line.Serial.HasValue)
        {
            serial.Value = line.Serial.Value;
        }

        serial.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        sheet.Cell(row, AccountColumn).Value = line.Label;

        var amounts = new[]
        {
            line.OpeningBalance,
            line.DebitCash,
            line.DebitJournal,
            line.DebitTotal,
            line.CreditCash,
            line.CreditJournal,
            line.CreditTotal,
            line.ClosingBalance
        };

        for (var index = 0; index < amounts.Length; index++)
        {
            var cell = sheet.Cell(row, FirstAmountColumn + index);

            cell.Value = amounts[index];
            cell.Style.NumberFormat.Format = AmountFormat;
        }

        var full = sheet.Range(row, FirstColumn, row, LastColumn);

        if (line.IsTotal)
        {
            full.Style.Font.Bold = true;
        }

        if (bordered)
        {
            Border(full);
        }
    }

    private static void Border(IXLRange range)
    {
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
    }
}
