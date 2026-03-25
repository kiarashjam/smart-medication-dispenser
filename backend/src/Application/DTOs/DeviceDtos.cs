namespace SmartMedicationDispenser.Application.DTOs;

/// <summary>
/// Device API DTOs - matches technical-docs/01_DEVICE_HARDWARE.md
/// Each device has its own Id; UserId is the owning user (one user can own multiple devices).
/// </summary>

// Basic device info
public record DeviceDto(
    Guid Id, 
    Guid UserId, 
    string Name, 
    string Type, 
    string Status, 
    string? TimeZoneId, 
    DateTime? LastHeartbeatAtUtc,
    // New fields from reports
    string? FirmwareVersion,
    bool IsOnline,
    int? BatteryLevel,
    int? WifiSignal,
    decimal? Temperature,
    int? Humidity
);

// Full device details with health status
public record DeviceDetailDto(
    Guid Id,
    Guid UserId,
    string Name,
    string Type,
    string Status,
    string? TimeZoneId,
    DateTime? LastHeartbeatAtUtc,
    string? FirmwareVersion,
    string? HardwareVersion,
    string? MacAddress,
    bool IsOnline,
    int? BatteryLevel,
    int? WifiSignal,
    decimal? Temperature,
    int? Humidity,
    DateTime? LastOnlineAtUtc,
    DateTime? LastOfflineAtUtc,
    string? LastErrorCode,
    string? LastErrorMessage,
    DateTime CreatedAtUtc,
    List<ContainerSlotDto>? Containers
);

// Container/slot summary
public record ContainerSlotDto(
    int SlotNumber,
    string? MedicationName,
    int PillsRemaining,
    int Capacity,
    int LowStockThreshold,
    string Status // ok, low, critical, empty
);

// Create device request
public record CreateDeviceRequest(
    string Name, 
    string Type, 
    string? TimeZoneId
);

// Update device request
public record UpdateDeviceRequest(
    string? Name, 
    string? TimeZoneId
);

// Device health summary (for dashboard)
public record DeviceHealthDto(
    Guid DeviceId,
    string DeviceName,
    bool IsOnline,
    DateTime? LastHeartbeat,
    int? BatteryLevel,
    int? WifiSignal,
    int SlotsTotal,
    int SlotsLow,
    int SlotsCritical,
    int SlotsEmpty,
    int? PendingDoses,
    int? MissedDosesToday
);
