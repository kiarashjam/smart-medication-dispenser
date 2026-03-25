using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record PauseDeviceCommand(Guid UserId, Guid DeviceId) : IRequest<DeviceDto?>;
