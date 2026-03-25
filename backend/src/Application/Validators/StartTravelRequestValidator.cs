using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class StartTravelRequestValidator : AbstractValidator<StartTravelRequest>
{
    public StartTravelRequestValidator()
    {
        RuleFor(x => x.PortableDeviceId).NotEmpty();
        RuleFor(x => x.Days)
            .InclusiveBetween(1, 90)
            .WithMessage("Travel duration must be between 1 and 90 days.");
    }
}
