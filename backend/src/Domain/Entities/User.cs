using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Application user (patient, caregiver, or admin). Has optional caregiver and owns devices and notifications.</summary>
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public Guid? CaregiverUserId { get; set; }
    public User? CaregiverUser { get; set; }
    public ICollection<User> Patients { get; set; } = new List<User>();

    public ICollection<Device> Devices { get; set; } = new List<Device>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<WebhookEndpoint> WebhookEndpoints { get; set; } = new List<WebhookEndpoint>();
}
