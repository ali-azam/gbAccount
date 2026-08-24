using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Common;

/// <summary>
/// Lays out a trial balance report: office blocks, account head
/// subtotals, serial numbers and the grand total, in print order.
///
/// Everything about how the report reads lives here, so the PDF and
/// Excel writers only have to draw what they are handed.
/// </summary>
internal static class TrialBalanceDocumentBuilder
{
    private const string ReportTitle =
        "Account Head-wise Trial Balance";

    private const string GrandTotalLabel = "Total :";

    /// <summary>
    /// Account Code wise: consolidated across offices, so there are no
    /// office blocks — one unbanded section of account head groups.
    /// </summary>
    /// <param name="scopeName">
    /// Office selection to name on the statement line. Only the computed
    /// reports pass one; the snapshot covers a single office and has
    /// nothing to say here.
    /// </param>
    /// <param name="detail">
    /// False prints one line per account head with no member lines and no
    /// "_Total" line, which is the Summary view.
    /// </param>
    /// <param name="fromSnapshot">
    /// True discloses the snapshot date the figures were taken from.
    /// A computed report has no snapshot — its figures cover the printed
    /// date range exactly, so it passes false and the line is dropped.
    /// </param>
    public static TrialBalanceExportDocument FromAccCode(
        TrialBalanceAccCodeReportDto report,
        string companyName,
        DateTime? dateFrom,
        DateTime dateTo,
        string? scopeName = null,
        bool detail = true,
        bool fromSnapshot = true)
    {
        var sections = report.Rows.Count == 0
            ? Array.Empty<TrialBalanceExportSection>()
            : new[]
            {
                new TrialBalanceExportSection(
                    null,
                    BuildRows(
                        report.Rows,
                        row => row.TopLevelCode,
                        row => row.TopLevelName,
                        row => row.AccCode,
                        row => row.AccName,
                        detail))
            };

        return new TrialBalanceExportDocument(
            companyName,
            StatementTitle(
                report.Rows.Select(row => row.TopLevelName),
                scopeName),
            ReportTitle,
            dateFrom,
            dateTo,
            fromSnapshot ? report.AsOnDate : null,
            sections,
            TrialBalanceColumns.ToRow(
                null,
                GrandTotalLabel,
                true,
                report.Totals));
    }

    /// <summary>
    /// Office wise: one block per office, each headed by its office
    /// code and name.
    /// </summary>
    /// <param name="scopeName">
    /// Office selection to name on the statement line. Only the computed
    /// reports pass one; the snapshot covers a single office and has
    /// nothing to say here.
    /// </param>
    /// <param name="detail">
    /// False prints one line per account head with no member lines and no
    /// "_Total" line, which is the Summary view.
    /// </param>
    /// <param name="fromSnapshot">
    /// True discloses the snapshot date the figures were taken from.
    /// A computed report has no snapshot — its figures cover the printed
    /// date range exactly, so it passes false and the line is dropped.
    /// </param>
    public static TrialBalanceExportDocument FromOffice(
        TrialBalanceOfficeReportDto report,
        string companyName,
        DateTime? dateFrom,
        DateTime dateTo,
        string? scopeName = null,
        bool detail = true,
        bool fromSnapshot = true)
    {
        var sections = report.Rows
            .GroupBy(row => new
            {
                Code = row.DepartmentCode,
                Name = row.OfficeName
            })
            .Select(office => new TrialBalanceExportSection(
                $"OfficeCode: {office.Key.Code}, {office.Key.Name}",
                BuildRows(
                    office.ToList(),
                    row => row.TopLevelCode,
                    row => row.TopLevelName,
                    row => row.AccCode,
                    row => row.AccName,
                    detail)))
            .ToList();

        return new TrialBalanceExportDocument(
            companyName,
            StatementTitle(
                report.Rows.Select(row => row.TopLevelName),
                scopeName),
            ReportTitle,
            dateFrom,
            dateTo,
            fromSnapshot ? report.AsOnDate : null,
            sections,
            TrialBalanceColumns.ToRow(
                null,
                GrandTotalLabel,
                true,
                report.Totals));
    }

    /// <summary>
    /// Detail lines grouped by account head, each group closed by a
    /// "_Total" line. Serial numbers restart in every section.
    /// </summary>
    /// <remarks>
    /// In the Summary view the caller has already rolled the figures up
    /// to the account head, so every group holds a single line that is
    /// its own total. Printing a "_Total" under it would repeat the same
    /// numbers on the next row, which is why the subtotals are dropped
    /// rather than the member lines.
    /// </remarks>
    private static List<TrialBalanceExportRow> BuildRows<TRow>(
        IReadOnlyList<TRow> rows,
        Func<TRow, string?> headCode,
        Func<TRow, string?> headName,
        Func<TRow, string?> accountCode,
        Func<TRow, string?> accountName,
        bool detail)
        where TRow : ITrialBalanceAmounts
    {
        var printed = new List<TrialBalanceExportRow>();
        var serial = 1;

        var heads = rows.GroupBy(row => new
        {
            Code = headCode(row),
            Name = headName(row)
        });

        foreach (var head in heads)
        {
            var members = head.ToList();

            foreach (var row in members)
            {
                printed.Add(TrialBalanceColumns.ToRow(
                    serial,
                    Label(accountCode(row), accountName(row)),
                    false,
                    row));

                serial++;
            }

            if (!detail)
            {
                continue;
            }

            printed.Add(TrialBalanceColumns.ToRow(
                null,
                $"{Label(head.Key.Code, head.Key.Name)} _Total",
                true,
                TrialBalanceSnapshot.Total(members)));
        }

        return printed;
    }

    private static string Label(string? code, string? name)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return name ?? string.Empty;
        }

        return string.IsNullOrWhiteSpace(name)
            ? code
            : $"{code}, {name}";
    }

    /// <summary>
    /// Second header line. When the report covers a single account head
    /// it is named — "Cash in Hand Statement" — which is what the
    /// legacy report shows once an account has been picked. A report
    /// spanning several heads falls back to a generic title.
    /// </summary>
    /// <remarks>
    /// A computed report also names the office selection, because the
    /// account code wise layout has no office blocks to show it and a
    /// zone total is indistinguishable from a consolidation otherwise.
    /// </remarks>
    private static string StatementTitle(
        IEnumerable<string?> headNames,
        string? scopeName)
    {
        var distinct = headNames
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Distinct()
            .Take(2)
            .ToList();

        var title = distinct.Count == 1
            ? $"{distinct[0]} Statement"
            : "Trial Balance Statement";

        return string.IsNullOrWhiteSpace(scopeName)
            ? title
            : $"{title} - {scopeName.Trim()}";
    }
}
