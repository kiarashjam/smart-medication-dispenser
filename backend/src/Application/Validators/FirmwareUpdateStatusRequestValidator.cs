using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class FirmwareUpdateStatusRequestValidator : AbstractValidator<FirmwareUpdateStatusRequest>
{
    private static readonly string[] ValidStatuses = { "downloading", "verifying", "installing", "completed", "failed" };

    public FirmwareUpdateStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be one of: downloading, verifying, installing, completed, failed.");
        RuleFor(x => x.Version).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Progress)
            .InclusiveBetween(0, 100)
            .When(x => x.Progress.HasValue);
    }
}
