using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>
/// Physical dispenser device (main or portable). Owned by a user; has containers and dispense events.
/// Matches documentation in technical-docs/01_DEVICE_HARDWARE.md
/// </summary>
public class Device
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public DeviceType Type { get; set; }
    public DeviceStatus Status { get; set; }
    public string? TimeZoneId { get; set; }
    public DateTime? LastHeartbeatAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    // Hardware Info (from registration & heartbeat)
    public string? FirmwareVersion { get; set; }
    public string? HardwareVersion { get; set; }
    public string? MacAddress { get; set; }
    
    // Status Info (from heartbeat)
    public int? BatteryLevel { get; set; }  // Percentage 0-100 (portable devices)
    public int? WifiSignal { get; set; }    // dBm (-30 to -90)
    public decimal? Temperature { get; set; } // Celsius
    public int? Humidity { get; set; }       // Percentage 0-100
    
    // Connection State
    public bool IsOnline { get; set; }
    public DateTime? LastOnlineAtUtc { get; set; }
    public DateTime? LastOfflineAtUtc { get; set; }
    public string? LastErrorCode { get; set; }
    public string? LastErrorMessage { get; set; }

    public ICollection<Container> Containers { get; set; } = new List<Container>();
    public ICollection<DispenseEvent> DispenseEvents { get; set; } = new List<DispenseEvent>();
    public ICollection<DeviceApiKey> ApiKeys { get; set; } = new List<DeviceApiKey>();
    public TravelSession? ActiveTravelSession { get; set; }
}
