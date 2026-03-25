using MediatR;

namespace SmartMedicationDispenser.Application.Integrations;

public record CreateDeviceApiKeyCommand(Guid UserId, Guid DeviceId, string? Name) : IRequest<CreateDeviceApiKeyResult?>;

public record CreateDeviceApiKeyResult(Guid ApiKeyId, string PlainKey);
