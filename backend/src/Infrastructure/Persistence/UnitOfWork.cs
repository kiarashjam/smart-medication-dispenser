using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;

    public UnitOfWork(AppDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _db.SaveChangesAsync(cancellationToken);

    public ValueTask DisposeAsync() => _db.DisposeAsync();
}
