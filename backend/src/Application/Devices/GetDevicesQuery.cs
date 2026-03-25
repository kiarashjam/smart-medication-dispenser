using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public record GetDevicesQuery(Guid UserId) : IRequest<IReadOnlyList<DeviceDto>>;
