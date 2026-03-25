namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>API key for a device: allows cloud or hardware to call webhook/sync endpoints without user JWT.</summary>
public class DeviceApiKey
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    /// <summary>SHA256 hash of the API key (plain key shown only once on create).</summary>
    public string KeyHash { get; set; } = string.Empty;
    public string? Name { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastUsedAtUtc { get; set; }
}
