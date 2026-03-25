using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Single dispense occurrence (scheduled, dispensed, confirmed, or missed).</summary>
public class DispenseEvent
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Device Device { get; set; } = null!;
    public Guid ContainerId { get; set; }
    public Container Container { get; set; } = null!;
    public Guid ScheduleId { get; set; }
    public Schedule Schedule { get; set; } = null!;
    public DateTime ScheduledAtUtc { get; set; }
    public DispenseEventStatus Status { get; set; }
    public DateTime? DispensedAtUtc { get; set; }
    public DateTime? ConfirmedAtUtc { get; set; }
    public DateTime? MissedMarkedAtUtc { get; set; }
    public DateTime? DelayedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
