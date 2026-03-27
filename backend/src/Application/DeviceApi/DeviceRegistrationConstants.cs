namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Well-known user row for devices registered via POST /api/v1/devices/register before a patient claims them.</summary>
public static class DeviceRegistrationConstants
{
    public static readonly Guid UnassignedOwnerUserId = new("a0000000-0000-0000-0000-000000000001");
    public const string UnassignedOwnerEmail = "device-registration-pool@system.internal";
}
