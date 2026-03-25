using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public record GetWebhookEndpointsQuery(Guid UserId) : IRequest<IReadOnlyList<WebhookEndpointDto>>;
