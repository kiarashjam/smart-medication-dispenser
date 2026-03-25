namespace SmartMedicationDispenser.Domain.Enums;

/// <summary>
/// Notification kind - matches technical-docs/03_DATA_FORMATS.md
/// </summary>
public enum NotificationType
{
    MissedDose = 0,
    LowStock = 1,
    TravelStarted = 2,
    TravelEnded = 3,
    General = 4,
    // New types from reports
    DoseDispensed = 5,
    DoseTaken = 6,
    RefillCritical = 7,
    DeviceOnline = 8,
    DeviceOffline = 9,
    DeviceError = 10,
    DeviceStatus = 11,
    BatteryLow = 12,
    BatteryCritical = 13
}
