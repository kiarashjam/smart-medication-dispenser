namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>Outgoing webhook: URL to POST when events occur (dispense confirmed, missed dose, low stock). Optional secret for HMAC signature.</summary>
public class WebhookEndpoint
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    /// <summary>Optional secret for X-Webhook-Signature (HMAC-SHA256).</summary>
    public string? Secret { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
    public DateTime? LastTriggeredAtUtc { get; set; }
    public string? LastStatus { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
