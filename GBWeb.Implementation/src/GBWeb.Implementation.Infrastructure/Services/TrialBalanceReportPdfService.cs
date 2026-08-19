using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GBWeb.Implementation.Infrastructure.Services;

/// <summary>
/// Draws the trial balance in the layout of the legacy
/// "Account Head-wise Trial Balance" report: three centred header
/// lines, a date range on the right, then a bordered grid of
/// SL No. | Account Code &amp; Name | Opening balance |
/// Debit (Cash, Journal, Total) | Credit (Cash, journal, Total) |
/// Closing balance, with an account head subtotal after each group and
/// a "Total :" line at the end.
/// </summary>
public sealed class TrialBalanceReportPdfService
    : ITrialBalanceReportPdfService
{
    private const int ColumnCount = 10;

    private const float BorderWidth = 0.75f;

    public byte[] Generate(TrialBalanceExportDocument document)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                // The grid needs ten columns, so the legacy report is
                // landscape.
                page.Size(PageSizes.A4.Landscape());
                page.MarginHorizontal(28);
                page.MarginTop(22);
                page.MarginBottom(24);

                page.DefaultTextStyle(text => text
                    .FontFamily(Fonts.Arial)
                    .FontSize(8));

                ComposeHeader(page.Header(), document);
                ComposeTable(page.Content(), document);
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
        TrialBalanceExportDocument document)
    {
        container.Column(header =>
        {
            header.Item()
                .AlignCenter()
                .Text(document.CompanyName)
                .FontSize(14);

            header.Item()
                .AlignCenter()
                .Text(document.StatementTitle)
                .FontSize(11);

            header.Item()
                .AlignCenter()
                .Text(document.ReportTitle)
                .FontSize(11);

            header.Item()
                .PaddingTop(6)
                .AlignRight()
                .Text($"Date:  {DateRange(document)}")
                .FontSize(7);

            // Not part of the legacy header, but the figures come from
            // a single snapshot that is usually earlier than Date To,
            // and printing the range alone would misrepresent them.
            if (document.AsOnDate.HasValue)
            {
                header.Item()
                    .AlignRight()
                    .Text(
                        "Figures as on snapshot " +
                        $"{document.AsOnDate.Value:dd-MMM-yyyy}")
                    .FontSize(7)
                    .Italic();
            }

            header.Item().PaddingBottom(4);
        });
    }

    private static string DateRange(TrialBalanceExportDocument document)
    {
        // Legacy prints the raw picker values, e.g.
        // "26-07-01 12:00:00 AM to 26-08-01 12:00:00 AM".
        const string Pattern = "yy-MM-dd h:mm:ss tt";

        var from = document.DateFrom ?? document.DateTo;

        return $"{from.ToString(Pattern)} to " +
               $"{document.DateTo.ToString(Pattern)}";
    }

    // ============================================================
    // TABLE
    // ============================================================

    private static void ComposeTable(
        IContainer container,
        TrialBalanceExportDocument document)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                // SL No.
                columns.ConstantColumn(34);

                // Account Code & Name
                columns.RelativeColumn(4f);

                // Opening balance
                columns.RelativeColumn(1.4f);

                // Debit: Cash, Journal, Total
                columns.RelativeColumn(1.4f);
                columns.RelativeColumn(1.4f);
                columns.RelativeColumn(1.4f);

                // Credit: Cash, journal, Total
                columns.RelativeColumn(1.4f);
                columns.RelativeColumn(1.4f);
                columns.RelativeColumn(1.4f);

                // Closing balance
                columns.RelativeColumn(1.4f);
            });

            ComposeTableHeader(table);

            foreach (var section in document.Sections)
            {
                if (!string.IsNullOrWhiteSpace(section.Band))
                {
                    table.Cell()
                        .ColumnSpan(ColumnCount)
                        .PaddingTop(3)
                        .PaddingBottom(2)
                        .Text(section.Band)
                        .Bold();
                }

                foreach (var row in section.Rows)
                {
                    ComposeDataRow(table, row);
                }
            }

            ComposeGrandTotalRow(table, document.GrandTotal);
        });
    }

    private static void ComposeTableHeader(TableDescriptor table)
    {
        table.Header(header =>
        {
            // Row 1 — the two group headings span three columns each,
            // everything else spans both header rows.
            HeaderCell(header, "SL\nNo.", rowSpan: 2);
            HeaderCell(header, "Account Code\n& Name", rowSpan: 2);
            HeaderCell(header, "Opening\nbalance", rowSpan: 2);
            HeaderCell(header, "Debit", columnSpan: 3);
            HeaderCell(header, "Credit", columnSpan: 3);
            HeaderCell(header, "Closing\nbalance", rowSpan: 2);

            // Row 2
            HeaderCell(header, "Cash");
            HeaderCell(header, "Journal");
            HeaderCell(header, "Total");
            HeaderCell(header, "Cash");
            HeaderCell(header, "journal");
            HeaderCell(header, "Total");
        });
    }

    private static void HeaderCell(
        TableCellDescriptor header,
        string caption,
        int rowSpan = 1,
        int columnSpan = 1)
    {
        header.Cell()
            .RowSpan((uint)rowSpan)
            .ColumnSpan((uint)columnSpan)
            .Element(Bordered)
            .AlignCenter()
            .AlignMiddle()
            .Text(caption)
            .FontSize(8);
    }

    private static void ComposeDataRow(
        TableDescriptor table,
        TrialBalanceExportRow row)
    {
        Bold(
            table.Cell()
                .Element(Bordered)
                .AlignCenter()
                .Text(row.Serial?.ToString() ?? string.Empty),
            row.IsTotal);

        Bold(
            table.Cell()
                .Element(Bordered)
                .PaddingLeft(row.IsTotal ? 12f : 2f)
                .Text(row.Label),
            row.IsTotal);

        foreach (var amount in Amounts(row))
        {
            Bold(
                table.Cell()
                    .Element(Bordered)
                    .AlignRight()
                    .Text(FormatAmount(amount)),
                row.IsTotal);
        }
    }

    /// <summary>
    /// The closing "Total :" line, which the legacy report prints
    /// outside the grid — no cell borders.
    /// </summary>
    private static void ComposeGrandTotalRow(
        TableDescriptor table,
        TrialBalanceExportRow total)
    {
        table.Cell()
            .PaddingTop(2);

        table.Cell()
            .PaddingTop(2)
            .AlignCenter()
            .Text(total.Label)
            .Bold();

        foreach (var amount in Amounts(total))
        {
            table.Cell()
                .PaddingTop(2)
                .PaddingRight(3)
                .AlignRight()
                .Text(FormatAmount(amount))
                .Bold();
        }
    }

    // ============================================================
    // FOOTER
    // ============================================================

    private static void ComposeFooter(IContainer container)
    {
        container.PaddingTop(6).Row(row =>
        {
            row.RelativeItem()
                .Text($"Print Date: {DateTime.Now:M/d/yyyy}")
                .FontSize(7);

            row.RelativeItem()
                .AlignRight()
                .Text(text =>
                {
                    text.DefaultTextStyle(style => style.FontSize(7));

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

    private static IEnumerable<decimal> Amounts(
        TrialBalanceExportRow row)
    {
        yield return row.OpeningBalance;
        yield return row.DebitCash;
        yield return row.DebitJournal;
        yield return row.DebitTotal;
        yield return row.CreditCash;
        yield return row.CreditJournal;
        yield return row.CreditTotal;
        yield return row.ClosingBalance;
    }

    private static IContainer Bordered(IContainer container)
    {
        return container
            .Border(BorderWidth)
            .BorderColor(Colors.Black)
            .PaddingVertical(2)
            .PaddingHorizontal(3);
    }

    /// <summary>
    /// Applies bold only on subtotal and total lines. Written as a
    /// helper because <c>Bold()</c> takes no condition.
    /// </summary>
    private static void Bold(TextSpanDescriptor text, bool bold)
    {
        if (bold)
        {
            text.Bold();
        }
    }

    /// <summary>
    /// The legacy report prints amounts without thousands separators
    /// and without trailing zeros, and prints an empty column as 0
    /// rather than a dash.
    /// </summary>
    private static string FormatAmount(decimal amount)
    {
        if (amount == 0m)
        {
            return "0";
        }

        return amount == Math.Truncate(amount)
            ? amount.ToString("0")
            : amount.ToString("0.00");
    }
}
