using FluentValidation;
using GBWeb.Implementation.Application.Common.Reports;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalanceByOffice;

public sealed class GetComputedTrialBalanceByOfficeQueryValidator
    : AbstractValidator<GetComputedTrialBalanceByOfficeQuery>
{
    public GetComputedTrialBalanceByOfficeQueryValidator()
    {
        RuleFor(x => x.DateFrom)
            .NotEmpty()
            .WithMessage("Date From is required.");

        RuleFor(x => x.DateTo)
            .NotEmpty()
            .WithMessage("Date To is required.");

        RuleFor(x => x)
            .Must(x => x.DateTo >= x.DateFrom)
            .WithMessage(
                "Date To must be greater than or equal to Date From.");

        RuleFor(x => x.OfficeId)
            .GreaterThan(0)
            .When(x => x.OfficeId.HasValue)
            .WithMessage("Office is not valid.");

        RuleFor(x => x.AccLevel)
            .InclusiveBetween(
                ReportAccountFilter.MinLevel,
                ReportAccountFilter.MaxLevel)
            .When(x => x.AccLevel.HasValue)
            .WithMessage("Acc Level must be between 1 and 5.");

        RuleFor(x => x.AccCode)
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.AccCode))
            .WithMessage("Account Code cannot exceed 50 characters.");

        RuleFor(x => x.DetailLevel)
            .IsInEnum()
            .WithMessage("Report View must be Detail or Summary.");
    }
}
