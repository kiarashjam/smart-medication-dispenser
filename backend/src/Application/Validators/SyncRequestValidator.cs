using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class SyncRequestValidator : AbstractValidator<SyncRequest>
{
    public SyncRequestValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
    }
}
