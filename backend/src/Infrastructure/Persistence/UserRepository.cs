using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Users.FindAsync(new object[] { id }, cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _db.Users.Add(user);
        return user;
    }

    public async Task<IReadOnlyList<User>> GetPatientsByCaregiverIdAsync(Guid caregiverId, CancellationToken cancellationToken = default) =>
        await _db.Users.Where(u => u.CaregiverUserId == caregiverId).ToListAsync(cancellationToken);

    public async Task<bool> ExistsWithEmailAsync(string email, CancellationToken cancellationToken = default) =>
        await _db.Users.AnyAsync(u => u.Email == email, cancellationToken);
}
