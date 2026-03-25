using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class TravelSessionRepository : ITravelSessionRepository
{
    private readonly AppDbContext _db;

    public TravelSessionRepository(AppDbContext db) => _db = db;

    public async Task<TravelSession?> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _db.TravelSessions.FirstOrDefaultAsync(t => t.UserId == userId && t.EndedAtUtc == null, cancellationToken);

    public async Task<TravelSession> AddAsync(TravelSession session, CancellationToken cancellationToken = default)
    {
        _db.TravelSessions.Add(session);
        return session;
    }
}
