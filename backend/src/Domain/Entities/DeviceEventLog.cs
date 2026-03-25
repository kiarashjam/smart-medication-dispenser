using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>
/// Log of events received from devices.
/// Matches documentation in technical-docs/03_DATA_FORMATS.md
/// </summary>
public class DeviceEventLog
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    
    /// <summary>Event type: DOSE_DISPENSED, DOSE_TAKEN, DOSE_MISSED, etc.</summary>
    public DeviceEventType EventType { get; set; }
    
    /// <summary>Timestamp when event occurred on device</summary>
    public DateTime EventTimestampUtc { get; set; }
    
    /// <summary>Timestamp when event was received by API</summary>
    public DateTime ReceivedAtUtc { get; set; }
    
    /// <summary>JSON data payload from event</summary>
    public string? DataJson { get; set; }
    
    /// <summary>Whether this event was processed successfully</summary>
    public bool Processed { get; set; }
    
    /// <summary>Error message if processing failed</summary>
    public string? ProcessingError { get; set; }
}
