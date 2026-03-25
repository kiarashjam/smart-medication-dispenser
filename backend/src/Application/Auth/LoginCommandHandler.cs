using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public LoginCommandHandler(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Request.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");
        if (!_authService.VerifyPassword(request.Request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");
        var token = _authService.GenerateJwt(user.Id, user.Email, user.Role);
        return new AuthResponse(token, user.Email, user.FullName, user.Role.ToString(), user.Id);
    }
}
