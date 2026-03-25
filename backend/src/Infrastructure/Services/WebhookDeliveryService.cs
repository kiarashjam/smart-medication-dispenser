using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Infrastructure.Services;

/// <summary>POSTs JSON to webhook URL with optional X-Webhook-Signature (HMAC-SHA256).</summary>
public class WebhookDeliveryService : IWebhookDeliveryService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookDeliveryService> _logger;

    public WebhookDeliveryService(IHttpClientFactory httpClientFactory, ILogger<WebhookDeliveryService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<int?> SendAsync(string url, object payload, string? secret, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        if (!string.IsNullOrWhiteSpace(secret))
        {
            var signature = ComputeHmacSha256(json, secret);
            request.Headers.TryAddWithoutValidation("X-Webhook-Signature", "sha256=" + signature);
        }
        request.Headers.TryAddWithoutValidation("X-Webhook-Event", "dispenser.event");
        request.Headers.TryAddWithoutValidation("User-Agent", "SmartMedicationDispenser/1.0");
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            var response = await client.SendAsync(request, cancellationToken);
            _logger.LogInformation("Webhook POST {Url} -> {StatusCode}", url, response.StatusCode);
            return (int)response.StatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Webhook POST failed: {Url}", url);
            return null;
        }
    }

    private static string ComputeHmacSha256(string data, string secret)
    {
        var bytes = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
