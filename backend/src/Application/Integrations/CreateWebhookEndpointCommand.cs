using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public record CreateWebhookEndpointCommand(Guid UserId, CreateWebhookEndpointRequest Request) : IRequest<WebhookEndpointDto?>;
