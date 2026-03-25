using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class DeviceRegistrationRequestValidator : AbstractValidator<DeviceRegistrationRequest>
{
    public DeviceRegistrationRequestValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DeviceType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.FirmwareVersion)
            .MaximumLength(50)
            .When(x => x.FirmwareVersion != null);
        RuleFor(x => x.HardwareVersion)
            .MaximumLength(50)
            .When(x => x.HardwareVersion != null);
        RuleFor(x => x.MacAddress)
            .MaximumLength(17) // XX:XX:XX:XX:XX:XX
            .When(x => x.MacAddress != null);
    }
}
