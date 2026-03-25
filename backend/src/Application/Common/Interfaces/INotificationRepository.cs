using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface INotificationRepository
{
    Task<Notification> AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Notification>> GetByUserIdAsync(Guid userId, int limit, CancellationToken cancellationToken = default);
    Task<bool> HasUnreadLowStockForContainerAsync(Guid userId, Guid containerId, CancellationToken cancellationToken = default);
}
