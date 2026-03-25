using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class ProcessDeviceHeartbeatCommandHandler : IRequestHandler<ProcessDeviceHeartbeatCommand, ProcessDeviceHeartbeatResult>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<ProcessDeviceHeartbeatCommandHandler> _logger;

    public ProcessDeviceHeartbeatCommandHandler(
        IDeviceRepository deviceRepository,
        IContainerRepository containerRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime,
        ILogger<ProcessDeviceHeartbeatCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<ProcessDeviceHeartbeatResult> Handle(ProcessDeviceHeartbeatCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdWithContainersAsync(request.DeviceId, cancellationToken);
        if (device == null)
        {
            return new ProcessDeviceHeartbeatResult(false, _dateTime.UtcNow, 60, null);
        }

        var payload = request.Payload;

        // Update device status from heartbeat
        device.LastHeartbeatAtUtc = _dateTime.UtcNow;
        device.IsOnline = true;
        device.LastOnlineAtUtc = _dateTime.UtcNow;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        if (payload.Battery.HasValue)
            device.BatteryLevel = payload.Battery.Value;
        if (payload.WifiSignal.HasValue)
            device.WifiSignal = payload.WifiSignal.Value;
        if (payload.Temperature.HasValue)
            device.Temperature = payload.Temperature.Value;
        if (payload.Humidity.HasValue)
            device.Humidity = payload.Humidity.Value;
        if (!string.IsNullOrEmpty(payload.Firmware))
            device.FirmwareVersion = payload.Firmware;

        // Update slot pill counts from heartbeat
        if (payload.Slots != null)
        {
            foreach (var slotData in payload.Slots)
            {
                var container = device.Containers.FirstOrDefault(c => c.SlotNumber == slotData.Slot);
                if (container != null)
                {
                    container.Quantity = slotData.Pills;
                    container.UpdatedAtUtc = _dateTime.UtcNow;
                }
            }
        }

        // Check battery and create notifications
        var commands = new List<DeviceCommand>();

        if (payload.Battery.HasValue && payload.Battery.Value <= 5)
        {
            await CreateNotificationAsync(device, NotificationType.BatteryCritical,
                "Battery critical",
                $"Device {device.Name} battery is critically low at {payload.Battery.Value}%.",
                cancellationToken);
        }
        else if (payload.Battery.HasValue && payload.Battery.Value <= 20)
        {
            await CreateNotificationAsync(device, NotificationType.BatteryLow,
                "Battery low",
                $"Device {device.Name} battery is low at {payload.Battery.Value}%.",
                cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProcessDeviceHeartbeatResult(
            Success: true,
            ServerTime: _dateTime.UtcNow,
            NextHeartbeat: 60,
            Commands: commands.Count > 0 ? commands : null
        );
    }

    private async Task CreateNotificationAsync(Device device, NotificationType type, string title, string body, CancellationToken ct)
    {
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = device.UserId,
            Type = type,
            Title = title,
            Body = body,
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = device.Id
        }, ct);
    }
}
