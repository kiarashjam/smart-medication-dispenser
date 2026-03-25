using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record ResumeDeviceCommand(Guid UserId, Guid DeviceId) : IRequest<DeviceDto?>;
