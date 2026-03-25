using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Dispensing;

public record DelayDispenseCommand(Guid UserId, Guid DispenseEventId, DelayDispenseRequest Request) : IRequest<DispenseEventDto?>;
