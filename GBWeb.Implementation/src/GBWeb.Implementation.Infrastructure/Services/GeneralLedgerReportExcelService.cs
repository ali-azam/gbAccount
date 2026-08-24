using ClosedXML.Excel;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// The same ledger as
/// <see cref="GeneralLedgerReportPdfService"/>, written to a worksheet:
/// identical header lines, identical columns, identical account grouping.
/// Amounts are written as numbers rather than text so the sheet stays
/// usable for further work.
/// </summary>
public sealed class GeneralLedgerReportExcelService
    : IGeneralLedgerReportExcelService
{
    private const int FirstColumn = 1;

    private const int LastColumn = 6;

    private const int DescriptonColumn = 3;

    private const int DebitColumn = 4;

    private const int BalanceColumn = 6;

    /// <summary>Matches the PDF: two decimals, no thousands separators.</summary>
    private const string AmountFormat = "0.00;(0.00)";

    public byte[] Generate(GeneralLedgerReportDto report)
    {
        using var workbook = new XLWorkbook();

        var sheet = workbook.Worksheets.Add("Subsidiary Ledger");

        var row = WriteTitles(sheet, report);

        row = WriteColumnHeaders(sheet, row);

        var firstDataRow = row;

        foreach (var account in report.Accounts)
        {
            row = WriteAccountHeading(sheet, row, account);
            row = WriteOpeningRow(sheet, row, account);

            foreach (var line in account.Rows)
            {
                sheet.Cell(row, 1).Value = line.TrxDate.Date;
                sheet.Cell(row, 1).Style.DateFormat.Format = "dd-mmm-yyyy";
                sheet.Cell(row, 2).Value = line.VoucherNo;
                sheet.Cell(row, DescriptonColumn).Value = line.Descripton;

                WriteAmounts(
                    sheet, row, line.Debit, line.Credit, line.Balance);

                row++;
            }
        }

        WriteTotalRow(sheet, row + 1, report);

        // Keep the column headings visible while scrolling.
        sheet.SheetView.FreezeRows(firstDataRow - 1);

        sheet.Column(1).Width = 13;
        sheet.Column(2).Width = 14;
        sheet.Column(DescriptonColumn).Width = 42;
        for (var column = DebitColumn; column <= BalanceColumn; column++)
        {
            sheet.Column(column).Width = 16;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return stream.ToArray();
    }

    // ============================================================
    // HEADER LINES
    // ============================================================

    private static int WriteTitles(
        IXLWorksheet sheet,
        GeneralLedgerReportDto report)
    {
        var row = 1;

        row = WriteCentredTitle(
            sheet, row, report.CompanyName, fontSize: 14);

        row = WriteCentredTitle(
            sheet, row, report.OfficeName, fontSize: 11);

        row = WriteCentredTitle(
            sheet, row, report.ReportTitle, fontSize: 11);

        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var range = sheet.Cell(row, FirstColumn);
        range.Value =
            $"Date From {report.DateFrom:dd-MMM-yyyy} " +
            $"To {report.DateTo:dd-MMM-yyyy}";
        range.Style.Font.FontSize = 9;
        range.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Right;

        // Blank spacer row.
        return row + 2;
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

    // ============================================================
    // COLUMN HEADERS
    // ============================================================

    private static int WriteColumnHeaders(IXLWorksheet sheet, int row)
    {
        var captions = new[]
        {
            "Date", "VoucherNo", "Descripton", "Debit", "Credit", "Balance"
        };

        for (var index = 0; index < captions.Length; index++)
        {
            var cell = sheet.Cell(row, FirstColumn + index);

            cell.Value = captions[index];
            cell.Style.Font.Bold = true;
            cell.Style.Alignment.Horizontal =
                FirstColumn + index >= DebitColumn
                    ? XLAlignmentHorizontalValues.Right
                    : XLAlignmentHorizontalValues.Left;
        }

        sheet.Range(row, FirstColumn, row, LastColumn)
            .Style.Border.BottomBorder = XLBorderStyleValues.Thin;

        return row + 1;
    }

    // ============================================================
    // DATA
    // ============================================================

    private static int WriteAccountHeading(
        IXLWorksheet sheet,
        int row,
        GeneralLedgerAccountDto account)
    {
        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var cell = sheet.Cell(row, FirstColumn);
        cell.Value = string.IsNullOrWhiteSpace(account.AccName)
            ? account.AccCode
            : $"{account.AccCode}  {account.AccName}";
        cell.Style.Font.Bold = true;

        return row + 1;
    }

    private static int WriteOpeningRow(
        IXLWorksheet sheet,
        int row,
        GeneralLedgerAccountDto account)
    {
        sheet.Cell(row, DescriptonColumn).Value = "Opening";

        WriteAmounts(
            sheet,
            row,
            account.OpeningDebit,
            account.OpeningCredit,
            account.OpeningBalance);

        return row + 1;
    }

    /// <summary>
    /// The closing Total line, which totals debit and credit only — the
    /// Balance column is left empty as in the legacy report.
    /// </summary>
    private static void WriteTotalRow(
        IXLWorksheet sheet,
        int row,
        GeneralLedgerReportDto report)
    {
        var label = sheet.Cell(row, DescriptonColumn);
        label.Value = "Total";
        label.Style.Font.Bold = true;
        label.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        WriteAmount(sheet, row, DebitColumn, report.TotalDebit);
        WriteAmount(sheet, row, DebitColumn + 1, report.TotalCredit);

        sheet.Range(row, FirstColumn, row, LastColumn)
            .Style.Font.Bold = true;
    }

    private static void WriteAmounts(
        IXLWorksheet sheet,
        int row,
        decimal debit,
        decimal credit,
        decimal balance)
    {
        WriteAmount(sheet, row, DebitColumn, debit);
        WriteAmount(sheet, row, DebitColumn + 1, credit);
        WriteAmount(sheet, row, BalanceColumn, balance);
    }

    private static void WriteAmount(
        IXLWorksheet sheet,
        int row,
        int column,
        decimal value)
    {
        var cell = sheet.Cell(row, column);

        cell.Value = value;
        cell.Style.NumberFormat.Format = AmountFormat;
    }
}
