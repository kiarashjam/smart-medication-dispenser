using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Role).NotEmpty().Must(r => r is "Patient" or "Caregiver").WithMessage("Role must be Patient or Caregiver");
    }
}
