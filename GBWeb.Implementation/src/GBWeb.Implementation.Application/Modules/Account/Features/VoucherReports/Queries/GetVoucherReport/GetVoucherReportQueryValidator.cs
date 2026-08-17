using FluentValidation;

namespace GBWeb.Implementation.Application.Modules.Account.Features.VoucherReports.Queries.GetVoucherReport;

public sealed class GetVoucherReportQueryValidator
    : AbstractValidator<GetVoucherReportQuery>
{
    public GetVoucherReportQueryValidator()
    {
        RuleFor(x => x.DateFrom)
            .NotEmpty()
            .WithMessage("Date From is required.");

        RuleFor(x => x.DateTo)
            .NotEmpty()
            .WithMessage("Date To is required.");

        RuleFor(x => x)
            .Must(x => x.DateTo >= x.DateFrom)
            .WithMessage("Date To must be greater than or equal to Date From.");

        RuleFor(x => x.VoucherType)
            .MaximumLength(3)
            .When(x => !string.IsNullOrWhiteSpace(x.VoucherType))
            .WithMessage("Voucher Type cannot exceed 3 characters.");

        RuleFor(x => x.VoucherNo)
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.VoucherNo))
            .WithMessage("Voucher No cannot exceed 50 characters.");
    }
}