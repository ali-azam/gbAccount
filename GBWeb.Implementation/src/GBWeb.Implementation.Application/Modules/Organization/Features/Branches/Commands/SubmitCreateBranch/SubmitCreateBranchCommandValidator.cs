using FluentValidation;

namespace GBWeb.Implementation.Application.Modules.Organization.Features.Branches.Commands.SubmitCreateBranch;

public sealed class SubmitCreateBranchCommandValidator : AbstractValidator<SubmitCreateBranchCommand>
{
    public SubmitCreateBranchCommandValidator()
    {
        RuleFor(x => x.BranchCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BranchName).NotEmpty().MaximumLength(200);
    }
}
