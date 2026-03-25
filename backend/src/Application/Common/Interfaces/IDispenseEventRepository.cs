using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface IDispenseEventRepository
{
    Task<DispenseEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DispenseEvent> AddAsync(DispenseEvent evt, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DispenseEvent>> GetByDeviceIdAsync(Guid deviceId, DateTime? fromUtc, DateTime? toUtc, int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DispenseEvent>> GetPendingDispensedEventsOlderThanAsync(DateTime thresholdUtc, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DispenseEvent>> GetByUserIdAsync(Guid userId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default);
}
