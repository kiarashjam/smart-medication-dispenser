using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public record GetSchedulesByContainerQuery(Guid UserId, Guid ContainerId) : IRequest<IReadOnlyList<ScheduleDto>>;
