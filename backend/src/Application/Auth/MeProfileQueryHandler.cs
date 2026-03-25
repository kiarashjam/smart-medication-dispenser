using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Auth;

public class MeProfileQueryHandler : IRequestHandler<MeProfileQuery, MeProfileResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IDeviceRepository _deviceRepository;

    public MeProfileQueryHandler(IUserRepository userRepository, IDeviceRepository deviceRepository)
    {
        _userRepository = userRepository;
        _deviceRepository = deviceRepository;
    }

    public async Task<MeProfileResponse> Handle(MeProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");
        var devices = await _deviceRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        var deviceSummaries = devices.Select(d => new UserDeviceSummaryDto(d.Id, d.Name, d.Type.ToString(), d.Status.ToString())).ToList();
        return new MeProfileResponse(user.Id, user.Email, user.FullName, user.Role.ToString(), deviceSummaries);
    }
}
