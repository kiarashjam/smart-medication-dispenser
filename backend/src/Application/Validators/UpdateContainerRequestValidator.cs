using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class UpdateContainerRequestValidator : AbstractValidator<UpdateContainerRequest>
{
    public UpdateContainerRequestValidator()
    {
        RuleFor(x => x.MedicationName).NotEmpty().MaximumLength(300);
        RuleFor(x => x.SlotNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PillsPerDose).GreaterThanOrEqualTo(1);
        RuleFor(x => x.LowStockThreshold).GreaterThanOrEqualTo(0);
    }
}
