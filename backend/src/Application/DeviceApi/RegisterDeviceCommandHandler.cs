using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using System.Text.RegularExpressions;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class RegisterDeviceCommandHandler : IRequestHandler<RegisterDeviceCommand, DeviceRegistrationResponse>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<RegisterDeviceCommandHandler> _logger;

    // Device ID format: SMD-XXXXXXXX (8 hex chars)
    private static readonly Regex DeviceIdPattern = new(@"^SMD-[0-9A-Fa-f]{8}$", RegexOptions.Compiled);

    public RegisterDeviceCommandHandler(
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork,
        IAuthService authService,
        IDateTimeProvider dateTime,
        ILogger<RegisterDeviceCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
        _authService = authService;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<DeviceRegistrationResponse> Handle(RegisterDeviceCommand request, CancellationToken cancellationToken)
    {
        // Validate device ID format
        if (string.IsNullOrWhiteSpace(request.DeviceId) || !DeviceIdPattern.IsMatch(request.DeviceId))
        {
            _logger.LogWarning("Invalid device ID format: {DeviceId}", request.DeviceId);
            return new DeviceRegistrationResponse(
                Success: false,
                DeviceToken: null,
                TokenExpiresAt: null,
                ApiEndpoint: null,
                HeartbeatInterval: 60
            );
        }

        // Parse device type
        var deviceType = request.DeviceType?.ToLowerInvariant() switch
        {
            "main" or "smd-100" => DeviceType.Main,
            "portable" or "smd-200" or "travel" => DeviceType.Portable,
            _ => DeviceType.Main
        };

        // Create the device (will be associated with user during onboarding)
        var device = new Device
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Empty, // Will be assigned during user onboarding
            Name = $"Device {request.DeviceId}",
            Type = deviceType,
            Status = DeviceStatus.Active,
            FirmwareVersion = request.FirmwareVersion,
            HardwareVersion = request.HardwareVersion,
            MacAddress = request.MacAddress,
            IsOnline = true,
            LastOnlineAtUtc = _dateTime.UtcNow,
            LastHeartbeatAtUtc = _dateTime.UtcNow,
            CreatedAtUtc = _dateTime.UtcNow
        };

        await _deviceRepository.AddAsync(device, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Generate a device JWT token (expires in 365 days for devices)
        var token = _authService.GenerateJwt(device.Id, request.DeviceId, UserRole.Patient);
        var tokenExpiresAt = _dateTime.UtcNow.AddDays(365);

        _logger.LogInformation("Device registered: {DeviceId} => {InternalId}, Type: {Type}",
            request.DeviceId, device.Id, deviceType);

        return new DeviceRegistrationResponse(
            Success: true,
            DeviceToken: token,
            TokenExpiresAt: tokenExpiresAt,
            ApiEndpoint: null, // Will be set by controller
            HeartbeatInterval: 60
        );
    }
}
