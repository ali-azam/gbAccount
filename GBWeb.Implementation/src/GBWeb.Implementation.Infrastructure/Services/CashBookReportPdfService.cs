using System.Globalization;
using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// Draws the Cash Book in the layout of the legacy report: the
/// organisation name and address centred at the top, then the report
/// title, the Cash In Hand figure and the office, with the date range on
/// the right, then a
/// Voucher No | Account Name | Description | Cash | Bank grid where Cash
/// and Bank each split into Receipt and Payment across a second heading
/// row, bracketed by an Opening Balance line and a Closing Balance line
/// with a Sum of Transaction line between them.
/// </summary>
/// <remarks>
/// Two things keep the seven columns readable, and both are worth not
/// undoing. Every cell — heading and body alike — is inset by the same
/// <see cref="PadX"/>, which is what puts a right-aligned figure exactly
/// under its right-aligned heading; and each line is ruled, because
/// nothing else lets the eye carry an amount back across four money
/// columns to the voucher it belongs to.
///
/// The page size and margins are taken from the legacy PDF rather than
/// estimated, which is why they are odd numbers. Unlike the other reports
/// here, the legacy Cash Book prints thousands separators — see
/// <see cref="FormatAmount"/>.
/// </remarks>
public sealed class CashBookReportPdfService
    : ICashBookReportPdfService
{
    private const int ColumnCount = 7;

    // The widths add up to 534, the content width left by the margins
    // below. The four money columns are deliberately equal — an uneven
    // grid reads as a mistake even when the figures line up inside it —
    // and wide enough for the longest figure the data holds, a negative
    // eight-figure total in parentheses. Narrower and QuestPDF wraps a
    // total onto two lines.
    private const float VoucherWidth = 58f;

    private const float AccountWidth = 106f;

    private const float DescriptionWidth = 106f;

    private const float AmountWidth = 66f;

    /// <summary>
    /// The inset every cell gets, on both sides. Shared by the headings
    /// and the body so the two line up.
    /// </summary>
    private const float PadX = 3f;

    private const float PadY = 2.5f;

    private const float RowFontSize = 7.5f;

    private const float TotalFontSize = 8f;

    private const float HeadingFontSize = 8.5f;

    private const float HairLine = 0.5f;

    private const float Rule = 0.75f;

    private const float StrongRule = 1f;

    // The legacy report's page box, which is A4 wide but shorter than A4
    // — measured off the file rather than assumed, so the two print the
    // same.
    private const float PageWidth = 595f;

    private const float PageHeight = 792f;

    private static readonly string HairColor = Colors.Grey.Lighten1;

    private static readonly string HeadingFill = Colors.Grey.Lighten3;

    public byte[] Generate(CashBookReportDto report)
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
                    .FontSize(RowFontSize)
                    .FontColor(Colors.Black));

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
        CashBookReportDto report)
    {
        container.Column(header =>
        {
            header.Item()
                .AlignCenter()
                .Text(report.CompanyName)
                .FontSize(17)
                .Bold();

            // An organisation row with no OrgAddress simply prints one
            // line where the legacy prints two.
            if (!string.IsNullOrWhiteSpace(report.CompanyAddress))
            {
                header.Item()
                    .AlignCenter()
                    .Text(report.CompanyAddress)
                    .FontSize(7.5f)
                    .FontColor(Colors.Grey.Darken2);
            }

            header.Item()
                .PaddingTop(7)
                .AlignCenter()
                .Text(report.ReportTitle)
                .FontSize(10.5f)
                .Bold();

            // The closing cash balance, printed above the table the way the
            // legacy report prints it.
            header.Item()
                .PaddingTop(1)
                .AlignCenter()
                .Text($"Cash In Hand:   {FormatAmount(report.ClosingCash)}")
                .FontSize(9)
                .Bold();

            header.Item()
                .AlignCenter()
                .Text(report.OfficeName)
                .FontSize(9)
                .FontColor(Colors.Grey.Darken2);

            header.Item()
                .PaddingTop(4)
                .AlignRight()
                .Text(
                    $"Date: From {Day(report.DateFrom)} " +
                    $"To {Day(report.DateTo)}")
                .FontSize(9)
                .Bold();

            // Closes the title block off from the grid below it.
            header.Item()
                .PaddingTop(3)
                .LineHorizontal(HairLine)
                .LineColor(Colors.Grey.Medium);

            header.Item().PaddingBottom(5);
        });
    }

    // ============================================================
    // TABLE
    // ============================================================

    private static void ComposeTable(
        IContainer container,
        CashBookReportDto report)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(VoucherWidth);
                columns.ConstantColumn(AccountWidth);
                columns.ConstantColumn(DescriptionWidth);
                columns.ConstantColumn(AmountWidth);
                columns.ConstantColumn(AmountWidth);
                columns.ConstantColumn(AmountWidth);
                columns.ConstantColumn(AmountWidth);
            });

            ComposeTableHeader(table);

            ComposeBalanceRow(
                table, "Opening Balance",
                report.OpeningCash, report.OpeningBank);

            foreach (var row in report.Rows)
            {
                ComposeDataRow(table, row);
            }

            ComposeSumRow(table, report);

            ComposeClosingRow(
                table, "Closing Balance",
                report.ClosingCash, report.ClosingBank);
        });
    }

    /// <summary>
    /// The column headings, which the legacy report repeats at the top of
    /// every page. Cash and Bank head a pair of columns each, so the first
    /// heading row spans them — underlined across just that pair, so which
    /// two columns each one covers is visible — and the second names
    /// Receipt and Payment under both.
    /// </summary>
    private static void ComposeTableHeader(TableDescriptor table)
    {
        table.Header(header =>
        {
            // The three text columns run the full height of the heading,
            // so they carry the closing rule themselves.
            HeadingCell(header, "Voucher No", rowSpan: 2, closes: true);
            HeadingCell(header, "Account Name", rowSpan: 2, closes: true);
            HeadingCell(header, "Description", rowSpan: 2, closes: true);

            HeadingCell(
                header, "Cash",
                columnSpan: 2, align: Align.Center, underlined: true);

            HeadingCell(
                header, "Bank",
                columnSpan: 2, align: Align.Center, underlined: true,
                groupStart: true);

            HeadingCell(header, "Receipt", align: Align.Right, closes: true);
            HeadingCell(header, "Payment", align: Align.Right, closes: true);

            HeadingCell(
                header, "Receipt",
                align: Align.Right, closes: true, groupStart: true);

            HeadingCell(header, "Payment", align: Align.Right, closes: true);
        });
    }

    private enum Align
    {
        Left,
        Center,
        Right
    }

    /// <summary>
    /// One heading cell.
    /// </summary>
    /// <param name="underlined">
    /// Rules the cell off from the row beneath it in the heading itself —
    /// how Cash and Bank are separated from their Receipt and Payment.
    /// </param>
    /// <param name="closes">
    /// Rules the cell off from the body: the heading's closing line.
    /// </param>
    /// <param name="groupStart">
    /// Rules the cell off from the column to its left, dividing the Cash
    /// columns from the Bank ones.
    /// </param>
    private static void HeadingCell(
        TableCellDescriptor header,
        string caption,
        int rowSpan = 1,
        int columnSpan = 1,
        Align align = Align.Left,
        bool underlined = false,
        bool closes = false,
        bool groupStart = false)
    {
        var cell = header.Cell()
            .RowSpan((uint)rowSpan)
            .ColumnSpan((uint)columnSpan)
            .Background(HeadingFill);

        if (closes)
        {
            cell = cell.BorderBottom(Rule);
        }
        else if (underlined)
        {
            cell = cell.BorderBottom(HairLine);
        }

        if (groupStart)
        {
            cell = cell.BorderLeft(HairLine);
        }

        // One colour per cell: QuestPDF's BorderColor applies to every
        // border set on it, so the heading's rules are all the same ink.
        Aligned(cell.BorderColor(Colors.Grey.Darken1), align)
            .Text(caption)
            .FontSize(HeadingFontSize)
            .Bold();
    }

    /// <summary>
    /// An Opening Balance line. The figure is right-aligned in the Receipt
    /// column of its family rather than centred across the pair: a balance
    /// is not a receipt or a payment, but centring it leaves it straddling
    /// the two columns and under neither heading, which reads as a
    /// mistake. The Receipt column is also where a receipts-and-payments
    /// book carries a balance brought down.
    /// </summary>
    private static void ComposeBalanceRow(
        TableDescriptor table,
        string label,
        decimal cash,
        decimal bank)
    {
        Body(table, columnSpan: 2);

        Body(table)
            .AlignRight()
            .Text(label)
            .FontSize(TotalFontSize)
            .Bold();

        Body(table)
            .AlignRight()
            .Text(FormatAmount(cash))
            .FontSize(TotalFontSize)
            .Bold();

        Body(table);

        Body(table, groupStart: true)
            .AlignRight()
            .Text(FormatAmount(bank))
            .FontSize(TotalFontSize)
            .Bold();

        Body(table);
    }

    private static void ComposeDataRow(
        TableDescriptor table,
        CashBookRowDto row)
    {
        Body(table).Text(row.VoucherNo);
        Body(table).Text(row.AccountName);
        Body(table).Text(row.Description);

        Amount(table, row.CashReceipt);
        Amount(table, row.CashPayment);
        Amount(table, row.BankReceipt, groupStart: true);
        Amount(table, row.BankPayment);
    }

    /// <summary>
    /// The Sum of Transaction line: the four column totals, ruled off from
    /// the entries above them.
    /// </summary>
    private static void ComposeSumRow(
        TableDescriptor table,
        CashBookReportDto report)
    {
        Totalled(table, columnSpan: 2);

        Totalled(table)
            .AlignRight()
            .Text("Sum of Transaction")
            .FontSize(TotalFontSize)
            .Bold();

        TotalAmount(table, report.TotalCashReceipt);
        TotalAmount(table, report.TotalCashPayment);
        TotalAmount(table, report.TotalBankReceipt);
        TotalAmount(table, report.TotalBankPayment);
    }

    /// <summary>
    /// The Closing Balance line, closed off underneath by a double rule
    /// the way a final total is.
    /// </summary>
    private static void ComposeClosingRow(
        TableDescriptor table,
        string label,
        decimal cash,
        decimal bank)
    {
        Closing(table, columnSpan: 2);

        Closing(table)
            .AlignRight()
            .Text(label)
            .FontSize(TotalFontSize)
            .Bold();

        Closing(table)
            .AlignRight()
            .Text(FormatAmount(cash))
            .FontSize(TotalFontSize)
            .Bold();

        Closing(table);

        Closing(table)
            .AlignRight()
            .Text(FormatAmount(bank))
            .FontSize(TotalFontSize)
            .Bold();

        Closing(table);

        // The second line of the double rule.
        table.Cell()
            .ColumnSpan(ColumnCount)
            .PaddingTop(1.5f)
            .BorderBottom(HairLine)
            .BorderColor(Colors.Black);
    }

    // ============================================================
    // CELLS
    // ============================================================

    /// <summary>
    /// A body cell: ruled off underneath, and inset by the same
    /// <see cref="PadX"/> as the heading above it.
    /// </summary>
    private static IContainer Body(
        TableDescriptor table,
        int columnSpan = 1,
        bool groupStart = false)
    {
        var cell = table.Cell()
            .ColumnSpan((uint)columnSpan)
            .BorderBottom(HairLine);

        if (groupStart)
        {
            cell = cell.BorderLeft(HairLine);
        }

        return Inset(cell.BorderColor(HairColor));
    }

    /// <summary>A cell on the Sum of Transaction line.</summary>
    private static IContainer Totalled(
        TableDescriptor table,
        int columnSpan = 1)
    {
        return Inset(table.Cell()
            .ColumnSpan((uint)columnSpan)
            .BorderTop(Rule)
            .BorderColor(Colors.Black)
            .PaddingTop(1.5f));
    }

    /// <summary>A cell on the Closing Balance line.</summary>
    private static IContainer Closing(
        TableDescriptor table,
        int columnSpan = 1)
    {
        return Inset(table.Cell()
            .ColumnSpan((uint)columnSpan)
            .BorderBottom(StrongRule)
            .BorderColor(Colors.Black));
    }

    private static void Amount(
        TableDescriptor table,
        decimal value,
        bool groupStart = false)
    {
        Body(table, groupStart: groupStart)
            .AlignRight()
            .Text(FormatAmount(value))
            .FontSize(RowFontSize);
    }

    private static void TotalAmount(TableDescriptor table, decimal value)
    {
        Totalled(table)
            .AlignRight()
            .Text(FormatAmount(value))
            .FontSize(TotalFontSize)
            .Bold();
    }

    private static IContainer Inset(IContainer cell)
    {
        return cell.PaddingVertical(PadY).PaddingHorizontal(PadX);
    }

    private static IContainer Aligned(IContainer cell, Align align)
    {
        var inset = Inset(cell);

        return align switch
        {
            Align.Right => inset.AlignRight(),
            Align.Center => inset.AlignCenter(),
            _ => inset.AlignLeft()
        };
    }

    // ============================================================
    // FOOTER
    // ============================================================

    private static void ComposeFooter(IContainer container)
    {
        container.Column(footer =>
        {
            footer.Item()
                .LineHorizontal(HairLine)
                .LineColor(Colors.Grey.Medium);

            footer.Item().PaddingTop(4).Row(row =>
            {
                row.RelativeItem()
                    .Text(Day(DateTime.Now))
                    .FontSize(8.5f)
                    .FontColor(Colors.Grey.Darken2);

                row.RelativeItem()
                    .AlignCenter()
                    .Text("Software Generated Report")
                    .FontSize(8.5f)
                    .FontColor(Colors.Grey.Darken2);

                row.RelativeItem()
                    .AlignRight()
                    .Text(text =>
                    {
                        text.DefaultTextStyle(style => style
                            .FontSize(8.5f)
                            .FontColor(Colors.Grey.Darken2));

                        text.Span("Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
            });
        });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /// <summary>
    /// The legacy Cash Book prints two decimals with thousands separators
    /// — "19,677.00" — and wraps a negative balance in parentheses rather
    /// than using a minus sign. It is the only report here that groups
    /// thousands, so this deliberately differs from the others.
    /// </summary>
    private static string FormatAmount(decimal value)
    {
        var text = Math.Abs(value)
            .ToString("#,##0.00", CultureInfo.InvariantCulture);

        return value < 0 ? $"({text})" : text;
    }

    private static string Day(DateTime value)
    {
        return value.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
    }
}
