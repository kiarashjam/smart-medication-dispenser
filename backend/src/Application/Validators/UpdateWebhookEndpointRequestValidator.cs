using FluentValidation;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Validators;

public class UpdateWebhookEndpointRequestValidator : AbstractValidator<UpdateWebhookEndpointRequest>
{
    public UpdateWebhookEndpointRequestValidator()
    {
        RuleFor(x => x.Url)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var u) && (u.Scheme == "https" || u.Scheme == "http"))
            .When(x => x.Url != null)
            .WithMessage("Url must be a valid absolute HTTP/HTTPS URL.");
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => x.Description != null);
    }
}
