using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class DelayDispenseRequestValidator : AbstractValidator<DelayDispenseRequest>
{
    public DelayDispenseRequestValidator()
    {
        RuleFor(x => x.Minutes)
            .InclusiveBetween(5, 120)
            .WithMessage("Delay must be between 5 and 120 minutes.");
    }
}
