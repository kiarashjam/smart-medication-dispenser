using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

/// <summary>Get a single container by ID.</summary>
public record GetContainerByIdQuery(Guid UserId, Guid ContainerId) : IRequest<ContainerDto?>;
