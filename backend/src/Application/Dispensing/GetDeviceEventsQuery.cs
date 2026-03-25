using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Dispensing;

public record GetDeviceEventsQuery(Guid UserId, Guid DeviceId, DateTime? FromUtc, DateTime? ToUtc, int Limit) : IRequest<IReadOnlyList<DispenseEventDto>>;
