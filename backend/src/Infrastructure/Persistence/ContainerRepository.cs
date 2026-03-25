using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class ContainerRepository : IContainerRepository
{
    private readonly AppDbContext _db;

    public ContainerRepository(AppDbContext db) => _db = db;

    public async Task<Container?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Containers.FindAsync(new object[] { id }, cancellationToken);

    public async Task<Container?> GetByIdWithSchedulesAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Containers.Include(c => c.Schedules).FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Container>> GetByDeviceIdAsync(Guid deviceId, CancellationToken cancellationToken = default) =>
        await _db.Containers.Where(c => c.DeviceId == deviceId).OrderBy(c => c.SlotNumber).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Container>> GetLowStockContainersAsync(CancellationToken cancellationToken = default) =>
        await _db.Containers.Include(c => c.Device).Where(c => c.Quantity <= c.LowStockThreshold).ToListAsync(cancellationToken);

    public async Task<Container> AddAsync(Container container, CancellationToken cancellationToken = default)
    {
        _db.Containers.Add(container);
        return container;
    }

    public Task DeleteAsync(Container container, CancellationToken cancellationToken = default)
    {
        _db.Containers.Remove(container);
        return Task.CompletedTask;
    }
}
