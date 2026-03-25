using MediatR;

namespace SmartMedicationDispenser.Application.Schedules;

public record DeleteScheduleCommand(Guid UserId, Guid ScheduleId) : IRequest<bool>;
