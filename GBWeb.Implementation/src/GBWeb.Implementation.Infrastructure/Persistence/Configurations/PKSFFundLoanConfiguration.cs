using GBWeb.Implementation.Domain.Modules.Account.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GBWeb.Implementation.Infrastructure.Persistence.Configurations;

public class PKSFFundLoanConfiguration : IEntityTypeConfiguration<PKSFFundLoan>
{
    public void Configure(EntityTypeBuilder<PKSFFundLoan> builder)
    {
        builder.ToTable("PKSFFundLoan", "dbo");
        builder.HasKey(x => x.FundLoanID);
        builder.Property(x => x.FundLoanID).ValueGeneratedOnAdd();
    }
}
