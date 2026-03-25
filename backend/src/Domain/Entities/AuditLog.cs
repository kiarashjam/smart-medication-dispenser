namespace SmartMedicationDispenser.Domain.Entities;

/// <summary>
/// Immutable audit log entry for tracking user/system actions.
/// Required for GDPR/nDSG compliance and security investigations.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }

    /// <summary>The user who performed the action (null for system actions).</summary>
    public Guid? UserId { get; set; }

    /// <summary>HTTP method + path (e.g. "POST /api/auth/login").</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Target entity type (e.g. "Device", "Container", "Schedule").</summary>
    public string? EntityType { get; set; }

    /// <summary>Target entity ID.</summary>
    public Guid? EntityId { get; set; }

    /// <summary>IP address of the requester.</summary>
    public string? IpAddress { get; set; }

    /// <summary>User agent string.</summary>
    public string? UserAgent { get; set; }

    /// <summary>HTTP status code of the response.</summary>
    public int StatusCode { get; set; }

    /// <summary>Request correlation ID for tracing.</summary>
    public string? CorrelationId { get; set; }

    /// <summary>When the action occurred (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; }
}
