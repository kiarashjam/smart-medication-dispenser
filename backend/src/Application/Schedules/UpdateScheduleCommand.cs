using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public record UpdateScheduleCommand(Guid UserId, Guid ScheduleId, UpdateScheduleRequest Request) : IRequest<ScheduleDto?>;
