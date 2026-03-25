using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public record GetContainersByDeviceQuery(Guid UserId, Guid DeviceId) : IRequest<IReadOnlyList<ContainerDto>>;
