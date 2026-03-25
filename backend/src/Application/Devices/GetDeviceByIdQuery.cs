using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record GetDeviceByIdQuery(Guid UserId, Guid DeviceId) : IRequest<DeviceDto?>;
