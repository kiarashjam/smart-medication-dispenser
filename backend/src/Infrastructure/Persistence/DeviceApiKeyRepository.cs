using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class DeviceApiKeyRepository : IDeviceApiKeyRepository
{
    private readonly AppDbContext _db;

    public DeviceApiKeyRepository(AppDbContext db) => _db = db;

    public async Task<DeviceApiKey?> FindByKeyHashAsync(string keyHash, CancellationToken cancellationToken = default) =>
        await _db.DeviceApiKeys.Include(k => k.Device).FirstOrDefaultAsync(k => k.KeyHash == keyHash, cancellationToken);

    public async Task<IReadOnlyList<DeviceApiKey>> GetByDeviceIdAsync(Guid deviceId, CancellationToken cancellationToken = default) =>
        await _db.DeviceApiKeys.Where(k => k.DeviceId == deviceId).ToListAsync(cancellationToken);

    public async Task<DeviceApiKey> AddAsync(DeviceApiKey apiKey, CancellationToken cancellationToken = default)
    {
        _db.DeviceApiKeys.Add(apiKey);
        return apiKey;
    }

    public async Task UpdateLastUsedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var k = await _db.DeviceApiKeys.FindAsync(new object[] { id }, cancellationToken);
        if (k != null) k.LastUsedAtUtc = DateTime.UtcNow;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid deviceId, CancellationToken cancellationToken = default)
    {
        var k = await _db.DeviceApiKeys.FirstOrDefaultAsync(x => x.Id == id && x.DeviceId == deviceId, cancellationToken);
        if (k == null) return false;
        _db.DeviceApiKeys.Remove(k);
        return true;
    }
}
