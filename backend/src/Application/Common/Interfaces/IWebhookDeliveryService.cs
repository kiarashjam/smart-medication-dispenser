namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>Delivers outgoing webhook payloads to configured URLs (with optional HMAC signature).</summary>
public interface IWebhookDeliveryService
{
    /// <summary>POST JSON payload to URL; optionally sign with secret. Returns status code or null on failure.</summary>
    Task<int?> SendAsync(string url, object payload, string? secret, CancellationToken cancellationToken = default);
}
