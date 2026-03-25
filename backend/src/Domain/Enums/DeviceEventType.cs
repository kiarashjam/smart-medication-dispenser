namespace SmartMedicationDispenser.Domain.Enums;

/// <summary>
/// Types of events sent from device to API.
/// Matches documentation in technical-docs/03_DATA_FORMATS.md
/// </summary>
public enum DeviceEventType
{
    /// <summary>Pills dropped to tray</summary>
    DoseDispensed = 0,
    
    /// <summary>Patient took the pills (weight sensor confirmed)</summary>
    DoseTaken = 1,
    
    /// <summary>30 minutes passed, pills not taken</summary>
    DoseMissed = 2,
    
    /// <summary>Less than 7 days of pills left</summary>
    RefillNeeded = 3,
    
    /// <summary>Less than 3 days of pills left</summary>
    RefillCritical = 4,
    
    /// <summary>Device connected to internet</summary>
    DeviceOnline = 5,
    
    /// <summary>Device lost connection</summary>
    DeviceOffline = 6,
    
    /// <summary>Hardware or software error</summary>
    DeviceError = 7,
    
    /// <summary>Battery below 20% (travel device)</summary>
    BatteryLow = 8,
    
    /// <summary>Battery below 5% (travel device)</summary>
    BatteryCritical = 9,
    
    /// <summary>Travel mode activated</summary>
    TravelModeOn = 10,
    
    /// <summary>Travel mode deactivated</summary>
    TravelModeOff = 11,
    
    /// <summary>Regular heartbeat (every 60 seconds)</summary>
    Heartbeat = 12
}
