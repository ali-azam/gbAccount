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
    public static TrialBalanceExportDocument FromAccCode(
        TrialBalanceAccCodeReportDto report,
        string companyName,
        DateTime? dateFrom,
        DateTime dateTo)
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
                        row => row.AccName))
            };

        return new TrialBalanceExportDocument(
            companyName,
            StatementTitle(
                report.Rows.Select(row => row.TopLevelName)),
            ReportTitle,
            dateFrom,
            dateTo,
            report.AsOnDate,
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
    public static TrialBalanceExportDocument FromOffice(
        TrialBalanceOfficeReportDto report,
        string companyName,
        DateTime? dateFrom,
        DateTime dateTo)
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
                    row => row.AccName)))
            .ToList();

        return new TrialBalanceExportDocument(
            companyName,
            StatementTitle(
                report.Rows.Select(row => row.TopLevelName)),
            ReportTitle,
            dateFrom,
            dateTo,
            report.AsOnDate,
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
    private static List<TrialBalanceExportRow> BuildRows<TRow>(
        IReadOnlyList<TRow> rows,
        Func<TRow, string?> headCode,
        Func<TRow, string?> headName,
        Func<TRow, string?> accountCode,
        Func<TRow, string?> accountName)
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
    private static string StatementTitle(
        IEnumerable<string?> headNames)
    {
        var distinct = headNames
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Distinct()
            .Take(2)
            .ToList();

        return distinct.Count == 1
            ? $"{distinct[0]} Statement"
            : "Trial Balance Statement";
    }
}
