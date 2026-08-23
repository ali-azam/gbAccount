using GBWeb.Implementation.Domain.Modules.Account.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public sealed class OlrsTrialBalanceConfiguration
    : IEntityTypeConfiguration<OlrsTrialBalance>
{
    public void Configure(
        EntityTypeBuilder<OlrsTrialBalance> builder)
    {
        // Physical table spells it "Trail", not "Trial".
        builder.ToTable("OLRSTrailBalance", "dbo");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd();

        // ========================================================
        // OFFICE HIERARCHY
        // ========================================================

        builder.Property(x => x.FirstLevel);

        builder.Property(x => x.FirstLevelName)
            .HasMaxLength(120);

        builder.Property(x => x.DepartmentCode)
            .HasMaxLength(120);

        builder.Property(x => x.OfficeName)
            .HasMaxLength(120);

        // ========================================================
        // ACCOUNT
        // ========================================================

        builder.Property(x => x.TopLevelCode)
            .HasMaxLength(120);

        builder.Property(x => x.TopLevelName)
            .HasMaxLength(120);

        builder.Property(x => x.AccCode)
            .HasMaxLength(120);

        builder.Property(x => x.AccName)
            .HasMaxLength(120);

        builder.Property(x => x.AccLevel)
            .HasMaxLength(120);

        // ========================================================
        // AMOUNTS
        //
        // Column names are snake_case in the database, so each one
        // is mapped explicitly.
        // ========================================================

        builder.Property(x => x.CurrentDebit)
            .HasColumnName("cur_debit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.CurrentCredit)
            .HasColumnName("cur_credit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.OpeningDebit)
            .HasColumnName("op_debit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.OpeningCredit)
            .HasColumnName("op_credit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.JournalDebit)
            .HasColumnName("jr_debit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.JournalCredit)
            .HasColumnName("jr_credit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.BalanceDebit)
            .HasColumnName("bal_debit")
            .HasColumnType("decimal(18,2)");

        // Physical column is bal_credithm.
        builder.Property(x => x.BalanceCredit)
            .HasColumnName("bal_credithm")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.PreviousJournalDebit)
            .HasColumnName("previouse_journal_debit")
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.PreviousJournalCredit)
            .HasColumnName("previouse_journal_credit")
            .HasColumnType("decimal(18,2)");

        // ========================================================
        // SNAPSHOT KEY
        // ========================================================

        builder.Property(x => x.ToDate)
            .HasColumnName("to_date")
            .HasColumnType("date");

        builder.Property(x => x.AccountLevel)
            .HasColumnName("acc_level");
    }
}
