using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Application.Integrations;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Integrations: outgoing webhooks (CRUD), device API keys (create/list/revoke), and sync from cloud (X-API-Key).</summary>
[ApiController]
[Route("api/integrations")]
public class IntegrationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDeviceApiKeyResolver _apiKeyResolver;

    public IntegrationsController(IMediator mediator, IDeviceApiKeyResolver apiKeyResolver)
    {
        _mediator = mediator;
        _apiKeyResolver = apiKeyResolver;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    // ---------- Outgoing webhooks (JWT) ----------
    [Authorize]
    [HttpGet("webhooks")]
    public async Task<ActionResult<IReadOnlyList<WebhookEndpointDto>>> GetWebhooks(CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetWebhookEndpointsQuery(UserId.Value), ct);
        return Ok(list);
    }

    [Authorize]
    [HttpPost("webhooks")]
    public async Task<ActionResult<WebhookEndpointDto>> CreateWebhook([FromBody] CreateWebhookEndpointRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var result = await _mediator.Send(new CreateWebhookEndpointCommand(UserId.Value, request), ct);
        if (result == null) return BadRequest();
        return CreatedAtAction(nameof(GetWebhooks), result);
    }

    [Authorize]
    [HttpDelete("webhooks/{id:guid}")]
    public async Task<ActionResult> DeleteWebhook(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var ok = await _mediator.Send(new DeleteWebhookEndpointCommand(UserId.Value, id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ---------- Device API keys (JWT) ----------
    [Authorize]
    [HttpGet("devices/{deviceId:guid}/api-keys")]
    public async Task<ActionResult<IReadOnlyList<DeviceApiKeyDto>>> GetApiKeys(Guid deviceId, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetDeviceApiKeysQuery(UserId.Value, deviceId), ct);
        return Ok(list);
    }

    [Authorize]
    [HttpPost("devices/{deviceId:guid}/api-keys")]
    public async Task<ActionResult<CreateDeviceApiKeyResult>> CreateApiKey(Guid deviceId, [FromBody] CreateDeviceApiKeyRequest? body, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var result = await _mediator.Send(new CreateDeviceApiKeyCommand(UserId.Value, deviceId, body?.Name), ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("devices/{deviceId:guid}/api-keys/{apiKeyId:guid}")]
    public async Task<ActionResult> DeleteApiKey(Guid deviceId, Guid apiKeyId, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var ok = await _mediator.Send(new DeleteDeviceApiKeyCommand(UserId.Value, deviceId, apiKeyId), ct);
        if (!ok) return NotFound();
        return NoContent();
    }

    // ---------- Sync from cloud (X-API-Key only) ----------
    [HttpPost("sync")]
    public async Task<ActionResult> Sync([FromBody] SyncRequest request, CancellationToken ct)
    {
        var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
        var deviceId = await _apiKeyResolver.ResolveDeviceIdFromApiKeyAsync(apiKey, ct);
        if (!deviceId.HasValue)
            return Unauthorized(new { message = "Invalid or missing X-API-Key." });
        if (request.DeviceId != deviceId.Value.ToString())
            return BadRequest(new { message = "DeviceId in body must match the device for the API key." });
        var ok = await _mediator.Send(new SyncFromCloudCommand(deviceId.Value, request), ct);
        if (!ok) return BadRequest();
        return Accepted();
    }
}

public record CreateDeviceApiKeyRequest(string? Name);
