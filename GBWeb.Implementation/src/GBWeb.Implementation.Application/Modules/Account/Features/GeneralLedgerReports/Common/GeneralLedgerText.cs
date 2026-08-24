namespace GBWeb.Implementation.Application.Modules.Account.Features.GeneralLedgerReports.Common;

/// <summary>
/// Builds the two composite text columns of the legacy subsidiary ledger.
/// Both are stored across more than one column, so neither can be read
/// straight out of the database.
/// </summary>
internal static class GeneralLedgerText
{
    private const string MissingNarration = "N/A";

    /// <summary>
    /// The Voucher No column, e.g. <c>Cr-756-2026</c>.
    /// AccTrxMaster stores the type (<c>Cr</c>) and the number
    /// (<c>756-2026</c>) separately.
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
    /// The legacy report prints one casing per type — Bc, Cr, Dr, Jr —
    /// but the column holds whatever each entry screen wrote, so the same
    /// type arrives as <c>CA</c>, <c>Ca</c> and <c>ca</c>. Two-character
    /// codes are title cased to match the report; longer codes such as
    /// <c>CSH</c> and <c>BNK</c> are abbreviations and stay upper case.
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
    /// The Descripton column, e.g. <c>Bank Deposit-1001</c>: the detail
    /// narration followed by the code of the account the line posted to.
    /// </summary>
    /// <remarks>
    /// The narration is used as stored, including any trailing space —
    /// that is where the legacy report's <c>Bank Deposit -1001</c> rows
    /// come from. AccTrxDetail also stores the literal string
    /// <c>N/A</c> for lines entered without a narration, so a null or
    /// blank narration is rendered the same way.
    /// </remarks>
    public static string Descripton(string? narration, string? accCode)
    {
        var text = string.IsNullOrWhiteSpace(narration)
            ? MissingNarration
            : narration;

        return $"{text}-{accCode}";
    }
}
