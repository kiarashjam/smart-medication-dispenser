using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Common.Services;

public class DeviceAccessService : IDeviceAccessService
{
    private readonly IUserRepository _users;
    private readonly IDeviceRepository _devices;

    public DeviceAccessService(IUserRepository users, IDeviceRepository devices)
    {
        _users = users;
        _devices = devices;
    }

    public async Task<IReadOnlyList<Guid>> GetAccessibleDeviceOwnerUserIdsAsync(Guid actingUserId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(actingUserId, cancellationToken);
        if (user == null)
            return Array.Empty<Guid>();

        return user.Role switch
        {
            UserRole.Patient => new[] { user.Id },
            UserRole.Caregiver => (await _users.GetPatientsByCaregiverIdAsync(user.Id, cancellationToken)).Select(p => p.Id).ToList(),
            _ => new[] { user.Id }
        };
    }

    public async Task<bool> CanAccessDeviceAsync(Guid actingUserId, Guid deviceId, CancellationToken cancellationToken = default)
    {
        var device = await _devices.GetByIdAsync(deviceId, cancellationToken);
        if (device == null)
            return false;
        var owners = await GetAccessibleDeviceOwnerUserIdsAsync(actingUserId, cancellationToken);
        return owners.Contains(device.UserId);
    }

    public async Task<bool> IsCaregiverForPatientAsync(Guid caregiverUserId, Guid patientUserId, CancellationToken cancellationToken = default)
    {
        var patient = await _users.GetByIdAsync(patientUserId, cancellationToken);
        return patient != null && patient.CaregiverUserId == caregiverUserId;
    }

    public async Task<Device?> GetDeviceIfAccessibleAsync(Guid actingUserId, Guid deviceId, CancellationToken cancellationToken = default)
    {
        var device = await _devices.GetByIdAsync(deviceId, cancellationToken);
        if (device == null)
            return null;
        return await CanAccessDeviceAsync(actingUserId, deviceId, cancellationToken) ? device : null;
    }
}
