using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>
/// Board bring-up and connection testing: ordered steps from **no credentials** → **X-API-Key** → **device GUID in URL**, matching production <see cref="DeviceApiController"/> auth.
/// </summary>
/// <remarks>
/// <para><b>Start with</b> <c>GET /api/v1/board-test/flow</c> — it returns this checklist as JSON plus every URL for your host.</para>
/// <para><b>In Swagger:</b> expand the <b>DeviceBoardTest</b> tag; use <b>Try it out</b> in sequence. Set <b>Authorize → DeviceApiKey</b> before <c>step/2-api-key</c>.</para>
/// <para><b>On device:</b> implement the same order; use <c>samples</c> for JSON bodies when you reach heartbeat/registration.</para>
/// </remarks>
[ApiController]
[Route("api/v1/board-test")]
public class DeviceBoardTestController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDeviceApiKeyResolver _apiKeyResolver;
    private readonly ILogger<DeviceBoardTestController> _logger;

    public DeviceBoardTestController(
        IMediator mediator,
        IDeviceApiKeyResolver apiKeyResolver,
        ILogger<DeviceBoardTestController> logger)
    {
        _mediator = mediator;
        _apiKeyResolver = apiKeyResolver;
        _logger = logger;
    }

    /// <summary>
    /// **Start here:** Full bring-up plan — URLs for this host, what each step proves, HTTP expectations, and troubleshooting.
    /// </summary>
    [HttpGet("flow")]
    [AllowAnonymous]
    public ActionResult GetFlow()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var v1 = $"{baseUrl}/api/v1";
        var bt = $"{v1}/board-test";

        return Ok(new
        {
            message = "Run quick_start in order on the board or in Swagger. No key until step 4 (2-api-key). Replace {deviceId} with device_id from step 4 JSON.",
            base_url = baseUrl,
            device_api_base = v1,
            board_test_base = bt,
            swagger_hint = "Open API docs → DeviceBoardTest tag → Authorize → DeviceApiKey before step 2-api-key. Enable Persist authorization to keep the key.",
            prerequisites = new[]
            {
                "Network: device can reach this host (same URL as browser).",
                "TLS: trust the server certificate (or use http only in dev).",
                "Portal: device registered; device API key created (Integrations) before step 4.",
                "Optional: GET .../board-test/samples for JSON copy-paste."
            },
            connection_layers = new[]
            {
                new { layer = "L1", name = "DNS + TCP", tested_by = new[] { "step/0-hello", "step/1-connectivity" } },
                new { layer = "L2", name = "TLS + HTTP", tested_by = new[] { "step/0-hello", "step/1-connectivity", "GET /api/v1/ping" } },
                new { layer = "L3", name = "JSON parse", tested_by = new[] { "step/0-hello", "step/1-connectivity" } },
                new { layer = "L4", name = "Auth header X-API-Key", tested_by = new[] { "step/2-api-key", "step/3-schedule", "step/4-heartbeat" } },
                new { layer = "L5", name = "Path deviceId matches key", tested_by = new[] { "step/3-schedule", "step/4-heartbeat" } },
                new { layer = "L6", name = "Production handlers", tested_by = new[] { "step/3-schedule", "step/4-heartbeat", "GET /api/v1/devices/{id}/schedule", "POST /api/v1/devices/{id}/heartbeat" } }
            },
            quick_start = new[]
            {
                $"{bt}/flow",
                $"{bt}/step/0-hello",
                $"{bt}/step/1-connectivity",
                $"{v1}/ping",
            },
            example_registration_device_id = "SMD-A1B2C3D4",
            example_route_device_id = "Use UUID from step 4 (2-api-key) response field device_id — must match the API key's device.",
            troubleshooting = new
            {
                http_401 = "Missing or invalid X-API-Key (or Bearer device JWT) on steps 4–6.",
                http_403 = "deviceId in URL does not match the device resolved from your key.",
                http_404 = "Device not in database — register via portal or POST /api/v1/devices/register.",
                ssl_errors = "Certificate not trusted on device — install CA or use dev HTTP if allowed.",
                empty_response = "Check proxy/firewall; verify Host header and correct port."
            },
            steps = new object[]
            {
                new
                {
                    step = 0,
                    name = "This checklist (you are here)",
                    difficulty = "easy",
                    needs_headers = false,
                    method = "GET",
                    url = $"{bt}/flow",
                    verifies = "Human + machine readable plan; all URLs scoped to current server.",
                    expected_http = 200,
                    swagger_try_it_out = true
                },
                new
                {
                    step = 1,
                    name = "Smallest JSON (sanity check)",
                    difficulty = "trivial",
                    needs_headers = false,
                    method = "GET",
                    url = $"{bt}/step/0-hello",
                    verifies = "DNS, TLS, HTTP GET, JSON body parse on firmware.",
                    expected_http = 200,
                    next = "GET step/1-connectivity or follow next_url in response",
                    swagger_try_it_out = true
                },
                new
                {
                    step = 2,
                    name = "Connectivity + server clock",
                    difficulty = "easy",
                    needs_headers = false,
                    method = "GET",
                    url = $"{bt}/step/1-connectivity",
                    verifies = "Larger JSON; compare server_time to device clock (NTP sanity).",
                    expected_http = 200,
                    next = "Optional GET /api/v1/ping then GET step/2-api-key with X-API-Key",
                    swagger_try_it_out = true
                },
                new
                {
                    step = 3,
                    name = "Official device API ping",
                    difficulty = "easy",
                    needs_headers = false,
                    method = "GET",
                    url = $"{v1}/ping",
                    verifies = "Same public surface as production device ping.",
                    expected_http = 200,
                    optional = true,
                    swagger_try_it_out = true
                },
                new
                {
                    step = 4,
                    name = "Validate API key → get device_id",
                    difficulty = "medium",
                    needs_headers = true,
                    method = "GET",
                    url = $"{bt}/step/2-api-key",
                    headers = "X-API-Key: <portal device key>",
                    verifies = "Key resolves to a device; last-used updated like production.",
                    expected_http = new { success = 200, bad_key = 401 },
                    capture_from_response = "device_id (GUID) — required for steps 5–6 URL path",
                    swagger_try_it_out = true,
                    swagger_authorize = "DeviceApiKey"
                },
                new
                {
                    step = 5,
                    name = "Load schedule (production code path)",
                    difficulty = "medium",
                    needs_headers = true,
                    method = "GET",
                    url_template = $"{bt}/step/3-schedule/{{deviceId}}",
                    headers = "X-API-Key: same as step 4 (or Bearer device JWT)",
                    verifies = "GetDeviceScheduleQuery — same as GET /api/v1/devices/{deviceId}/schedule.",
                    expected_http = new { success = 200, wrong_guid = 403, no_auth = 401 },
                    swagger_try_it_out = "Set deviceId path param to device_id from step 4",
                    swagger_authorize = "DeviceApiKey"
                },
                new
                {
                    step = 6,
                    name = "Heartbeat (production code path)",
                    difficulty = "medium",
                    needs_headers = true,
                    method = "POST",
                    url_template = $"{bt}/step/4-heartbeat/{{deviceId}}",
                    headers = "X-API-Key: same as step 4",
                    body = "Optional JSON; omit body for defaults. Full examples: GET .../board-test/samples",
                    verifies = "ProcessDeviceHeartbeatCommand — same pipeline as POST /api/v1/devices/{deviceId}/heartbeat.",
                    expected_http = new { success = 200, wrong_guid = 403, no_auth = 401, no_device = 404 },
                    swagger_try_it_out = "Same deviceId as step 5; body optional",
                    swagger_authorize = "DeviceApiKey"
                },
                new
                {
                    step = 7,
                    name = "Reference JSON samples",
                    difficulty = "easy",
                    needs_headers = false,
                    method = "GET",
                    url = $"{bt}/samples",
                    verifies = "Register + heartbeat payload shapes for firmware.",
                    optional = true,
                    swagger_try_it_out = true
                },
                new
                {
                    step = "prod",
                    name = "Production routes (after board test passes)",
                    difficulty = "production",
                    needs_headers = true,
                    notes = "Same X-API-Key or device JWT as steps 5–6.",
                    examples = new[]
                    {
                        $"{v1}/ping",
                        $"POST {v1}/devices/{{deviceId}}/heartbeat",
                        $"GET {v1}/devices/{{deviceId}}/schedule",
                        $"POST {v1}/events",
                        $"POST {v1}/devices/register"
                    }
                }
            }
        });
    }

    /// <summary>**Easiest:** Minimal JSON — use this first on the board (no headers, no query).</summary>
    [HttpGet("step/0-hello")]
    [AllowAnonymous]
    public ActionResult Step0Hello()
    {
        var next = $"{Request.Scheme}://{Request.Host}/api/v1/board-test/step/1-connectivity";
        return Ok(new
        {
            checklist_step = 1,
            name = "hello",
            ok = true,
            server_time = DateTime.UtcNow,
            next_url = next,
            hint = "If you see this JSON, GET next_url (or open /api/v1/board-test/flow for the full list)."
        });
    }

    /// <summary>**Step 2 in checklist:** Slightly richer connectivity check — still no credentials.</summary>
    [HttpGet("step/1-connectivity")]
    [AllowAnonymous]
    public ActionResult Step1Connectivity()
    {
        var host = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            step = 2,
            name = "connectivity",
            checklist_step = 2,
            status = "ok",
            server_time = DateTime.UtcNow,
            next_url = $"{host}/api/v1/ping",
            then = $"{host}/api/v1/board-test/step/2-api-key (header X-API-Key)",
            hint = "Next: optional GET /api/v1/ping, then validate your device key on step/2-api-key."
        });
    }

    /// <summary>**Step 2:** Verifies <c>X-API-Key</c> resolves to a device (updates last-used like production).</summary>
    [HttpGet("step/2-api-key")]
    public async Task<ActionResult> Step2ValidateApiKey(CancellationToken ct)
    {
        var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
        var deviceId = await _apiKeyResolver.ResolveDeviceIdFromApiKeyAsync(apiKey, ct);
        if (!deviceId.HasValue)
            return Unauthorized(new { checklist_step = 4, message = "Invalid or missing X-API-Key." });

        var host = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            checklist_step = 4,
            name = "api_key",
            api_key_valid = true,
            device_id = deviceId.Value,
            next_url = $"{host}/api/v1/board-test/step/3-schedule/{deviceId.Value}",
            hint = "Use next_url for schedule, then same path pattern for POST .../step/4-heartbeat/{deviceId}."
        });
    }

    /// <summary>**Step 3:** Loads schedule using the same validation as production; route <paramref name="deviceId"/> must match the device for your API key.</summary>
    [HttpGet("step/3-schedule/{deviceId:guid}")]
    public async Task<ActionResult> Step3Schedule(Guid deviceId, CancellationToken ct)
    {
        var valid = await ValidateDeviceTokenAsync(deviceId, ct);
        if (valid == null)
            return Unauthorized(new { step = 3, message = "Invalid or missing authorization (Bearer device JWT or X-API-Key)." });
        if (valid.Value != deviceId)
            return StatusCode(StatusCodes.Status403Forbidden, new { step = 3, message = "Credential does not match deviceId in URL." });

        var schedule = await _mediator.Send(new GetDeviceScheduleQuery(deviceId), ct);
        return Ok(new { step = 3, name = "schedule", device_id = deviceId, schedule });
    }

    /// <summary>**Step 4:** Sends a minimal heartbeat through the same pipeline as POST /api/v1/devices/&#123;deviceId&#125;/heartbeat.</summary>
    [HttpPost("step/4-heartbeat/{deviceId:guid}")]
    public async Task<ActionResult> Step4Heartbeat(
        Guid deviceId,
        [FromBody] HeartbeatPayload? body,
        CancellationToken ct)
    {
        var valid = await ValidateDeviceTokenAsync(deviceId, ct);
        if (valid == null)
            return Unauthorized(new { checklist_step = 6, message = "Invalid or missing authorization (Bearer device JWT or X-API-Key)." });
        if (valid.Value != deviceId)
            return StatusCode(StatusCodes.Status403Forbidden, new { checklist_step = 6, message = "Credential does not match deviceId in URL." });

        var payload = body ?? new HeartbeatPayload(
            DeviceId: deviceId.ToString(),
            Timestamp: DateTime.UtcNow,
            Battery: 100,
            WifiSignal: -42,
            Temperature: null,
            Humidity: null,
            Firmware: "board-test",
            Slots: null);

        var result = await _mediator.Send(new ProcessDeviceHeartbeatCommand(deviceId, payload), ct);
        if (!result.Success)
            return NotFound(new { checklist_step = 6, message = "Device not found in database." });

        return Ok(new
        {
            checklist_step = 6,
            name = "heartbeat",
            device_id = deviceId,
            success = true,
            server_time = result.ServerTime,
            next_heartbeat = result.NextHeartbeat,
            commands = result.Commands ?? new List<DeviceCommand>(),
            hint = "Board test complete. Use production routes under /api/v1/devices/... — see /flow."
        });
    }

    /// <summary>Optional anytime after step 2: JSON shapes for register and heartbeat (copy-paste for firmware).</summary>
    [HttpGet("samples")]
    [AllowAnonymous]
    public ActionResult GetSampleBodies()
    {
        return Ok(new
        {
            checklist_note = "Optional reference; not required for /board-test/step/0-hello through step/1-connectivity.",
            register = new DeviceRegistrationRequest(
                DeviceId: "SMD-A1B2C3D4",
                DeviceType: "main",
                FirmwareVersion: "1.0.0",
                HardwareVersion: "rev-a",
                MacAddress: "AA:BB:CC:DD:EE:FF"),
            heartbeat = new HeartbeatPayload(
                DeviceId: "00000000-0000-0000-0000-000000000000",
                Timestamp: DateTime.UtcNow,
                Battery: 87,
                WifiSignal: -55,
                Temperature: 22.5m,
                Humidity: 45,
                Firmware: "1.0.0",
                Slots: new List<HeartbeatSlot> { new(1, "Aspirin", 14) }),
            note = "Replace device_id in heartbeat with your portal device GUID string. Register uses SMD-XXXXXXXX format."
        });
    }

    /// <summary>Same rules as <see cref="DeviceApiController"/> validation; callers enforce URL <paramref name="expectedDeviceId"/> equals resolved device.</summary>
    private async Task<Guid?> ValidateDeviceTokenAsync(Guid expectedDeviceId, CancellationToken ct)
    {
        var route = expectedDeviceId.ToString();
        Guid? resolved = null;

        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.Ordinal))
        {
            var token = authHeader["Bearer ".Length..].Trim();
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);
                var nameId = jwt.Claims.FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier ||
                    c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
                if (nameId != null && Guid.TryParse(nameId.Value, out var tokenDeviceId))
                {
                    if (jwt.ValidTo > DateTime.UtcNow)
                        resolved = tokenDeviceId;
                    else
                        _logger.LogWarning("Device token expired for {DeviceId}", route);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Invalid device JWT for {DeviceId}", route);
            }
        }

        if (resolved == null)
        {
            var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
            if (!string.IsNullOrEmpty(apiKey))
                resolved = await _apiKeyResolver.ResolveDeviceIdFromApiKeyAsync(apiKey, ct);
        }

        return resolved;
    }
}
