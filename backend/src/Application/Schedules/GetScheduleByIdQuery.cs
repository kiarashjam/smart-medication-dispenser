using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

/// <summary>Get a single schedule by ID.</summary>
public record GetScheduleByIdQuery(Guid UserId, Guid ScheduleId) : IRequest<ScheduleDto?>;
