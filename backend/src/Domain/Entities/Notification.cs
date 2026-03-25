using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>In-app notification for user (e.g. missed dose, low stock). Optional related entity ID.</summary>
public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid? RelatedEntityId { get; set; }
}
