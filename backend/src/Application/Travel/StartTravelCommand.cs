using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Travel;

public record StartTravelCommand(Guid UserId, StartTravelRequest Request) : IRequest<TravelSessionDto?>;
