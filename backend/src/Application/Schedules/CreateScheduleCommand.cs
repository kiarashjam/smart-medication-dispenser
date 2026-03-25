using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public record CreateScheduleCommand(Guid UserId, Guid ContainerId, CreateScheduleRequest Request) : IRequest<ScheduleDto?>;
