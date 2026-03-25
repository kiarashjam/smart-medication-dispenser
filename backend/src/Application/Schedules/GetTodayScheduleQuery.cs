using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public record GetTodayScheduleQuery(Guid UserId, Guid DeviceId, string? TimeZoneId) : IRequest<IReadOnlyList<TodayScheduleItemDto>>;
