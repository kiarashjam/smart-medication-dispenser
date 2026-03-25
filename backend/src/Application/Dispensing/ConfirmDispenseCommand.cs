using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Dispensing;

public record ConfirmDispenseCommand(Guid UserId, Guid DispenseEventId) : IRequest<DispenseEventDto?>;
