using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public record CreateContainerCommand(Guid UserId, Guid DeviceId, CreateContainerRequest Request) : IRequest<ContainerDto?>;
