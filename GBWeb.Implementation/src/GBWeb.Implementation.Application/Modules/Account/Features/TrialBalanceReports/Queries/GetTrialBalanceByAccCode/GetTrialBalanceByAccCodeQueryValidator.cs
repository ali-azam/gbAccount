using FluentValidation;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByAccCode;

public sealed class GetTrialBalanceByAccCodeQueryValidator
    : AbstractValidator<GetTrialBalanceByAccCodeQuery>
{
    public GetTrialBalanceByAccCodeQueryValidator()
    {
        RuleFor(x => x.DateTo)
            .NotEmpty()
            .WithMessage("Date To is required.");

        RuleFor(x => x)
            .Must(x =>
                !x.DateFrom.HasValue ||
                x.DateTo >= x.DateFrom.Value)
            .WithMessage(
                "Date To must be greater than or equal to Date From.");

        RuleFor(x => x.AccLevel)
            .InclusiveBetween(1, 5)
            .When(x => x.AccLevel.HasValue)
            .WithMessage("Acc Level must be between 1 and 5.");

        RuleFor(x => x.AccCode)
            .MaximumLength(120)
            .When(x => !string.IsNullOrWhiteSpace(x.AccCode))
            .WithMessage("Account Code cannot exceed 120 characters.");
    }
}
