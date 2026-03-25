using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Travel;

public record EndTravelCommand(Guid UserId) : IRequest<TravelSessionDto?>;
