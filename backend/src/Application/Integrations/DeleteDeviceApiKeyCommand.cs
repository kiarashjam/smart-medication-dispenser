using MediatR;

namespace SmartMedicationDispenser.Application.Integrations;

public record DeleteDeviceApiKeyCommand(Guid UserId, Guid DeviceId, Guid ApiKeyId) : IRequest<bool>;
