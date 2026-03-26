using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>
/// Resolves which device owners (patient user IDs) an authenticated user may access.
/// Patients: own devices only. Caregivers: devices owned by assigned patients.
/// </summary>
public interface IDeviceAccessService
{
    Task<IReadOnlyList<Guid>> GetAccessibleDeviceOwnerUserIdsAsync(Guid actingUserId, CancellationToken cancellationToken = default);

    Task<bool> CanAccessDeviceAsync(Guid actingUserId, Guid deviceId, CancellationToken cancellationToken = default);

    Task<bool> IsCaregiverForPatientAsync(Guid caregiverUserId, Guid patientUserId, CancellationToken cancellationToken = default);

    /// <summary>Returns the device if the acting user may access it; otherwise null.</summary>
    Task<Device?> GetDeviceIfAccessibleAsync(Guid actingUserId, Guid deviceId, CancellationToken cancellationToken = default);
}
