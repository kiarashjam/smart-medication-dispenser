using MediatR;

namespace SmartMedicationDispenser.Application.Containers;

public record DeleteContainerCommand(Guid UserId, Guid ContainerId) : IRequest<bool>;
