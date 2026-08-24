using ClosedXML.Excel;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// The same cash book as
/// <see cref="CashBookReportPdfService"/>, written to a worksheet:
/// identical header lines, identical columns, identical balance and total
/// lines. Amounts are written as numbers rather than text so the sheet
/// stays usable for further work.
/// </summary>
public sealed class CashBookReportExcelService
    : ICashBookReportExcelService
{
    private const int FirstColumn = 1;

    private const int LastColumn = 7;

    private const int DescriptionColumn = 3;

    private const int CashReceiptColumn = 4;

    private const int CashPaymentColumn = 5;

    private const int BankReceiptColumn = 6;

    private const int BankPaymentColumn = 7;

    /// <summary>
    /// Matches the PDF: two decimals with thousands separators, negatives
    /// in parentheses.
    /// </summary>
    private const string AmountFormat = "#,##0.00;(#,##0.00)";

    public byte[] Generate(CashBookReportDto report)
    {
        using var workbook = new XLWorkbook();

        var sheet = workbook.Worksheets.Add("Cash Book");

        var row = WriteTitles(sheet, report);

        row = WriteColumnHeaders(sheet, row);

        var firstDataRow = row;

        row = WriteBalanceRow(
            sheet,
            row,
            "Opening Balance",
            report.OpeningCash,
            report.OpeningBank);

        foreach (var line in report.Rows)
        {
            sheet.Cell(row, 1).Value = line.VoucherNo;
            sheet.Cell(row, 2).Value = line.AccountName;
            sheet.Cell(row, DescriptionColumn).Value = line.Description;

            WriteAmounts(
                sheet,
                row,
                line.CashReceipt,
                line.CashPayment,
                line.BankReceipt,
                line.BankPayment);

            row++;
        }

        row = WriteSumRow(sheet, row, report);

        WriteBalanceRow(
            sheet,
            row,
            "Closing Balance",
            report.ClosingCash,
            report.ClosingBank);

        // Keep the column headings visible while scrolling.
        sheet.SheetView.FreezeRows(firstDataRow - 1);

        sheet.Column(1).Width = 16;
        sheet.Column(2).Width = 32;
        sheet.Column(DescriptionColumn).Width = 36;
        for (var column = CashReceiptColumn;
             column <= BankPaymentColumn;
             column++)
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
        CashBookReportDto report)
    {
        var row = 1;

        row = WriteCentredTitle(
            sheet, row, report.CompanyName, fontSize: 14);

        if (!string.IsNullOrWhiteSpace(report.CompanyAddress))
        {
            row = WriteCentredTitle(
                sheet, row, report.CompanyAddress, fontSize: 9);
        }

        row = WriteCentredTitle(
            sheet, row, report.ReportTitle, fontSize: 11, bold: true);

        row = WriteCentredTitle(
            sheet,
            row,
            $"Cash In Hand:   {report.ClosingCash:#,##0.00}",
            fontSize: 11,
            bold: true);

        row = WriteCentredTitle(
            sheet, row, report.OfficeName, fontSize: 11);

        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var range = sheet.Cell(row, FirstColumn);
        range.Value =
            $"Date: From {report.DateFrom:dd-MMM-yyyy} " +
            $"To {report.DateTo:dd-MMM-yyyy}";
        range.Style.Font.FontSize = 9;
        range.Style.Font.Bold = true;
        range.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Right;

        // Blank spacer row.
        return row + 2;
    }

    private static int WriteCentredTitle(
        IXLWorksheet sheet,
        int row,
        string text,
        int fontSize,
        bool bold = false)
    {
        sheet.Range(row, FirstColumn, row, LastColumn).Merge();

        var cell = sheet.Cell(row, FirstColumn);
        cell.Value = text;
        cell.Style.Font.FontSize = fontSize;
        cell.Style.Font.Bold = bold;
        cell.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        return row + 1;
    }

    // ============================================================
    // COLUMN HEADERS
    // ============================================================

    /// <summary>
    /// Two heading rows, the way the legacy report heads them: Cash and
    /// Bank merged over their pair of columns, then Receipt and Payment
    /// underneath. The three text columns are merged down both rows.
    /// </summary>
    private static int WriteColumnHeaders(IXLWorksheet sheet, int row)
    {
        var second = row + 1;

        WriteSpannedHeader(sheet, row, second, 1, 1, "Voucher No");
        WriteSpannedHeader(sheet, row, second, 2, 2, "Account Name");
        WriteSpannedHeader(
            sheet, row, second,
            DescriptionColumn, DescriptionColumn, "Description");

        WriteSpannedHeader(
            sheet, row, row,
            CashReceiptColumn, CashPaymentColumn, "Cash",
            XLAlignmentHorizontalValues.Center);

        WriteSpannedHeader(
            sheet, row, row,
            BankReceiptColumn, BankPaymentColumn, "Bank",
            XLAlignmentHorizontalValues.Center);

        var pairs = new[]
        {
            (CashReceiptColumn, "Receipt"),
            (CashPaymentColumn, "Payment"),
            (BankReceiptColumn, "Receipt"),
            (BankPaymentColumn, "Payment")
        };

        foreach (var (column, caption) in pairs)
        {
            var cell = sheet.Cell(second, column);

            cell.Value = caption;
            cell.Style.Font.Bold = true;
            cell.Style.Alignment.Horizontal =
                XLAlignmentHorizontalValues.Right;
        }

        sheet.Range(second, FirstColumn, second, LastColumn)
            .Style.Border.BottomBorder = XLBorderStyleValues.Thin;

        return second + 1;
    }

    private static void WriteSpannedHeader(
        IXLWorksheet sheet,
        int firstRow,
        int lastRow,
        int firstColumn,
        int lastColumn,
        string caption,
        XLAlignmentHorizontalValues alignment =
            XLAlignmentHorizontalValues.Left)
    {
        if (firstRow != lastRow || firstColumn != lastColumn)
        {
            sheet.Range(firstRow, firstColumn, lastRow, lastColumn).Merge();
        }

        var cell = sheet.Cell(firstRow, firstColumn);

        cell.Value = caption;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal = alignment;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    // ============================================================
    // DATA
    // ============================================================

    /// <summary>
    /// An Opening or Closing Balance line. Neither figure is a receipt or a
    /// payment, so each is merged and centred over its pair of columns the
    /// way the legacy report prints it.
    /// </summary>
    private static int WriteBalanceRow(
        IXLWorksheet sheet,
        int row,
        string label,
        decimal cash,
        decimal bank)
    {
        var text = sheet.Cell(row, DescriptionColumn);
        text.Value = label;
        text.Style.Font.Bold = true;
        text.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Right;

        WriteMergedAmount(
            sheet, row, CashReceiptColumn, CashPaymentColumn, cash);

        WriteMergedAmount(
            sheet, row, BankReceiptColumn, BankPaymentColumn, bank);

        return row + 1;
    }

    /// <summary>
    /// The Sum of Transaction line, which unlike the balance lines does
    /// line up under Receipt and Payment.
    /// </summary>
    private static int WriteSumRow(
        IXLWorksheet sheet,
        int row,
        CashBookReportDto report)
    {
        var label = sheet.Cell(row, DescriptionColumn);
        label.Value = "Sum of Transaction";
        label.Style.Font.Bold = true;
        label.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Right;

        WriteAmounts(
            sheet,
            row,
            report.TotalCashReceipt,
            report.TotalCashPayment,
            report.TotalBankReceipt,
            report.TotalBankPayment);

        sheet.Range(row, FirstColumn, row, LastColumn)
            .Style.Font.Bold = true;

        return row + 1;
    }

    private static void WriteAmounts(
        IXLWorksheet sheet,
        int row,
        decimal cashReceipt,
        decimal cashPayment,
        decimal bankReceipt,
        decimal bankPayment)
    {
        WriteAmount(sheet, row, CashReceiptColumn, cashReceipt);
        WriteAmount(sheet, row, CashPaymentColumn, cashPayment);
        WriteAmount(sheet, row, BankReceiptColumn, bankReceipt);
        WriteAmount(sheet, row, BankPaymentColumn, bankPayment);
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

    private static void WriteMergedAmount(
        IXLWorksheet sheet,
        int row,
        int firstColumn,
        int lastColumn,
        decimal value)
    {
        sheet.Range(row, firstColumn, row, lastColumn).Merge();

        var cell = sheet.Cell(row, firstColumn);

        cell.Value = value;
        cell.Style.NumberFormat.Format = AmountFormat;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;
    }
}
