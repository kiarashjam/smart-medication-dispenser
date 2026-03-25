using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterCommandHandler(IUserRepository userRepository, IAuthService authService, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _authService = authService;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.ExistsWithEmailAsync(request.Request.Email, cancellationToken))
            throw new InvalidOperationException("Email already registered.");

        var hashResult = _authService.HashPassword(request.Request.Password);
        if (hashResult == null)
            throw new InvalidOperationException("Password hashing failed.");

        var role = Enum.TryParse<UserRole>(request.Request.Role, true, out var r) ? r : UserRole.Patient;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Request.Email,
            PasswordHash = hashResult.Value.Hash,
            FullName = request.Request.FullName,
            Role = role,
            CreatedAtUtc = DateTime.UtcNow
        };
        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _authService.GenerateJwt(user.Id, user.Email, user.Role);
        return new AuthResponse(token, user.Email, user.FullName, user.Role.ToString(), user.Id);
    }
}
