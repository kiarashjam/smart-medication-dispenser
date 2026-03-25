namespace SmartMedicationDispenser.Domain.Enums;

/// <summary>Lifecycle of a dispense: Pending, Dispensed, Confirmed, Missed, or Delayed.</summary>
public enum DispenseEventStatus
{
    Pending = 0,
    Dispensed = 1,
    Confirmed = 2,
    Missed = 3,
    Delayed = 4
}
