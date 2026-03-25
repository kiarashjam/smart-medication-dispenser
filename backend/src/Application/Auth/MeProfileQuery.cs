using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public record MeProfileQuery(Guid UserId) : IRequest<MeProfileResponse>;
