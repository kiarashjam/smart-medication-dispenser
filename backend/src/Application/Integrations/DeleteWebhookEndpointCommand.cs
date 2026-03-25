using MediatR;

namespace SmartMedicationDispenser.Application.Integrations;

public record DeleteWebhookEndpointCommand(Guid UserId, Guid WebhookId) : IRequest<bool>;
