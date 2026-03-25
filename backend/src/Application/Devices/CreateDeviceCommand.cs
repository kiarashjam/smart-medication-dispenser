using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record CreateDeviceCommand(Guid UserId, CreateDeviceRequest Request) : IRequest<DeviceDto>;
