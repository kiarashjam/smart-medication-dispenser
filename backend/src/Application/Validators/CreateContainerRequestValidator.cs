using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class CreateContainerRequestValidator : AbstractValidator<CreateContainerRequest>
{
    public CreateContainerRequestValidator()
    {
        RuleFor(x => x.SlotNumber).GreaterThan(0);
        RuleFor(x => x.MedicationName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PillsPerDose).GreaterThan(0);
        RuleFor(x => x.LowStockThreshold).GreaterThanOrEqualTo(0);
    }
}
