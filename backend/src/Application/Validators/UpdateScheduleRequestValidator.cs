using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class UpdateScheduleRequestValidator : AbstractValidator<UpdateScheduleRequest>
{
    public UpdateScheduleRequestValidator()
    {
        RuleFor(x => x.DaysOfWeekBitmask)
            .InclusiveBetween(1, 127)
            .WithMessage("DaysOfWeekBitmask must be between 1 (one day) and 127 (all days).");
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("EndDate must be after StartDate.");
    }
}
