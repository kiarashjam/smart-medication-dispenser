using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Dispensing;

public record DispenseCommand(Guid DeviceId, Guid? UserId, DispenseRequest Request) : IRequest<DispenseEventDto?>;
