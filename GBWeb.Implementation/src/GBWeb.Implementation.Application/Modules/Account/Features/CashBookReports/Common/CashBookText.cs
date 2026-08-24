namespace GBWeb.Implementation.Application.Modules.Account.Features.CashBookReports.Common;

/// <summary>
/// Builds the three text columns of the Cash Book. None of them can be
/// read straight out of one database column.
/// </summary>
internal static class CashBookText
{
    /// <summary>
    /// Printed when the chart has no name for the account a posting rolls
    /// up to. AccChart stores the same character in its unused level
    /// columns, so the report and the data read alike.
    /// </summary>
    public const string Missing = "-";

    /// <summary>
    /// The Voucher No column, e.g. <c>CAD-756-2026</c>. AccTrxMaster
    /// stores the type and the number separately, and the Cash Book mixes
    /// receipts and payments on one page, so the type is worth keeping.
    /// </summary>
    public static string VoucherNumber(string? voucherType, string? voucherNo)
    {
        var number = (voucherNo ?? string.Empty).Trim();
        var type = VoucherTypeCode(voucherType);

        if (type.Length == 0)
        {
            return number;
        }

        return number.Length == 0 ? type : $"{type}-{number}";
    }

    /// <summary>
    /// The column holds whatever each entry screen wrote, so the same type
    /// arrives as <c>CA</c>, <c>Ca</c> and <c>ca</c>. Two-character codes
    /// are title cased; longer codes such as <c>CAD</c> and <c>BCR</c> are
    /// abbreviations and stay upper case. Cased the way the subsidiary
    /// ledger cases it so the two reports match.
    /// </summary>
    private static string VoucherTypeCode(string? voucherType)
    {
        var value = (voucherType ?? string.Empty).Trim();

        if (value.Length == 0)
        {
            return string.Empty;
        }

        if (value.Length > 2)
        {
            return value.ToUpperInvariant();
        }

        return char.ToUpperInvariant(value[0]) +
               value[1..].ToLowerInvariant();
    }

    /// <summary>
    /// The Account Name column: the name of the account the posting rolls
    /// up to, or <see cref="Missing"/> when the chart has none.
    /// </summary>
    public static string AccountName(string? accName)
    {
        return string.IsNullOrWhiteSpace(accName)
            ? Missing
            : accName.Trim();
    }

    /// <summary>
    /// The Description column: the posting's narration as stored. Blank
    /// when the entry was made without one — the legacy report leaves the
    /// cell empty rather than filling it in.
    /// </summary>
    public static string Description(string? narration)
    {
        var text = (narration ?? string.Empty).Trim();

        // AccTrxDetail stores the literal string "N/A" for lines entered
        // without a narration, which is not something to print.
        return text.Equals("N/A", StringComparison.OrdinalIgnoreCase)
            ? string.Empty
            : text;
    }
}
