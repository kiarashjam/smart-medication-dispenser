namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Recurring dose schedule: time of day, days of week (bitmask), and optional date range.</summary>
public class Schedule
{
    public Guid Id { get; set; }
    public Guid ContainerId { get; set; }
    public Container Container { get; set; } = null!;
    public TimeOnly TimeOfDay { get; set; }
    public int DaysOfWeekBitmask { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }
    public string? TimeZoneId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<DispenseEvent> DispenseEvents { get; set; } = new List<DispenseEvent>();
}
