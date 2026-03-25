using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using System.Text.Json;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class ReportDeviceErrorCommandHandler : IRequestHandler<ReportDeviceErrorCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceEventLogRepository _eventLogRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<ReportDeviceErrorCommandHandler> _logger;

    public ReportDeviceErrorCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceEventLogRepository eventLogRepository,
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime,
        ILogger<ReportDeviceErrorCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _eventLogRepository = eventLogRepository;
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<bool> Handle(ReportDeviceErrorCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, ct);
        if (device == null) return false;

        var error = request.ErrorData;

        // Update device error state
        device.LastErrorCode = error.ErrorCode;
        device.LastErrorMessage = error.Message;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        // Log the error event
        await _eventLogRepository.AddAsync(new DeviceEventLog
        {
            Id = Guid.NewGuid(),
            DeviceId = request.DeviceId,
            EventType = DeviceEventType.DeviceError,
            EventTimestampUtc = _dateTime.UtcNow,
            ReceivedAtUtc = _dateTime.UtcNow,
            DataJson = JsonSerializer.Serialize(error),
            Processed = true
        }, ct);

        // Create notification for device owner
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = device.UserId,
            Type = NotificationType.DeviceError,
            Title = $"Device error: {error.ErrorCode}",
            Body = $"{device.Name}: {error.Message} (severity: {error.Severity ?? "unknown"})",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = device.Id
        }, ct);

        // Also notify caregiver for critical errors
        if (error.Severity?.ToLowerInvariant() is "critical" or "high")
        {
            var patient = await _userRepository.GetByIdAsync(device.UserId, ct);
            if (patient?.CaregiverUserId != null)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = patient.CaregiverUserId.Value,
                    Type = NotificationType.DeviceError,
                    Title = "Patient device error",
                    Body = $"{device.Name}: [{error.ErrorCode}] {error.Message}",
                    IsRead = false,
                    CreatedAtUtc = _dateTime.UtcNow,
                    RelatedEntityId = device.Id
                }, ct);
            }
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogError("Device error reported: {DeviceId}, Code: {Code}, Type: {Type}, Severity: {Severity}, Message: {Msg}",
            request.DeviceId, error.ErrorCode, error.ErrorType, error.Severity, error.Message);

        return true;
    }
}
