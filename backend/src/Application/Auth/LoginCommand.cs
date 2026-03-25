using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public record LoginCommand(LoginRequest Request) : IRequest<AuthResponse>;
