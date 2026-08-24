namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Common;

/// <summary>
/// Splits voucher types into the journal and cash columns the trial
/// balance prints.
/// </summary>
/// <remarks>
/// The printed report carries Debit Cash / Debit Journal and Credit
/// Cash / Credit Journal pairs, so every posting has to land on one side
/// or the other. Journal vouchers are the adjusting entries — the codes
/// the voucher screens label "Journal Voucher" — and everything else
/// (cash, bank, debit and credit vouchers) is cash.
///
/// Matching is case insensitive because the data holds "Jr" while the
/// screens use "JR".
/// </remarks>
internal static class TrialBalanceVoucherKind
{
    private static readonly HashSet<string> JournalTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "JR",
            "JRN"
        };

    public static bool IsJournal(string? voucherType)
    {
        return !string.IsNullOrWhiteSpace(voucherType) &&
               JournalTypes.Contains(voucherType.Trim());
    }
}
