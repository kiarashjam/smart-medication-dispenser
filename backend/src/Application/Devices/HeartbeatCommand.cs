using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record HeartbeatCommand(Guid DeviceId, Guid? UserId) : IRequest<bool>;
