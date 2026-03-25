using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

/// <summary>Process incoming webhook from cloud/hardware. DeviceId is resolved from API key.</summary>
public record ProcessIncomingWebhookCommand(Guid DeviceId, IncomingWebhookPayload Payload) : IRequest<bool>;
