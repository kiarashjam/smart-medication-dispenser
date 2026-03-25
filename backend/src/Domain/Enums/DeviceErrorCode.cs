namespace SmartMedicationDispenser.Domain.Enums;

/// <summary>
/// Error codes from device.
/// Matches documentation in software-docs/13_ERROR_CODES_REFERENCE.md
/// </summary>
public static class DeviceErrorCode
{
    // ═══════════════════════════════════════════
    // Network errors (E001-E099)
    // ═══════════════════════════════════════════
    public const string NetworkWifiDisconnected = "E001";
    public const string NetworkApiUnreachable = "E002";
    public const string NetworkAuthFailed = "E003";
    public const string NetworkApiTimeout = "E004";
    public const string NetworkDnsFailed = "E005";
    public const string NetworkTlsFailed = "E006";
    public const string NetworkRateLimited = "E007";
    public const string NetworkCellularNoSignal = "E010";
    public const string NetworkCellularNoData = "E011";
    public const string NetworkCellularRoaming = "E012";

    // ═══════════════════════════════════════════
    // Hardware errors (E101-E199)
    // ═══════════════════════════════════════════
    public const string HardwarePillJam = "E101";
    public const string HardwareMotorFailure = "E102";
    public const string HardwareMotorOvercurrent = "E103";
    public const string HardwareSensorFailure = "E104";
    public const string HardwareTrayNotDetected = "E105";
    public const string HardwareTrayFull = "E106";
    public const string HardwareSlotEmpty = "E107";
    public const string HardwareSlotSensorBlocked = "E108";
    public const string HardwareDisplayFailure = "E109";
    public const string HardwareTouchFailure = "E110";
    public const string HardwareSpeakerFailure = "E111";
    public const string HardwareButtonStuck = "E112";
    public const string HardwareCarouselMisaligned = "E120";
    public const string HardwareGateStuckOpen = "E121";
    public const string HardwareGateStuckClosed = "E122";

    // ═══════════════════════════════════════════
    // Power errors (E201-E299)
    // ═══════════════════════════════════════════
    public const string PowerBatteryLow = "E201";
    public const string PowerBatteryCritical = "E202";
    public const string PowerAcLost = "E203";
    public const string PowerBatteryNotCharging = "E204";
    public const string PowerBatteryOvertemp = "E205";
    public const string PowerBatteryUndertemp = "E206";
    public const string PowerChargerFault = "E207";
    public const string PowerUpsBatteryLow = "E210";

    // ═══════════════════════════════════════════
    // Storage / Environmental errors (E301-E399)
    // ═══════════════════════════════════════════
    public const string StorageLocalFull = "E301";
    public const string StorageTempOutOfRange = "E302";
    public const string StorageHumidityOutOfRange = "E303";
    public const string StorageSdCardError = "E304";
    public const string StorageSdCardFull = "E305";
    public const string StorageSdCardMissing = "E306";

    // ═══════════════════════════════════════════
    // Software errors (E501-E599)
    // ═══════════════════════════════════════════
    public const string SoftwareFirmwareCorrupt = "E501";
    public const string SoftwareConfigCorrupt = "E502";
    public const string SoftwareScheduleSyncFailed = "E503";
    public const string SoftwareOtaFailed = "E504";
    public const string SoftwareWatchdogReset = "E505";
    public const string SoftwareOutOfMemory = "E506";
    public const string SoftwareTaskCrash = "E507";

    /// <summary>
    /// Determines the severity level for a given error code.
    /// </summary>
    public static string GetSeverity(string errorCode) => errorCode switch
    {
        "E001" => "warning",
        "E002" => "warning",
        "E003" => "error",
        "E004" => "warning",
        "E005" => "error",
        "E006" => "critical",
        "E007" => "info",
        "E010" => "warning",
        "E011" => "warning",
        "E012" => "info",

        "E101" => "warning",
        "E102" => "error",
        "E103" => "critical",
        "E104" => "error",
        "E105" => "warning",
        "E106" => "warning",
        "E107" => "warning",
        "E108" => "error",
        "E109" => "error",
        "E110" => "error",
        "E111" => "error",
        "E112" => "warning",
        "E120" => "error",
        "E121" => "error",
        "E122" => "error",

        "E201" => "warning",
        "E202" => "critical",
        "E203" => "warning",
        "E204" => "error",
        "E205" => "critical",
        "E206" => "warning",
        "E207" => "error",
        "E210" => "warning",

        "E301" => "warning",
        "E302" => "warning",
        "E303" => "warning",
        "E304" => "error",
        "E305" => "warning",
        "E306" => "warning",

        "E501" => "critical",
        "E502" => "error",
        "E503" => "error",
        "E504" => "error",
        "E505" => "error",
        "E506" => "critical",
        "E507" => "critical",

        _ => "warning"
    };

    /// <summary>
    /// Determines whether the error is critical and requires immediate notification.
    /// </summary>
    public static bool IsCritical(string errorCode) =>
        GetSeverity(errorCode) == "critical";
}
