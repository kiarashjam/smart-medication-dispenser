using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class ScheduleRepository : IScheduleRepository
{
    private readonly AppDbContext _db;

    public ScheduleRepository(AppDbContext db) => _db = db;

    public async Task<Schedule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Schedules.FindAsync(new object[] { id }, cancellationToken);

    public async Task<IReadOnlyList<Schedule>> GetByContainerIdAsync(Guid containerId, CancellationToken cancellationToken = default) =>
        await _db.Schedules.Where(s => s.ContainerId == containerId).ToListAsync(cancellationToken);

    public async Task<Schedule> AddAsync(Schedule schedule, CancellationToken cancellationToken = default)
    {
        _db.Schedules.Add(schedule);
        return schedule;
    }

    public Task DeleteAsync(Schedule schedule, CancellationToken cancellationToken = default)
    {
        _db.Schedules.Remove(schedule);
        return Task.CompletedTask;
    }
}
