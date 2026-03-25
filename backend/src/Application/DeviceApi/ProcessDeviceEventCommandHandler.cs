using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using System.Text.Json;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class ProcessDeviceEventCommandHandler : IRequestHandler<ProcessDeviceEventCommand, ProcessDeviceEventResult>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IDeviceEventLogRepository _eventLogRepository;
    private readonly IUserRepository _userRepository;
    private readonly IWebhookEndpointRepository _webhookEndpoints;
    private readonly IWebhookDeliveryService _webhookDelivery;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<ProcessDeviceEventCommandHandler> _logger;

    public ProcessDeviceEventCommandHandler(
        IDeviceRepository deviceRepository,
        IContainerRepository containerRepository,
        IScheduleRepository scheduleRepository,
        IDispenseEventRepository dispenseEventRepository,
        INotificationRepository notificationRepository,
        IDeviceEventLogRepository eventLogRepository,
        IUserRepository userRepository,
        IWebhookEndpointRepository webhookEndpoints,
        IWebhookDeliveryService webhookDelivery,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime,
        ILogger<ProcessDeviceEventCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
        _scheduleRepository = scheduleRepository;
        _dispenseEventRepository = dispenseEventRepository;
        _notificationRepository = notificationRepository;
        _eventLogRepository = eventLogRepository;
        _userRepository = userRepository;
        _webhookEndpoints = webhookEndpoints;
        _webhookDelivery = webhookDelivery;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<ProcessDeviceEventResult> Handle(ProcessDeviceEventCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdWithContainersAsync(request.DeviceId, ct);
        if (device == null)
            return new ProcessDeviceEventResult(false, null, "Device not found");

        var payload = request.Payload;
        var eventId = Guid.NewGuid();

        // Parse event type
        if (!TryParseEventType(payload.Event, out var eventType))
            return new ProcessDeviceEventResult(false, null, $"Unknown event type: {payload.Event}");

        // Log the raw event
        var eventLog = new DeviceEventLog
        {
            Id = eventId,
            DeviceId = request.DeviceId,
            EventType = eventType,
            EventTimestampUtc = payload.Timestamp,
            ReceivedAtUtc = _dateTime.UtcNow,
            DataJson = payload.Data != null ? JsonSerializer.Serialize(payload.Data) : null,
            Processed = false
        };
        await _eventLogRepository.AddAsync(eventLog, ct);

        // Process based on type
        string? processingError = null;
        try
        {
            switch (eventType)
            {
                case DeviceEventType.DoseDispensed:
                    await ProcessDoseDispensed(device, payload, ct);
                    break;
                case DeviceEventType.DoseTaken:
                    await ProcessDoseTaken(device, payload, ct);
                    break;
                case DeviceEventType.DoseMissed:
                    await ProcessDoseMissed(device, payload, ct);
                    break;
                case DeviceEventType.RefillNeeded:
                    await ProcessRefillNeeded(device, payload, false, ct);
                    break;
                case DeviceEventType.RefillCritical:
                    await ProcessRefillNeeded(device, payload, true, ct);
                    break;
                case DeviceEventType.DeviceOnline:
                    await ProcessDeviceOnline(device, payload, ct);
                    break;
                case DeviceEventType.DeviceOffline:
                    await ProcessDeviceOffline(device, payload, ct);
                    break;
                case DeviceEventType.DeviceError:
                    await ProcessDeviceError(device, payload, ct);
                    break;
                case DeviceEventType.BatteryLow:
                    await ProcessBatteryAlert(device, payload, false, ct);
                    break;
                case DeviceEventType.BatteryCritical:
                    await ProcessBatteryAlert(device, payload, true, ct);
                    break;
                case DeviceEventType.TravelModeOn:
                    await ProcessTravelModeOn(device, payload, ct);
                    break;
                case DeviceEventType.TravelModeOff:
                    await ProcessTravelModeOff(device, payload, ct);
                    break;
            }

            eventLog.Processed = true;
        }
        catch (Exception ex)
        {
            processingError = ex.Message;
            eventLog.ProcessingError = processingError;
            _logger.LogError(ex, "Failed to process event {EventType} for device {DeviceId}", eventType, request.DeviceId);
        }

        await _unitOfWork.SaveChangesAsync(ct);

        // Send webhooks asynchronously
        await SendWebhooksAsync(device.UserId, payload.Event.ToLowerInvariant(), payload.Data, ct);

        return new ProcessDeviceEventResult(true, eventId.ToString(), processingError);
    }

    private async Task ProcessDoseDispensed(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        var data = DeserializeData<DoseDispensedData>(payload.Data);
        if (data == null) return;

        // Find the container by slot
        var container = device.Containers.FirstOrDefault(c => c.SlotNumber == data.Slot);
        if (container == null)
        {
            _logger.LogWarning("No container found for slot {Slot} on device {DeviceId}", data.Slot, device.Id);
            return;
        }

        // Update pill count
        container.Quantity = data.PillsRemaining;
        container.UpdatedAtUtc = _dateTime.UtcNow;

        // Find matching schedule for this container and time
        var scheduleId = await FindMatchingScheduleAsync(container.Id, data.ScheduledTime, ct);

        // Create dispense event
        var dispenseEvent = new DispenseEvent
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            ContainerId = container.Id,
            ScheduleId = scheduleId,
            ScheduledAtUtc = data.ScheduledTime ?? _dateTime.UtcNow,
            Status = DispenseEventStatus.Dispensed,
            DispensedAtUtc = payload.Timestamp,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _dispenseEventRepository.AddAsync(dispenseEvent, ct);

        // Create notification
        await CreateNotificationAsync(device, NotificationType.DoseDispensed,
            "Dose dispensed",
            $"{data.Medication}: {data.PillsDispensed} pill(s) dispensed from slot {data.Slot}.",
            dispenseEvent.Id, ct);

        _logger.LogInformation("DOSE_DISPENSED: Device {DeviceId}, Slot {Slot}, Medication {Med}, Pills {Pills}",
            device.Id, data.Slot, data.Medication, data.PillsDispensed);
    }

    private async Task ProcessDoseTaken(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        var data = DeserializeData<DoseTakenData>(payload.Data);
        if (data == null) return;

        // Find the most recent dispensed-but-not-confirmed event for this device
        var recentEvents = await _dispenseEventRepository.GetByDeviceIdAsync(
            device.Id, _dateTime.UtcNow.AddHours(-2), _dateTime.UtcNow, 10, ct);

        var pendingEvent = recentEvents
            .FirstOrDefault(e => e.Status == DispenseEventStatus.Dispensed);

        if (pendingEvent != null)
        {
            pendingEvent.Status = DispenseEventStatus.Confirmed;
            pendingEvent.ConfirmedAtUtc = payload.Timestamp;
        }

        await CreateNotificationAsync(device, NotificationType.DoseTaken,
            "Dose taken",
            $"{data.Medication}: confirmed taken{(data.OnTime ? " on time" : " late")}.",
            pendingEvent?.Id, ct);

        _logger.LogInformation("DOSE_TAKEN: Device {DeviceId}, Medication {Med}, OnTime: {OnTime}",
            device.Id, data.Medication, data.OnTime);
    }

    private async Task ProcessDoseMissed(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        var data = DeserializeData<DoseMissedData>(payload.Data);
        if (data == null) return;

        // Find matching dispensed event and mark as missed
        var recentEvents = await _dispenseEventRepository.GetByDeviceIdAsync(
            device.Id, data.ScheduledTime.AddHours(-1), data.ScheduledTime.AddHours(1), 5, ct);

        var dispensedEvent = recentEvents
            .FirstOrDefault(e => e.Status == DispenseEventStatus.Dispensed);

        if (dispensedEvent != null)
        {
            dispensedEvent.Status = DispenseEventStatus.Missed;
            dispensedEvent.MissedMarkedAtUtc = _dateTime.UtcNow;
        }

        // Notify patient
        await CreateNotificationAsync(device, NotificationType.MissedDose,
            "Missed dose",
            $"{data.Medication}: scheduled at {data.ScheduledTime:HH:mm} was missed.",
            dispensedEvent?.Id, ct);

        // Notify caregiver
        var patient = await _userRepository.GetByIdAsync(device.UserId, ct);
        if (patient?.CaregiverUserId != null)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = patient.CaregiverUserId.Value,
                Type = NotificationType.MissedDose,
                Title = "Patient missed dose",
                Body = $"{data.Medication}: scheduled at {data.ScheduledTime:HH:mm} was missed.",
                IsRead = false,
                CreatedAtUtc = _dateTime.UtcNow,
                RelatedEntityId = dispensedEvent?.Id
            }, ct);
        }

        _logger.LogWarning("DOSE_MISSED: Device {DeviceId}, Medication {Med}, ScheduledAt {Time}",
            device.Id, data.Medication, data.ScheduledTime);
    }

    private async Task ProcessRefillNeeded(Device device, DeviceEventPayload payload, bool isCritical, CancellationToken ct)
    {
        var data = DeserializeData<RefillNeededData>(payload.Data);
        if (data == null) return;

        var container = device.Containers.FirstOrDefault(c => c.SlotNumber == data.Slot);
        if (container != null)
        {
            container.Quantity = data.PillsRemaining;
            container.UpdatedAtUtc = _dateTime.UtcNow;
        }

        var type = isCritical ? NotificationType.RefillCritical : NotificationType.LowStock;
        var title = isCritical ? "Refill critical" : "Refill needed";
        var body = $"{data.Medication} (slot {data.Slot}): {data.PillsRemaining} pills remaining (~{data.DaysRemaining} days).";

        await CreateNotificationAsync(device, type, title, body, container?.Id, ct);

        _logger.LogInformation("REFILL_{Level}: Device {DeviceId}, Slot {Slot}, Remaining {Qty}",
            isCritical ? "CRITICAL" : "NEEDED", device.Id, data.Slot, data.PillsRemaining);
    }

    private async Task ProcessDeviceOnline(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        var data = DeserializeData<DeviceOnlineData>(payload.Data);

        device.IsOnline = true;
        device.LastOnlineAtUtc = payload.Timestamp;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        if (data != null)
        {
            device.FirmwareVersion = data.Firmware;
            if (data.Battery.HasValue) device.BatteryLevel = data.Battery.Value;
            if (data.WifiSignal.HasValue) device.WifiSignal = data.WifiSignal.Value;
        }

        await CreateNotificationAsync(device, NotificationType.DeviceOnline,
            "Device online", $"{device.Name} is now connected.", device.Id, ct);

        _logger.LogInformation("DEVICE_ONLINE: {DeviceId}", device.Id);
    }

    private async Task ProcessDeviceOffline(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        device.IsOnline = false;
        device.LastOfflineAtUtc = payload.Timestamp;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        await CreateNotificationAsync(device, NotificationType.DeviceOffline,
            "Device offline", $"{device.Name} has gone offline.", device.Id, ct);

        // Notify caregiver
        var patient = await _userRepository.GetByIdAsync(device.UserId, ct);
        if (patient?.CaregiverUserId != null)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = patient.CaregiverUserId.Value,
                Type = NotificationType.DeviceOffline,
                Title = "Patient device offline",
                Body = $"{device.Name} has gone offline.",
                IsRead = false,
                CreatedAtUtc = _dateTime.UtcNow,
                RelatedEntityId = device.Id
            }, ct);
        }

        _logger.LogWarning("DEVICE_OFFLINE: {DeviceId}", device.Id);
    }

    private async Task ProcessDeviceError(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        var data = DeserializeData<DeviceErrorData>(payload.Data);
        if (data == null) return;

        device.LastErrorCode = data.ErrorCode;
        device.LastErrorMessage = data.Message;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        await CreateNotificationAsync(device, NotificationType.DeviceError,
            "Device error",
            $"{device.Name}: [{data.ErrorCode}] {data.Message}",
            device.Id, ct);

        _logger.LogError("DEVICE_ERROR: Device {DeviceId}, Code: {Code}, Type: {Type}, Message: {Msg}",
            device.Id, data.ErrorCode, data.ErrorType, data.Message);
    }

    private async Task ProcessBatteryAlert(Device device, DeviceEventPayload payload, bool isCritical, CancellationToken ct)
    {
        var data = DeserializeData<BatteryLowData>(payload.Data);
        if (data == null) return;

        device.BatteryLevel = data.BatteryLevel;
        device.UpdatedAtUtc = _dateTime.UtcNow;

        var type = isCritical ? NotificationType.BatteryCritical : NotificationType.BatteryLow;
        var title = isCritical ? "Battery critical" : "Battery low";
        var body = $"{device.Name}: battery at {data.BatteryLevel}%";
        if (data.EstimatedHours.HasValue)
            body += $" (~{data.EstimatedHours}h remaining)";

        await CreateNotificationAsync(device, type, title, body, device.Id, ct);

        _logger.LogWarning("BATTERY_{Level}: Device {DeviceId}, Level {Level}%",
            isCritical ? "CRITICAL" : "LOW", device.Id, data.BatteryLevel);
    }

    private Task ProcessTravelModeOn(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        _logger.LogInformation("TRAVEL_MODE_ON: Device {DeviceId}", device.Id);
        return CreateNotificationAsync(device, NotificationType.TravelStarted,
            "Travel mode activated",
            $"{device.Name}: travel mode is now active.",
            device.Id, ct);
    }

    private Task ProcessTravelModeOff(Device device, DeviceEventPayload payload, CancellationToken ct)
    {
        _logger.LogInformation("TRAVEL_MODE_OFF: Device {DeviceId}", device.Id);
        return CreateNotificationAsync(device, NotificationType.TravelEnded,
            "Travel mode deactivated",
            $"{device.Name}: travel mode ended, returning to normal operation.",
            device.Id, ct);
    }

    // --- Helpers ---

    private async Task CreateNotificationAsync(Device device, NotificationType type, string title, string body, Guid? relatedEntityId, CancellationToken ct)
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
            RelatedEntityId = relatedEntityId
        }, ct);
    }

    private async Task<Guid> FindMatchingScheduleAsync(Guid containerId, DateTime? scheduledTime, CancellationToken ct)
    {
        var schedules = await _scheduleRepository.GetByContainerIdAsync(containerId, ct);
        if (schedules.Count == 0)
            return Guid.Empty;

        // If we have an exact scheduled time, find the schedule whose TimeOfDay is closest
        if (scheduledTime.HasValue)
        {
            var targetTime = TimeOnly.FromDateTime(scheduledTime.Value);
            var dayOfWeek = scheduledTime.Value.DayOfWeek;
            int dayBit = 1 << (int)dayOfWeek;

            // Find schedules active on this day whose time matches within a 30-minute window
            var bestMatch = schedules
                .Where(s => (s.DaysOfWeekBitmask & dayBit) != 0)
                .Where(s => s.StartDate <= scheduledTime.Value && (s.EndDate == null || s.EndDate >= scheduledTime.Value))
                .Select(s => new { Schedule = s, Diff = Math.Abs((targetTime.ToTimeSpan() - s.TimeOfDay.ToTimeSpan()).TotalMinutes) })
                .Where(x => x.Diff <= 30) // within 30-minute window
                .OrderBy(x => x.Diff)
                .FirstOrDefault();

            if (bestMatch != null)
                return bestMatch.Schedule.Id;
        }

        // Fallback: return the first schedule for this container (best-effort)
        return schedules.First().Id;
    }

    private async Task SendWebhooksAsync(Guid userId, string eventType, object? data, CancellationToken ct)
    {
        try
        {
            var endpoints = await _webhookEndpoints.GetActiveByUserIdAsync(userId, ct);
            foreach (var ep in endpoints)
            {
                var webhookPayload = new { eventType = $"device.{eventType}", timestampUtc = _dateTime.UtcNow, data };
                await _webhookDelivery.SendAsync(ep.Url, webhookPayload, ep.Secret, ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send webhooks for user {UserId}, event {Event}", userId, eventType);
        }
    }

    private static bool TryParseEventType(string? eventString, out DeviceEventType eventType)
    {
        eventType = default;
        if (string.IsNullOrWhiteSpace(eventString)) return false;

        return eventString.ToUpperInvariant() switch
        {
            "DOSE_DISPENSED" => SetAndReturn(out eventType, DeviceEventType.DoseDispensed),
            "DOSE_TAKEN" => SetAndReturn(out eventType, DeviceEventType.DoseTaken),
            "DOSE_MISSED" => SetAndReturn(out eventType, DeviceEventType.DoseMissed),
            "REFILL_NEEDED" => SetAndReturn(out eventType, DeviceEventType.RefillNeeded),
            "REFILL_CRITICAL" => SetAndReturn(out eventType, DeviceEventType.RefillCritical),
            "DEVICE_ONLINE" => SetAndReturn(out eventType, DeviceEventType.DeviceOnline),
            "DEVICE_OFFLINE" => SetAndReturn(out eventType, DeviceEventType.DeviceOffline),
            "DEVICE_ERROR" => SetAndReturn(out eventType, DeviceEventType.DeviceError),
            "BATTERY_LOW" => SetAndReturn(out eventType, DeviceEventType.BatteryLow),
            "BATTERY_CRITICAL" => SetAndReturn(out eventType, DeviceEventType.BatteryCritical),
            "TRAVEL_MODE_ON" => SetAndReturn(out eventType, DeviceEventType.TravelModeOn),
            "TRAVEL_MODE_OFF" => SetAndReturn(out eventType, DeviceEventType.TravelModeOff),
            "HEARTBEAT" => SetAndReturn(out eventType, DeviceEventType.Heartbeat),
            _ => false
        };
    }

    private static bool SetAndReturn(out DeviceEventType target, DeviceEventType value)
    {
        target = value;
        return true;
    }

    private static T? DeserializeData<T>(object? data) where T : class
    {
        if (data == null) return null;
        try
        {
            if (data is JsonElement jsonElement)
                return JsonSerializer.Deserialize<T>(jsonElement.GetRawText());
            var json = JsonSerializer.Serialize(data);
            return JsonSerializer.Deserialize<T>(json);
        }
        catch
        {
            return null;
        }
    }
}
