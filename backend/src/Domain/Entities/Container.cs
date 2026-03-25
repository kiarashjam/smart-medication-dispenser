namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Medication slot on a device (one medication per slot). Can reference a source container for travel copies.</summary>
public class Container
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public int SlotNumber { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string? MedicationImageUrl { get; set; }
    public int Quantity { get; set; }
    public int PillsPerDose { get; set; }
    public int LowStockThreshold { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public Guid? SourceContainerId { get; set; }
    public Container? SourceContainer { get; set; }
    public ICollection<Container> PortableCopies { get; set; } = new List<Container>();

    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<DispenseEvent> DispenseEvents { get; set; } = new List<DispenseEvent>();
}
