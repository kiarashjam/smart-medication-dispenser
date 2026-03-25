using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class CreateWebhookEndpointRequestValidator : AbstractValidator<CreateWebhookEndpointRequest>
{
    public CreateWebhookEndpointRequestValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty()
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var u) && (u.Scheme == "https" || u.Scheme == "http"))
            .WithMessage("Url must be a valid absolute HTTP/HTTPS URL.");
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => x.Description != null);
    }
}
