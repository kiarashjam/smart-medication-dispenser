using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _db;

    public NotificationRepository(AppDbContext db) => _db = db;

    public async Task<Notification> AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        _db.Notifications.Add(notification);
        return notification;
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.Notifications.FindAsync(new object[] { id }, cancellationToken);

    public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(Guid userId, int limit, CancellationToken cancellationToken = default) =>
        await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);

    public async Task<bool> HasUnreadLowStockForContainerAsync(Guid userId, Guid containerId, CancellationToken cancellationToken = default) =>
        await _db.Notifications.AnyAsync(
            n => n.UserId == userId && n.Type == NotificationType.LowStock && !n.IsRead && n.RelatedEntityId == containerId,
            cancellationToken);
}
