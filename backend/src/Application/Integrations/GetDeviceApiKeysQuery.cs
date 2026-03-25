using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public record GetDeviceApiKeysQuery(Guid UserId, Guid DeviceId) : IRequest<IReadOnlyList<DeviceApiKeyDto>>;
