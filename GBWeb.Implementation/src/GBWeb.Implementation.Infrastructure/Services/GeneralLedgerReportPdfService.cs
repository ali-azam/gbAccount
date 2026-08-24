using System.Globalization;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// Draws the ledger in the layout of the legacy "Subsidiary Ledger"
/// report: organisation, office and title centred at the top with the
/// date range on the right, then a
/// Date | VoucherNo | Descripton | Debit | Credit | Balance grid that
/// repeats its column headings on every page, an account heading and
/// opening line per account, and a closing Total line that prints the
/// debit and credit columns only.
/// </summary>
/// <remarks>
/// The page size, margins, column positions and font sizes are taken
/// from the legacy PDF rather than estimated, which is why they are odd
/// numbers.
/// </remarks>
public sealed class GeneralLedgerReportPdfService
    : IGeneralLedgerReportPdfService
{
    private const int ColumnCount = 6;

    // Column widths measured off the legacy report. They add up to 534,
    // the content width left by the margins below.
    private const float DateWidth = 54f;

    private const float VoucherWidth = 58f;

    private const float DescriptonWidth = 205f;

    private const float DebitWidth = 70f;

    private const float CreditWidth = 72f;

    private const float BalanceWidth = 75f;

    private const float RowFontSize = 7f;

    private const float AmountPadding = 3f;

    // The legacy report's page box, which is A4 wide but shorter than A4
    // — measured off the file rather than assumed, so the two print the
    // same.
    private const float PageWidth = 595f;

    private const float PageHeight = 792f;

    public byte[] Generate(GeneralLedgerReportDto report)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageWidth, PageHeight, Unit.Point);
                page.MarginLeft(38);
                page.MarginRight(23);
                page.MarginTop(20);
                page.MarginBottom(18);

                page.DefaultTextStyle(text => text
                    .FontFamily(Fonts.Arial)
                    .FontSize(RowFontSize));

                ComposeHeader(page.Header(), report);
                ComposeTable(page.Content(), report);
                ComposeFooter(page.Footer());
            });
        })
        .GeneratePdf();
    }

    // ============================================================
    // HEADER
    // ============================================================

    private static void ComposeHeader(
        IContainer container,
        GeneralLedgerReportDto report)
    {
        container.Column(header =>
        {
            header.Item()
                .AlignCenter()
                .Text(report.CompanyName)
                .FontSize(18);

            header.Item()
                .AlignCenter()
                .Text(report.OfficeName)
                .FontSize(9);

            header.Item()
                .AlignCenter()
                .Text(report.ReportTitle)
                .FontSize(9.5f);

            header.Item()
                .PaddingTop(2)
                .AlignRight()
                .Text(
                    $"Date From {Day(report.DateFrom)} " +
                    $"To {Day(report.DateTo)}")
                .FontSize(9);

            header.Item().PaddingBottom(4);
        });
    }

    // ============================================================
    // TABLE
    // ============================================================

    private static void ComposeTable(
        IContainer container,
        GeneralLedgerReportDto report)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(DateWidth);
                columns.ConstantColumn(VoucherWidth);
                columns.ConstantColumn(DescriptonWidth);
                columns.ConstantColumn(DebitWidth);
                columns.ConstantColumn(CreditWidth);
                columns.ConstantColumn(BalanceWidth);
            });

            ComposeTableHeader(table);

            foreach (var account in report.Accounts)
            {
                ComposeAccountHeading(table, account);
                ComposeOpeningRow(table, account);

                foreach (var row in account.Rows)
                {
                    ComposeDataRow(table, row);
                }
            }

            ComposeTotalRow(table, report);
        });
    }

    /// <summary>
    /// The column headings, which the legacy report repeats at the top of
    /// every page. "Descripton" is spelled the way the legacy report
    /// spells it.
    /// </summary>
    private static void ComposeTableHeader(TableDescriptor table)
    {
        table.Header(header =>
        {
            HeaderCell(header, "Date");
            HeaderCell(header, "VoucherNo");
            HeaderCell(header, "Descripton");
            HeaderCell(header, "Debit", alignRight: true);
            HeaderCell(header, "Credit", alignRight: true);
            HeaderCell(header, "Balance", alignRight: true);

            header.Cell()
                .ColumnSpan(ColumnCount)
                .PaddingTop(1)
                .BorderBottom(0.75f)
                .BorderColor(Colors.Black);
        });
    }

    private static void HeaderCell(
        TableCellDescriptor header,
        string caption,
        bool alignRight = false)
    {
        var cell = header.Cell();

        var content = alignRight
            ? cell.PaddingRight(AmountPadding).AlignRight()
            : cell.AlignLeft();

        content.Text(caption).FontSize(9.5f);
    }

    /// <summary>
    /// The account the following rows belong to, printed across the date
    /// and voucher columns the way the legacy report prints
    /// "1000  Cash in Hand".
    /// </summary>
    private static void ComposeAccountHeading(
        TableDescriptor table,
        GeneralLedgerAccountDto account)
    {
        var heading = string.IsNullOrWhiteSpace(account.AccName)
            ? account.AccCode
            : $"{account.AccCode}  {account.AccName}";

        table.Cell()
            .ColumnSpan(ColumnCount)
            .PaddingTop(6)
            .Text(heading)
            .FontSize(10.5f);
    }

    /// <summary>
    /// The opening line: the label sits in the Descripton column and the
    /// three figures line up under Debit, Credit and Balance.
    /// </summary>
    private static void ComposeOpeningRow(
        TableDescriptor table,
        GeneralLedgerAccountDto account)
    {
        table.Cell();
        table.Cell();

        table.Cell()
            .PaddingTop(2)
            .Text("Opening")
            .FontSize(9.5f);

        Amount(table, account.OpeningDebit, fontSize: 9f);
        Amount(table, account.OpeningCredit, fontSize: 9f);
        Amount(table, account.OpeningBalance, fontSize: 9f);
    }

    private static void ComposeDataRow(
        TableDescriptor table,
        GeneralLedgerRowDto row)
    {
        table.Cell()
            .PaddingTop(1)
            .Text(Day(row.TrxDate));

        table.Cell()
            .PaddingTop(1)
            .Text(row.VoucherNo);

        table.Cell()
            .PaddingTop(1)
            .Text(row.Descripton);

        Amount(table, row.Debit, RowFontSize);
        Amount(table, row.Credit, RowFontSize);
        Amount(table, row.Balance, RowFontSize);
    }

    /// <summary>
    /// The closing Total line. The legacy report totals the debit and
    /// credit columns and leaves Balance empty — a sum of running
    /// balances would not mean anything.
    /// </summary>
    private static void ComposeTotalRow(
        TableDescriptor table,
        GeneralLedgerReportDto report)
    {
        table.Cell()
            .ColumnSpan(2)
            .PaddingTop(6);

        table.Cell()
            .PaddingTop(6)
            .AlignCenter()
            .Text("Total")
            .FontSize(9);

        Amount(table, report.TotalDebit, fontSize: 8f, paddingTop: 6f);
        Amount(table, report.TotalCredit, fontSize: 8f, paddingTop: 6f);

        table.Cell().PaddingTop(6);
    }

    // ============================================================
    // FOOTER
    // ============================================================

    private static void ComposeFooter(IContainer container)
    {
        container.PaddingTop(6).Row(row =>
        {
            row.RelativeItem()
                .Text($"Printed On: {PrintedOn(DateTime.Now)}")
                .FontSize(9);

            row.RelativeItem()
                .AlignCenter()
                .Text("Software Generated Report")
                .FontSize(9);

            row.RelativeItem()
                .AlignRight()
                .Text(text =>
                {
                    text.DefaultTextStyle(style => style.FontSize(9));

                    text.Span("Page ");
                    text.CurrentPageNumber();
                    text.Span(" of ");
                    text.TotalPages();
                });
        });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private static void Amount(
        TableDescriptor table,
        decimal value,
        float fontSize,
        float paddingTop = 1f)
    {
        table.Cell()
            .PaddingTop(paddingTop)
            .PaddingRight(AmountPadding)
            .AlignRight()
            .Text(FormatAmount(value))
            .FontSize(fontSize);
    }

    /// <summary>
    /// The legacy report prints two decimals with no thousands
    /// separators, and wraps a negative balance in parentheses rather
    /// than using a minus sign.
    /// </summary>
    private static string FormatAmount(decimal value)
    {
        var text = Math.Abs(value)
            .ToString("0.00", CultureInfo.InvariantCulture);

        return value < 0 ? $"({text})" : text;
    }

    private static string Day(DateTime value)
    {
        return value.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Legacy prints e.g. "20-Aug-2026  3:49 pm", with a lower case
    /// meridiem that no standard format string produces.
    /// </summary>
    private static string PrintedOn(DateTime value)
    {
        var stamp = value.ToString(
            "dd-MMM-yyyy  h:mm tt", CultureInfo.InvariantCulture);

        return stamp.Replace("AM", "am").Replace("PM", "pm");
    }
}
