using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>API keys for devices (cloud/hardware integration).</summary>
public interface IDeviceApiKeyRepository
{
    Task<DeviceApiKey?> FindByKeyHashAsync(string keyHash, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeviceApiKey>> GetByDeviceIdAsync(Guid deviceId, CancellationToken cancellationToken = default);
    Task<DeviceApiKey> AddAsync(DeviceApiKey apiKey, CancellationToken cancellationToken = default);
    Task UpdateLastUsedAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, Guid deviceId, CancellationToken cancellationToken = default);
}
