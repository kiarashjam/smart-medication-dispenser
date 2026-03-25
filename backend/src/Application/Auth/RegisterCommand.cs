using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public record RegisterCommand(RegisterRequest Request) : IRequest<AuthResponse>;
