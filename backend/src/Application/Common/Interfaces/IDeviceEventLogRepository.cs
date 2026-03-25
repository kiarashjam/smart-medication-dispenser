using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>Raw device event/telemetry storage and queries.</summary>
public interface IDeviceEventLogRepository
{
    Task<DeviceEventLog> AddAsync(DeviceEventLog log, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeviceEventLog>> GetByDeviceIdAsync(Guid deviceId, int limit = 100, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeviceEventLog>> GetUnprocessedAsync(int limit = 50, CancellationToken cancellationToken = default);
    Task<int> PurgeOlderThanAsync(DateTime cutoffUtc, CancellationToken cancellationToken = default);
}
