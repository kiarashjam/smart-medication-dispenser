using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public record UpdateContainerCommand(Guid UserId, Guid ContainerId, UpdateContainerRequest Request) : IRequest<ContainerDto?>;
