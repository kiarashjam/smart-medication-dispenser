namespace SmartMedicationDispenser.Application.DTOs;

/// <summary>User notification preferences (stored as JSON in a user setting or similar).
/// For MVP these are returned and updated without a separate DB table.</summary>
public record NotificationPreferencesDto(
    bool MissedDoseAlerts = true,
    bool LowStockWarnings = true,
    bool DeviceOfflineAlerts = true,
    bool DailySummary = false,
    bool CaregiverUpdates = true,
    bool EmailNotifications = false,
    bool PushNotifications = true
);
