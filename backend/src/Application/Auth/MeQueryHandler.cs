using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public class MeQueryHandler : IRequestHandler<MeQuery, MeResponse>
{
    private readonly IUserRepository _userRepository;

    public MeQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<MeResponse> Handle(MeQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");
        return new MeResponse(user.Id, user.Email, user.FullName, user.Role.ToString());
    }
}
