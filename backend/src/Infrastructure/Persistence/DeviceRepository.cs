using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class DeviceRepository : IDeviceRepository
{
    private readonly AppDbContext _db;

    public DeviceRepository(AppDbContext db) => _db = db;

    public async Task<Device?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Devices.FindAsync(new object[] { id }, cancellationToken);

    public async Task<Device?> GetByIdWithContainersAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Devices.Include(d => d.Containers).FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<Device?> GetByIdWithContainersAndSchedulesAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Devices
            .Include(d => d.Containers)
            .ThenInclude(c => c.Schedules)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Device>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _db.Devices.Where(d => d.UserId == userId).ToListAsync(cancellationToken);

    public async Task<Device> AddAsync(Device device, CancellationToken cancellationToken = default)
    {
        _db.Devices.Add(device);
        return device;
    }
}
