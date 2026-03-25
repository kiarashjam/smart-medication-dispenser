using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface ITravelSessionRepository
{
    Task<TravelSession?> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<TravelSession> AddAsync(TravelSession session, CancellationToken cancellationToken = default);
}
