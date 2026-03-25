namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Travel mode session: links portable device to main device for a planned period.</summary>
public class TravelSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid MainDeviceId { get; set; }
    public Device MainDevice { get; set; } = null!;
    public Guid PortableDeviceId { get; set; }
    public Device PortableDevice { get; set; } = null!;
    public DateTime StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }
    public DateTime PlannedEndDateUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
