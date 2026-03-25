using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public record SyncFromCloudCommand(Guid DeviceId, SyncRequest Request) : IRequest<bool>;
