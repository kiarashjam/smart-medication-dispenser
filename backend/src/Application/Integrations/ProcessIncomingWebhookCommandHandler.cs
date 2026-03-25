using System.Text.Json;
using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Integrations;

/// <summary>
/// Processes incoming webhooks from devices.
/// Matches documentation in technical-docs/03_DATA_FORMATS.md
/// </summary>
public class ProcessIncomingWebhookCommandHandler : IRequestHandler<ProcessIncomingWebhookCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public ProcessIncomingWebhookCommandHandler(
        IDeviceRepository deviceRepository,
        IDispenseEventRepository dispenseEventRepository,
        IContainerRepository containerRepository,
        IScheduleRepository scheduleRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _dispenseEventRepository = dispenseEventRepository;
        _containerRepository = containerRepository;
        _scheduleRepository = scheduleRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<bool> Handle(ProcessIncomingWebhookCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null) return false;

        var payload = request.Payload;
        var eventType = payload.EventType?.Trim().ToUpperInvariant() ?? "";

        // Event: {eventType} for device {device.Id}

        // Handle all documented event types
        switch (eventType)
        {
            // Heartbeat & Status Events
            case "HEARTBEAT":
                await ProcessHeartbeatAsync(device, payload.Data, cancellationToken);
                break;
            case "DEVICE_ONLINE":
                device.IsOnline = true;
                device.LastOnlineAtUtc = _dateTime.UtcNow;
                device.LastHeartbeatAtUtc = _dateTime.UtcNow;
                UpdateDeviceFromData(device, payload.Data);
                break;
            case "DEVICE_OFFLINE":
                device.IsOnline = false;
                device.LastOfflineAtUtc = _dateTime.UtcNow;
                break;
            case "DEVICE_ERROR":
                await ProcessDeviceErrorAsync(device, payload.Data, cancellationToken);
                break;
                
            // Dose Events
            case "DOSE_DISPENSED":
                await ProcessDoseDispensedAsync(device.Id, payload.Data, cancellationToken);
                break;
            case "DOSE_TAKEN":
                await ProcessDoseTakenAsync(device.Id, device.UserId, payload.Data, cancellationToken);
                break;
            case "DOSE_MISSED":
                await ProcessDoseMissedAsync(device.Id, device.UserId, payload.Data, cancellationToken);
                break;
                
            // Stock Events
            case "REFILL_NEEDED":
            case "REFILL_CRITICAL":
                await ProcessRefillNeededAsync(device.Id, device.UserId, payload.Data, eventType == "REFILL_CRITICAL", cancellationToken);
                break;
                
            // Battery Events (portable devices)
            case "BATTERY_LOW":
            case "BATTERY_CRITICAL":
                await ProcessBatteryEventAsync(device, payload.Data, eventType == "BATTERY_CRITICAL", cancellationToken);
                break;
                
            // Travel Mode Events
            case "TRAVEL_MODE_ON":
            case "TRAVEL_MODE_OFF":
                await ProcessTravelModeAsync(device, payload.Data, eventType == "TRAVEL_MODE_ON", cancellationToken);
                break;
                
            // Legacy event types (backward compatibility)
            case "DEVICE_STATUS":
                await ProcessDeviceStatusLegacyAsync(device, payload.Data);
                break;
            case "DISPENSE_COMPLETED":
                await ProcessDoseDispensedAsync(device.Id, payload.Data, cancellationToken);
                break;
            case "LOW_STOCK":
                await ProcessRefillNeededAsync(device.Id, device.UserId, payload.Data, false, cancellationToken);
                break;
                
            default:
                // Unknown event type: {eventType}
                return false;
        }

        device.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Task ProcessHeartbeatAsync(Device device, object? data, CancellationToken ct)
    {
        device.LastHeartbeatAtUtc = _dateTime.UtcNow;
        device.IsOnline = true;
        UpdateDeviceFromData(device, data);
        return Task.CompletedTask;
    }

    private void UpdateDeviceFromData(Device device, object? data)
    {
        if (data is not JsonElement je) return;
        
        if (je.TryGetProperty("battery", out var battery) && battery.TryGetInt32(out var batteryLevel))
            device.BatteryLevel = batteryLevel;
        if (je.TryGetProperty("wifi_signal", out var wifi) && wifi.TryGetInt32(out var wifiSignal))
            device.WifiSignal = wifiSignal;
        if (je.TryGetProperty("temperature", out var temp) && temp.TryGetDecimal(out var temperature))
            device.Temperature = temperature;
        if (je.TryGetProperty("humidity", out var hum) && hum.TryGetInt32(out var humidity))
            device.Humidity = humidity;
        if (je.TryGetProperty("firmware", out var fw))
            device.FirmwareVersion = fw.GetString();
    }

    private async Task ProcessDeviceErrorAsync(Device device, object? data, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        var errorCode = je.TryGetProperty("error_code", out var ec) ? ec.GetString() : null;
        var message = je.TryGetProperty("message", out var m) ? m.GetString() : "Device error";
        
        device.LastErrorCode = errorCode;
        device.LastErrorMessage = message;
        
        // Send notification to user
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = device.UserId,
            Type = NotificationType.DeviceError,
            Title = "Device Error",
            Body = $"{device.Name}: {message} (Code: {errorCode})",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = device.Id
        }, ct);
    }

    private Task ProcessDeviceStatusLegacyAsync(Device device, object? data)
    {
        if (data is not JsonElement je) return Task.CompletedTask;
        
        if (je.TryGetProperty("status", out var statusEl))
        {
            var statusStr = statusEl.GetString();
            if (string.Equals(statusStr, "Paused", StringComparison.OrdinalIgnoreCase))
                device.Status = DeviceStatus.Paused;
            else if (string.Equals(statusStr, "Active", StringComparison.OrdinalIgnoreCase))
                device.Status = DeviceStatus.Active;
        }
        device.LastHeartbeatAtUtc = _dateTime.UtcNow;
        return Task.CompletedTask;
    }

    private async Task ProcessDoseTakenAsync(Guid deviceId, Guid userId, object? data, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        var medication = je.TryGetProperty("medication", out var med) ? med.GetString() : null;
        
        // Find the most recent dispensed-but-not-confirmed event for this device
        var recentEvents = await _dispenseEventRepository.GetByDeviceIdAsync(
            deviceId, _dateTime.UtcNow.AddHours(-2), _dateTime.UtcNow, 10, ct);

        var pendingEvent = recentEvents
            .FirstOrDefault(e => e.Status == DispenseEventStatus.Dispensed);

        if (pendingEvent != null)
        {
            pendingEvent.Status = DispenseEventStatus.Confirmed;
            pendingEvent.ConfirmedAtUtc = _dateTime.UtcNow;
        }

        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.DoseTaken,
            Title = "Dose Taken",
            Body = $"{medication ?? "Medication"} dose confirmed taken.",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = pendingEvent?.Id ?? deviceId
        }, ct);
    }

    private async Task ProcessDoseMissedAsync(Guid deviceId, Guid userId, object? data, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        var medication = je.TryGetProperty("medication", out var med) ? med.GetString() : "Unknown medication";
        var scheduledTime = je.TryGetProperty("scheduled_time", out var st) ? st.GetString() : null;
        
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.MissedDose,
            Title = "Missed Dose",
            Body = $"{medication} was not taken{(scheduledTime != null ? $" (scheduled at {scheduledTime})" : "")}",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = deviceId
        }, ct);
    }

    private async Task ProcessRefillNeededAsync(Guid deviceId, Guid userId, object? data, bool isCritical, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        var medication = je.TryGetProperty("medication", out var med) ? med.GetString() : "Medication";
        var pillsRemaining = je.TryGetProperty("pills_remaining", out var pr) && pr.TryGetInt32(out var pills) ? pills : 0;
        var daysRemaining = je.TryGetProperty("days_remaining", out var dr) && dr.TryGetInt32(out var days) ? days : 0;
        var slot = je.TryGetProperty("slot", out var s) && s.TryGetInt32(out var slotNum) ? slotNum : (int?)null;
        
        var containerId = GetGuid(je, "containerId");
        if (containerId.HasValue)
        {
            var exists = await _notificationRepository.HasUnreadLowStockForContainerAsync(userId, containerId.Value, ct);
            if (exists) return;
        }
        
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = isCritical ? NotificationType.LowStock : NotificationType.LowStock,
            Title = isCritical ? "Critical: Refill Required" : "Refill Needed",
            Body = $"{medication}: {pillsRemaining} pills remaining (~{daysRemaining} days){(slot.HasValue ? $" in slot {slot}" : "")}",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = containerId
        }, ct);
    }

    private async Task ProcessBatteryEventAsync(Device device, object? data, bool isCritical, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        var batteryLevel = je.TryGetProperty("battery_level", out var bl) && bl.TryGetInt32(out var level) ? level : 0;
        var estimatedHours = je.TryGetProperty("estimated_hours", out var eh) && eh.TryGetInt32(out var hours) ? hours : (int?)null;
        
        device.BatteryLevel = batteryLevel;
        
        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = device.UserId,
            Type = NotificationType.DeviceStatus,
            Title = isCritical ? "Battery Critical" : "Battery Low",
            Body = $"{device.Name}: Battery at {batteryLevel}%{(estimatedHours.HasValue ? $" (~{estimatedHours}h remaining)" : "")}",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = device.Id
        }, ct);
    }

    private async Task ProcessTravelModeAsync(Device device, object? data, bool isOn, CancellationToken ct)
    {
        var notifType = isOn ? NotificationType.TravelStarted : NotificationType.TravelEnded;
        var title = isOn ? "Travel Mode Activated" : "Travel Mode Deactivated";
        var body = isOn
            ? $"{device.Name}: travel mode is now active."
            : $"{device.Name}: travel mode ended, returning to normal operation.";

        await _notificationRepository.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = device.UserId,
            Type = notifType,
            Title = title,
            Body = body,
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = device.Id
        }, ct);
    }

    /// <summary>
    /// Process DOSE_DISPENSED event - pills have been dropped to tray.
    /// Matches technical-docs/03_DATA_FORMATS.md
    /// </summary>
    private async Task ProcessDoseDispensedAsync(Guid deviceId, object? data, CancellationToken ct)
    {
        if (data is not JsonElement je) return;
        
        // Support both new format (medication, slot, pills_dispensed) and legacy (containerId, scheduleId)
        var medication = je.TryGetProperty("medication", out var med) ? med.GetString() : null;
        var slot = je.TryGetProperty("slot", out var s) && s.TryGetInt32(out var slotNum) ? slotNum : (int?)null;
        var pillsDispensed = je.TryGetProperty("pills_dispensed", out var pd) && pd.TryGetInt32(out var pills) ? pills : (int?)null;
        var pillsRemaining = je.TryGetProperty("pills_remaining", out var pr) && pr.TryGetInt32(out var remaining) ? remaining : (int?)null;
        
        // Legacy support
        var containerId = GetGuid(je, "containerId");
        var scheduleId = GetGuid(je, "scheduleId");
        
        if (containerId.HasValue && scheduleId.HasValue)
        {
            // Legacy processing
            var container = await _containerRepository.GetByIdAsync(containerId.Value, ct);
            var schedule = await _scheduleRepository.GetByIdAsync(scheduleId.Value, ct);
            if (container == null || schedule == null || container.DeviceId != deviceId || schedule.ContainerId != containerId) return;
            if (container.Quantity < container.PillsPerDose) return;
            
            var evt = new DispenseEvent
            {
                Id = Guid.NewGuid(),
                DeviceId = deviceId,
                ContainerId = container.Id,
                ScheduleId = schedule.Id,
                ScheduledAtUtc = _dateTime.UtcNow,
                Status = DispenseEventStatus.Dispensed,
                DispensedAtUtc = _dateTime.UtcNow,
                CreatedAtUtc = _dateTime.UtcNow
            };
            await _dispenseEventRepository.AddAsync(evt, ct);
            container.Quantity -= container.PillsPerDose;
            container.UpdatedAtUtc = _dateTime.UtcNow;
        }
        else if (slot.HasValue)
        {
            // New format - find container by slot number and update inventory
            var device = await _deviceRepository.GetByIdWithContainersAsync(deviceId, ct);
            if (device != null)
            {
                var container = device.Containers.FirstOrDefault(c => c.SlotNumber == slot.Value);
                if (container != null)
                {
                    if (pillsRemaining.HasValue)
                        container.Quantity = pillsRemaining.Value;
                    else if (pillsDispensed.HasValue)
                        container.Quantity = Math.Max(0, container.Quantity - pillsDispensed.Value);

                    container.UpdatedAtUtc = _dateTime.UtcNow;

                    // Find first matching schedule for this container
                    var schedules = await _scheduleRepository.GetByContainerIdAsync(container.Id, ct);
                    var matchingSchedule = schedules.FirstOrDefault();

                    if (matchingSchedule != null)
                    {
                        var evt = new DispenseEvent
                        {
                            Id = Guid.NewGuid(),
                            DeviceId = deviceId,
                            ContainerId = container.Id,
                            ScheduleId = matchingSchedule.Id,
                            ScheduledAtUtc = _dateTime.UtcNow,
                            Status = DispenseEventStatus.Dispensed,
                            DispensedAtUtc = _dateTime.UtcNow,
                            CreatedAtUtc = _dateTime.UtcNow
                        };
                        await _dispenseEventRepository.AddAsync(evt, ct);
                    }
                }
            }
        }
    }

    private static Guid? GetGuid(JsonElement je, string name) =>
        je.TryGetProperty(name, out var p) && Guid.TryParse(p.GetString(), out var g) ? g : null;
}
