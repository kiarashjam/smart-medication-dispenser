using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

// DTO
public record UpdateProfileRequest(string? FullName, Guid? CaregiverUserId);

// Command
public record UpdateProfileCommand(Guid UserId, UpdateProfileRequest Request) : IRequest<MeResponse>;

// Handler
public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, MeResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MeResponse> Handle(UpdateProfileCommand command, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(command.UserId, ct)
            ?? throw new KeyNotFoundException("User not found");

        if (!string.IsNullOrWhiteSpace(command.Request.FullName))
            user.FullName = command.Request.FullName;

        if (command.Request.CaregiverUserId.HasValue)
        {
            var caregiver = await _userRepository.GetByIdAsync(command.Request.CaregiverUserId.Value, ct);
            if (caregiver == null)
                throw new ArgumentException("Caregiver user not found");
            user.CaregiverUserId = caregiver.Id;
        }

        user.UpdatedAtUtc = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(ct);

        return new MeResponse(user.Id, user.Email, user.FullName, user.Role.ToString());
    }
}
