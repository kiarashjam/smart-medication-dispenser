using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class DeviceEventLogRepository : IDeviceEventLogRepository
{
    private readonly AppDbContext _db;

    public DeviceEventLogRepository(AppDbContext db) => _db = db;

    public async Task<DeviceEventLog> AddAsync(DeviceEventLog log, CancellationToken cancellationToken = default)
    {
        _db.DeviceEventLogs.Add(log);
        return log;
    }

    public async Task<IReadOnlyList<DeviceEventLog>> GetByDeviceIdAsync(Guid deviceId, int limit = 100, CancellationToken cancellationToken = default) =>
        await _db.DeviceEventLogs
            .Where(e => e.DeviceId == deviceId)
            .OrderByDescending(e => e.ReceivedAtUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<DeviceEventLog>> GetUnprocessedAsync(int limit = 50, CancellationToken cancellationToken = default) =>
        await _db.DeviceEventLogs
            .Where(e => !e.Processed)
            .OrderBy(e => e.ReceivedAtUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<int> PurgeOlderThanAsync(DateTime cutoffUtc, CancellationToken cancellationToken = default) =>
        await _db.DeviceEventLogs
            .Where(e => e.ReceivedAtUtc < cutoffUtc && e.Processed)
            .ExecuteDeleteAsync(cancellationToken);
}
