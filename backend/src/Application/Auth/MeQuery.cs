using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public record MeQuery(Guid UserId) : IRequest<MeResponse>;
