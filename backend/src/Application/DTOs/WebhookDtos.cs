namespace SmartMedicationDispenser.Application.DTOs;

// Outgoing webhook endpoint (user-configured).
public record WebhookEndpointDto(Guid Id, string Url, bool IsActive, string? Description, DateTime? LastTriggeredAtUtc, string? LastStatus, DateTime CreatedAtUtc);
public record CreateWebhookEndpointRequest(string Url, string? Secret, string? Description);
public record UpdateWebhookEndpointRequest(string? Url, string? Secret, bool? IsActive, string? Description);

// Incoming webhook payload (from cloud/dispenser).
public record IncomingWebhookPayload(string EventType, string? DeviceId, object? Data);
// EventType: "heartbeat", "dispense_completed", "low_stock", "device_status", "sync"

// Sync payload (bulk data from cloud).
public record SyncRequest(string DeviceId, SyncDeviceStatus? Device, List<SyncDispenseEventDto>? Events, List<SyncContainerDto>? Containers);
public record SyncDeviceStatus(string? Status, string? TimeZoneId, DateTime? LastHeartbeatAtUtc);
public record SyncDispenseEventDto(string? Id, string ContainerId, string ScheduleId, DateTime ScheduledAtUtc, string Status, DateTime? DispensedAtUtc, DateTime? ConfirmedAtUtc);
public record SyncContainerDto(string? Id, int SlotNumber, string MedicationName, int Quantity, int PillsPerDose, int LowStockThreshold);
