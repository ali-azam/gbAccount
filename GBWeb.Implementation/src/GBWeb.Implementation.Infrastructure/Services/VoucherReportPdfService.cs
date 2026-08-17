using GBWeb.Implementation.Application.Common.Interfaces;
using GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GBWeb.Implementation.Infrastructure.Services;

public sealed class VoucherReportPdfService : IVoucherReportPdfService
{
    public byte[] Generate(
        IReadOnlyList<VoucherReportDto> vouchers)
    {
        if (vouchers == null || vouchers.Count == 0)
            throw new InvalidOperationException("No voucher data found.");

        var first = vouchers[0];

        var totalDebit = vouchers.Sum(x => x.Debit ?? 0m);
        var totalCredit = vouchers.Sum(x => x.Credit ?? 0m);

        var totalAmount = totalDebit > 0
            ? totalDebit
            : totalCredit;

        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginLeft(35);
                page.MarginRight(35);
                page.MarginTop(25);
                page.MarginBottom(30);

                // =====================================================
                // HEADER
                // =====================================================

                page.Header()
    .Column(header =>
    {
        header.Spacing(2);

        header.Item()
            .AlignCenter()
            .Text(first.OfficeName ?? "")
            .FontSize(11)
            .Bold();

        header.Item()
            .AlignCenter()
            .Text(GetVoucherTypeName(first.VoucherType))
            .FontSize(10)
            .Bold();

        header.Item()
            .PaddingTop(10)
            .Row(row =>
            {
                row.RelativeItem()
                    .Text($"Voucher No: {first.VoucherNo}");

                row.RelativeItem()
                    .AlignRight()
                    .Text($"Dated: {first.TrxDate:dd-MMM-yyyy}");
            });
    });

                // =====================================================
                // CONTENT
                // =====================================================

                page.Content()
                    .PaddingTop(5)
                    .Column(content =>
                    {
                        content.Item()
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    // SL
                                    columns.ConstantColumn(30);

                                    // Ledger Description
                                    columns.RelativeColumn(5);

                                    // Debit
                                    columns.RelativeColumn(1.5f);

                                    // Credit
                                    columns.RelativeColumn(1.5f);
                                });

                                // ======================================
                                // TABLE HEADER
                                // ======================================

                                table.Header(header =>
                                {
                                    header.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignCenter()
                                        .Text("SL")
                                        .Bold()
                                        .FontSize(9);

                                    header.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .Text("Ledger Description")
                                        .Bold()
                                        .FontSize(9);

                                    header.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignRight()
                                        .Text("Debit")
                                        .Bold()
                                        .FontSize(9);

                                    header.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignRight()
                                        .Text("Credit")
                                        .Bold()
                                        .FontSize(9);
                                });

                                // ======================================
                                // TRANSACTION ROWS
                                // ======================================

                                var serial = 1;

                                foreach (var voucher in vouchers)
                                {
                                    table.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignCenter()
                                        .Text(serial.ToString())
                                        .FontSize(8);

                                    table.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .Column(cell =>
                                        {
                                            // Account code + account name
                                            cell.Item()
                                                .Text(
                                                    $"{voucher.AccCode}, {voucher.AccName}")
                                                .FontSize(8);

                                            // Narration
                                            if (!string.IsNullOrWhiteSpace(
                                                    voucher.Narration))
                                            {
                                                cell.Item()
                                                    .Text(voucher.Narration)
                                                    .FontSize(8);
                                            }
                                        });

                                    table.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignRight()
                                        .Text(
                                            FormatAmount(voucher.Debit))
                                        .FontSize(8);

                                    table.Cell()
                                        .Border(1)
                                        .Padding(4)
                                        .AlignRight()
                                        .Text(
                                            FormatAmount(voucher.Credit))
                                        .FontSize(8);

                                    serial++;
                                }

                                // ======================================
                                // EMPTY SPACE
                                // ======================================

                                // Original voucher has a large empty
                                // table area before the total.
                            });

                        // ==============================================
                        // TOTAL
                        // ==============================================

                        content.Item()
                            .Row(row =>
                            {
                                row.RelativeItem(5);

                                row.RelativeItem(1.5f)
                                    .AlignRight()
                                    .Text(
                                        totalDebit > 0
                                            ? FormatAmount(totalDebit)
                                            : "-")
                                    .Bold()
                                    .FontSize(9);

                                row.RelativeItem(1.5f)
                                    .AlignRight()
                                    .Text(
                                        totalCredit > 0
                                            ? FormatAmount(totalCredit)
                                            : "-")
                                    .Bold()
                                    .FontSize(9);
                            });

                        // ==============================================
                        // AMOUNT IN WORDS
                        // ==============================================

                        content.Item()
                            .PaddingTop(12)
                            .Text(text =>
                            {
                                text.Span("In words: ")
                                    .Bold()
                                    .FontSize(8);

                                text.Span(
                                    $"{NumberToWords(totalAmount)} TAKA ONLY")
                                    .FontSize(8);
                            });
                        // ==============================================
                        // DESCRIPTION
                        // ==============================================

                        content.Item()
                            .PaddingTop(8)
                            .Text(
                                $"Description: {first.VoucherDesc ?? "n/a"}")
                            .FontSize(8);

                        // ==============================================
                        // SIGNATURES
                        // ==============================================

                        content.Item()
                            .PaddingTop(55)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .AlignCenter()
                                    .Column(column =>
                                    {
                                        column.Item()
                                            .Text("____________________")
                                            .AlignCenter();

                                        column.Item()
                                            .PaddingTop(3)
                                            .Text("Prepared by")
                                            .FontSize(8)
                                            .AlignCenter();
                                    });

                                row.RelativeItem()
                                    .AlignCenter()
                                    .Column(column =>
                                    {
                                        column.Item()
                                            .Text("____________________")
                                            .AlignCenter();

                                        column.Item()
                                            .PaddingTop(3)
                                            .Text("Checked by")
                                            .FontSize(8)
                                            .AlignCenter();
                                    });

                                row.RelativeItem()
                                    .AlignCenter()
                                    .Column(column =>
                                    {
                                        column.Item()
                                            .Text("____________________")
                                            .AlignCenter();

                                        column.Item()
                                            .PaddingTop(3)
                                            .Text("Approved by")
                                            .FontSize(8)
                                            .AlignCenter();
                                    });
                            });
                    });

                // =====================================================
                // FOOTER
                // =====================================================

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Page ")
                            .FontSize(8);

                        text.CurrentPageNumber()
                            .FontSize(8);

                        text.Span(" of ")
                            .FontSize(8);

                        text.TotalPages()
                            .FontSize(8);
                    });
            });
        })
        .GeneratePdf();
    }

    private static string FormatAmount(decimal? value)
    {
        var amount = value ?? 0m;

        if (amount == 0)
            return "-";

        return amount.ToString("N2");
    }

    private static string GetVoucherTypeName(string? voucherType)
    {
        return voucherType?.Trim().ToUpperInvariant() switch
        {
            "CA" => "Cash Credit/Receipt Voucher",
            "CAD" => "Cash Debit/Payment Voucher",
            "CAC" => "Cash Credit/Receipt Voucher",
            "BA" => "Bank Transaction Voucher",
            "BDR" => "Bank Debit/Payment Voucher",
            "BCR" => "Bank Credit/Receipt Voucher",
            "BC" => "Bank (Cash) Voucher",
            "JR" => "Journal Voucher",

            _ => "Voucher"
        };
    }

    private static string NumberToWords(decimal amount)
    {
        var whole = (long)Math.Truncate(amount);

        if (whole == 0)
            return "ZERO";

        return ConvertNumber(whole);
    }

    private static string ConvertNumber(long number)
    {
        if (number == 0)
            return "";

        if (number < 100)
            return TwoDigitNumber(number);

        if (number < 1000)
        {
            return $"{TwoDigitNumber(number / 100)} HUNDRED " +
                   $"{ConvertNumber(number % 100)}".Trim();
        }

        if (number < 100000)
        {
            return $"{ConvertNumber(number / 1000)} THOUSAND " +
                   $"{ConvertNumber(number % 1000)}".Trim();
        }

        if (number < 10000000)
        {
            return $"{ConvertNumber(number / 100000)} LAKHS " +
                   $"{ConvertNumber(number % 100000)}".Trim();
        }

        return $"{ConvertNumber(number / 10000000)} CRORE " +
               $"{ConvertNumber(number % 10000000)}".Trim();
    }

    private static string TwoDigitNumber(long number)
    {
        string[] ones =
        {
            "",
            "ONE",
            "TWO",
            "THREE",
            "FOUR",
            "FIVE",
            "SIX",
            "SEVEN",
            "EIGHT",
            "NINE",
            "TEN",
            "ELEVEN",
            "TWELVE",
            "THIRTEEN",
            "FOURTEEN",
            "FIFTEEN",
            "SIXTEEN",
            "SEVENTEEN",
            "EIGHTEEN",
            "NINETEEN"
        };

        string[] tens =
        {
            "",
            "",
            "TWENTY",
            "THIRTY",
            "FORTY",
            "FIFTY",
            "SIXTY",
            "SEVENTY",
            "EIGHTY",
            "NINETY"
        };

        if (number < 20)
            return ones[number];

        var ten = number / 10;
        var one = number % 10;

        return $"{tens[ten]} {ones[one]}".Trim();
    }
}