using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Application.Integrations;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Incoming webhooks from cloud or dispenser hardware. Authenticate with X-API-Key header (device API key).</summary>
[ApiController]
[Route("api/webhooks")]
public class WebhooksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDeviceApiKeyResolver _apiKeyResolver;

    public WebhooksController(IMediator mediator, IDeviceApiKeyResolver apiKeyResolver)
    {
        _mediator = mediator;
        _apiKeyResolver = apiKeyResolver;
    }

    /// <summary>Receive webhook from external system. Send X-API-Key header. Body: { "eventType": "heartbeat"|"dispense_completed"|"low_stock"|"device_status", "deviceId": "optional override", "data": { } }.</summary>
    [HttpPost("incoming")]
    public async Task<ActionResult> Incoming([FromBody] IncomingWebhookPayload payload, CancellationToken ct)
    {
        var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
        var deviceId = await _apiKeyResolver.ResolveDeviceIdFromApiKeyAsync(apiKey, ct);
        if (!deviceId.HasValue)
            return Unauthorized(new { message = "Invalid or missing X-API-Key." });

        var resolvedDeviceId = payload.DeviceId != null && Guid.TryParse(payload.DeviceId, out var fromBody) ? fromBody : deviceId.Value;
        if (resolvedDeviceId != deviceId.Value)
            return Forbid();

        var ok = await _mediator.Send(new ProcessIncomingWebhookCommand(resolvedDeviceId, payload), ct);
        if (!ok) return BadRequest(new { message = "Unknown event type or processing failed." });
        return Accepted();
    }
}
