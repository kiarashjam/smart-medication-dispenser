using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class DispenseEventRepository : IDispenseEventRepository
{
    private readonly AppDbContext _db;

    public DispenseEventRepository(AppDbContext db) => _db = db;

    public async Task<DispenseEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.DispenseEvents.Include(e => e.Container).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<DispenseEvent> AddAsync(DispenseEvent evt, CancellationToken cancellationToken = default)
    {
        _db.DispenseEvents.Add(evt);
        return evt;
    }

    public async Task<IReadOnlyList<DispenseEvent>> GetByDeviceIdAsync(Guid deviceId, DateTime? fromUtc, DateTime? toUtc, int limit, CancellationToken cancellationToken = default)
    {
        var q = _db.DispenseEvents.Include(e => e.Container).Where(e => e.DeviceId == deviceId);
        if (fromUtc.HasValue) q = q.Where(e => e.ScheduledAtUtc >= fromUtc.Value);
        if (toUtc.HasValue) q = q.Where(e => e.ScheduledAtUtc <= toUtc.Value);
        return await q.OrderByDescending(e => e.ScheduledAtUtc).Take(limit).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DispenseEvent>> GetPendingDispensedEventsOlderThanAsync(DateTime thresholdUtc, CancellationToken cancellationToken = default) =>
        await _db.DispenseEvents
            .Where(e => e.Status == DispenseEventStatus.Dispensed && e.DispensedAtUtc != null && e.DispensedAtUtc.Value < thresholdUtc)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<DispenseEvent>> GetByUserIdAsync(Guid userId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default) =>
        await _db.DispenseEvents
            .Include(e => e.Container)
            .Where(e => e.Device!.UserId == userId && e.ScheduledAtUtc >= fromUtc && e.ScheduledAtUtc <= toUtc)
            .ToListAsync(cancellationToken);
}
