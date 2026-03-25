using System.Text.Json.Serialization;

namespace SmartMedicationDispenser.Application.DTOs;

/// <summary>
/// DTOs for device events - matches technical-docs/03_DATA_FORMATS.md
/// </summary>

// ============================================
// Base Event Structure
// ============================================

/// <summary>Base event from device</summary>
public record DeviceEventPayload(
    [property: JsonPropertyName("event")] string Event,
    [property: JsonPropertyName("device_id")] string DeviceId,
    [property: JsonPropertyName("timestamp")] DateTime Timestamp,
    [property: JsonPropertyName("data")] object? Data
);

// ============================================
// Event Data Objects
// ============================================

/// <summary>Data for DOSE_DISPENSED event</summary>
public record DoseDispensedData(
    [property: JsonPropertyName("medication")] string Medication,
    [property: JsonPropertyName("slot")] int Slot,
    [property: JsonPropertyName("pills_dispensed")] int PillsDispensed,
    [property: JsonPropertyName("pills_remaining")] int PillsRemaining,
    [property: JsonPropertyName("scheduled_time")] DateTime? ScheduledTime
);

/// <summary>Data for DOSE_TAKEN event</summary>
public record DoseTakenData(
    [property: JsonPropertyName("medication")] string Medication,
    [property: JsonPropertyName("pills_taken")] int PillsTaken,
    [property: JsonPropertyName("seconds_to_take")] int? SecondsToTake,
    [property: JsonPropertyName("on_time")] bool OnTime
);

/// <summary>Data for DOSE_MISSED event</summary>
public record DoseMissedData(
    [property: JsonPropertyName("medication")] string Medication,
    [property: JsonPropertyName("scheduled_time")] DateTime ScheduledTime,
    [property: JsonPropertyName("pills_not_taken")] int? PillsNotTaken
);

/// <summary>Data for REFILL_NEEDED event</summary>
public record RefillNeededData(
    [property: JsonPropertyName("medication")] string Medication,
    [property: JsonPropertyName("slot")] int Slot,
    [property: JsonPropertyName("pills_remaining")] int PillsRemaining,
    [property: JsonPropertyName("days_remaining")] int DaysRemaining,
    [property: JsonPropertyName("daily_usage")] int? DailyUsage
);

/// <summary>Data for DEVICE_ONLINE event</summary>
public record DeviceOnlineData(
    [property: JsonPropertyName("firmware")] string Firmware,
    [property: JsonPropertyName("battery")] int? Battery,
    [property: JsonPropertyName("wifi_signal")] int? WifiSignal
);

/// <summary>Data for DEVICE_OFFLINE event</summary>
public record DeviceOfflineData(
    [property: JsonPropertyName("last_seen")] DateTime LastSeen,
    [property: JsonPropertyName("reason")] string? Reason
);

/// <summary>Data for DEVICE_ERROR event</summary>
public record DeviceErrorData(
    [property: JsonPropertyName("error_code")] string ErrorCode,
    [property: JsonPropertyName("error_type")] string ErrorType,
    [property: JsonPropertyName("slot")] int? Slot,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("severity")] string? Severity
);

/// <summary>Data for BATTERY_LOW event</summary>
public record BatteryLowData(
    [property: JsonPropertyName("battery_level")] int BatteryLevel,
    [property: JsonPropertyName("estimated_hours")] int? EstimatedHours
);

/// <summary>Data for TRAVEL_MODE_ON event</summary>
public record TravelModeOnData(
    [property: JsonPropertyName("portable_device_id")] string PortableDeviceId,
    [property: JsonPropertyName("medications_transferred")] List<string> MedicationsTransferred,
    [property: JsonPropertyName("days_loaded")] int DaysLoaded
);

/// <summary>Data for TRAVEL_MODE_OFF event</summary>
public record TravelModeOffData(
    [property: JsonPropertyName("portable_device_id")] string PortableDeviceId,
    [property: JsonPropertyName("days_away")] int DaysAway,
    [property: JsonPropertyName("doses_taken")] int DosesTaken,
    [property: JsonPropertyName("doses_missed")] int DosesMissed
);

// ============================================
// Heartbeat
// ============================================

/// <summary>Slot status in heartbeat</summary>
public record HeartbeatSlot(
    [property: JsonPropertyName("slot")] int Slot,
    [property: JsonPropertyName("medication")] string? Medication,
    [property: JsonPropertyName("pills")] int Pills
);

/// <summary>Heartbeat payload from device (every 60 seconds)</summary>
public record HeartbeatPayload(
    [property: JsonPropertyName("device_id")] string DeviceId,
    [property: JsonPropertyName("timestamp")] DateTime? Timestamp,
    [property: JsonPropertyName("battery")] int? Battery,
    [property: JsonPropertyName("wifi_signal")] int? WifiSignal,
    [property: JsonPropertyName("temperature")] decimal? Temperature,
    [property: JsonPropertyName("humidity")] int? Humidity,
    [property: JsonPropertyName("firmware")] string? Firmware,
    [property: JsonPropertyName("slots")] List<HeartbeatSlot>? Slots
);

// ============================================
// Device Registration
// ============================================

/// <summary>Device registration request</summary>
public record DeviceRegistrationRequest(
    [property: JsonPropertyName("device_id")] string DeviceId,
    [property: JsonPropertyName("device_type")] string DeviceType,
    [property: JsonPropertyName("firmware_version")] string? FirmwareVersion,
    [property: JsonPropertyName("hardware_version")] string? HardwareVersion,
    [property: JsonPropertyName("mac_address")] string? MacAddress
);

/// <summary>Device registration response</summary>
public record DeviceRegistrationResponse(
    [property: JsonPropertyName("success")] bool Success,
    [property: JsonPropertyName("device_token")] string? DeviceToken,
    [property: JsonPropertyName("token_expires_at")] DateTime? TokenExpiresAt,
    [property: JsonPropertyName("api_endpoint")] string? ApiEndpoint,
    [property: JsonPropertyName("heartbeat_interval")] int HeartbeatInterval
);

// ============================================
// Schedule
// ============================================

/// <summary>Medication schedule item</summary>
public record ScheduleItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("medication")] string Medication,
    [property: JsonPropertyName("slot")] int Slot,
    [property: JsonPropertyName("pills")] int Pills,
    [property: JsonPropertyName("times")] List<string> Times,
    [property: JsonPropertyName("days")] List<string> Days
);

/// <summary>Device schedule response</summary>
public record DeviceScheduleResponse(
    [property: JsonPropertyName("schedules")] List<ScheduleItem> Schedules
);

// ============================================
// Firmware Update
// ============================================

/// <summary>Firmware update check response</summary>
public record FirmwareUpdateResponse(
    [property: JsonPropertyName("update_available")] bool UpdateAvailable,
    [property: JsonPropertyName("current_version")] string CurrentVersion,
    [property: JsonPropertyName("new_version")] string? NewVersion,
    [property: JsonPropertyName("download_url")] string? DownloadUrl,
    [property: JsonPropertyName("checksum")] string? Checksum,
    [property: JsonPropertyName("size_bytes")] long? SizeBytes,
    [property: JsonPropertyName("release_notes")] string? ReleaseNotes,
    [property: JsonPropertyName("mandatory")] bool Mandatory
);

/// <summary>Firmware update status report from device</summary>
public record FirmwareUpdateStatusRequest(
    [property: JsonPropertyName("status")] string Status,  // downloading, verifying, installing, completed, failed
    [property: JsonPropertyName("version")] string Version,
    [property: JsonPropertyName("progress")] int? Progress,  // 0-100
    [property: JsonPropertyName("error")] string? Error
);

/// <summary>Schedule confirmation from device</summary>
public record ScheduleConfirmRequest(
    [property: JsonPropertyName("schedule_version")] string ScheduleVersion,
    [property: JsonPropertyName("schedule_count")] int ScheduleCount
);

