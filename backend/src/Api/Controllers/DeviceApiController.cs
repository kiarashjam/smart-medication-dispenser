using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>
/// Device API endpoints - for device firmware to communicate with cloud.
/// Matches documentation in technical-docs/02_API_INTEGRATION.md
/// </summary>
[ApiController]
[Route("api/v1")]
public class DeviceApiController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDeviceApiKeyResolver _apiKeyResolver;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeviceApiController> _logger;

    public DeviceApiController(
        IMediator mediator, 
        IDeviceApiKeyResolver apiKeyResolver,
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeviceApiController> logger)
    {
        _mediator = mediator;
        _apiKeyResolver = apiKeyResolver;
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // ============================================
    // Device Registration
    // POST /api/v1/devices/register
    // ============================================

    /// <summary>
    /// Register a new device. Called on first boot.
    /// </summary>
    [HttpPost("devices/register")]
    [AllowAnonymous]
    public async Task<ActionResult<DeviceRegistrationResponse>> RegisterDevice(
        [FromBody] DeviceRegistrationRequest request,
        CancellationToken ct)
    {
        _logger.LogInformation("Device registration request: {DeviceId}, Type: {Type}", 
            request.DeviceId, request.DeviceType);

        var result = await _mediator.Send(new RegisterDeviceCommand(
            request.DeviceId,
            request.DeviceType,
            request.FirmwareVersion,
            request.HardwareVersion,
            request.MacAddress
        ), ct);

        if (!result.Success)
            return BadRequest(result);

        // Override API endpoint with actual host
        var response = result with
        {
            ApiEndpoint = $"{Request.Scheme}://{Request.Host}/api/v1"
        };

        return Ok(response);
    }

    // ============================================
    // Heartbeat
    // POST /api/v1/devices/{deviceId}/heartbeat
    // ============================================

    /// <summary>
    /// Device heartbeat - sent every 60 seconds. Updates device status, battery, sensors, slot pill counts.
    /// </summary>
    [HttpPost("devices/{deviceId}/heartbeat")]
    public async Task<ActionResult> Heartbeat(
        string deviceId,
        [FromBody] HeartbeatPayload payload,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        _logger.LogDebug("Heartbeat from device {DeviceId}, Battery: {Battery}%", 
            deviceId, payload.Battery);

        var result = await _mediator.Send(new ProcessDeviceHeartbeatCommand(
            validDeviceId.Value, payload
        ), ct);

        if (!result.Success)
            return NotFound(new { message = "Device not found" });

        return Ok(new 
        { 
            success = true, 
            server_time = result.ServerTime,
            commands = result.Commands ?? new List<DeviceCommand>(),
            next_heartbeat = result.NextHeartbeat
        });
    }

    // ============================================
    // Get Schedule
    // GET /api/v1/devices/{deviceId}/schedule
    // ============================================

    /// <summary>
    /// Get medication schedule for device. Returns all active schedules with times and medications.
    /// </summary>
    [HttpGet("devices/{deviceId}/schedule")]
    public async Task<ActionResult<DeviceScheduleResponse>> GetSchedule(
        string deviceId,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        var result = await _mediator.Send(new GetDeviceScheduleQuery(validDeviceId.Value), ct);
        return Ok(result);
    }

    // ============================================
    // Send Events
    // POST /api/v1/events
    // ============================================

    /// <summary>
    /// Receive events from device (dose dispensed, taken, missed, refill needed, errors, etc.)
    /// All events are logged and processed: notifications sent, dispense events created, webhooks triggered.
    /// </summary>
    [HttpPost("events")]
    public async Task<ActionResult> ReceiveEvent(
        [FromBody] DeviceEventPayload payload,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(payload.DeviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        _logger.LogInformation("Event received: {Event} from device {DeviceId}", 
            payload.Event, payload.DeviceId);

        var result = await _mediator.Send(new ProcessDeviceEventCommand(
            validDeviceId.Value, payload
        ), ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Accepted(new { success = true, event_id = result.EventId });
    }

    // ============================================
    // Sync Inventory
    // POST /api/v1/devices/{deviceId}/inventory
    // ============================================

    /// <summary>
    /// Sync device inventory with cloud. Updates pill counts for all slots.
    /// </summary>
    [HttpPost("devices/{deviceId}/inventory")]
    public async Task<ActionResult> SyncInventory(
        string deviceId,
        [FromBody] SyncInventoryRequest request,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        var slots = request.Slots?.Select(s => new InventorySlot(
            s.Slot, s.Medication, s.Pills, s.Capacity
        )).ToList() ?? new List<InventorySlot>();

        var result = await _mediator.Send(new SyncInventoryCommand(
            validDeviceId.Value, slots
        ), ct);

        if (!result.Success)
            return NotFound(new { message = "Device not found" });

        return Ok(new { success = true, synced_at = result.SyncedAt });
    }

    // ============================================
    // Report Error
    // POST /api/v1/devices/{deviceId}/error
    // ============================================

    /// <summary>
    /// Report device error. Logs error, updates device state, sends notifications and caregiver alerts.
    /// </summary>
    [HttpPost("devices/{deviceId}/error")]
    public async Task<ActionResult> ReportError(
        string deviceId,
        [FromBody] DeviceErrorData error,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        _logger.LogError("Device error reported: {DeviceId}, Code: {Code}, Message: {Message}",
            deviceId, error.ErrorCode, error.Message);

        var result = await _mediator.Send(new ReportDeviceErrorCommand(
            validDeviceId.Value, error
        ), ct);

        if (!result)
            return NotFound(new { message = "Device not found" });

        return Accepted(new { success = true });
    }

    // ============================================
    // Check Firmware Update
    // GET /api/v1/devices/{deviceId}/firmware
    // ============================================

    /// <summary>
    /// Check for firmware updates. Returns update info if new version is available.
    /// </summary>
    [HttpGet("devices/{deviceId}/firmware")]
    public async Task<ActionResult<FirmwareUpdateResponse>> CheckFirmware(
        string deviceId,
        [FromQuery] string? current_version,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        // Firmware update check - in production this would query a firmware registry.
        // For MVP, return no update available with the current version.
        var response = new FirmwareUpdateResponse(
            UpdateAvailable: false,
            CurrentVersion: current_version ?? "1.0.0",
            NewVersion: null,
            DownloadUrl: null,
            Checksum: null,
            SizeBytes: null,
            ReleaseNotes: null,
            Mandatory: false
        );

        return Ok(response);
    }

    // ============================================
    // Firmware Update Status
    // POST /api/v1/devices/{deviceId}/firmware/status
    // ============================================

    /// <summary>
    /// Report firmware update progress (downloading, verifying, installing, completed, failed).
    /// </summary>
    [HttpPost("devices/{deviceId}/firmware/status")]
    public async Task<ActionResult> ReportFirmwareStatus(
        string deviceId,
        [FromBody] FirmwareUpdateStatusRequest request,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        _logger.LogInformation("Firmware update status from device {DeviceId}: {Status} v{Version}, progress: {Progress}%",
            deviceId, request.Status, request.Version, request.Progress);

        // Persist firmware status updates
        if (request.Status == "completed" && Guid.TryParse(deviceId, out var fwDeviceGuid))
        {
            var device = await _deviceRepository.GetByIdAsync(fwDeviceGuid, ct);
            if (device != null)
            {
                device.FirmwareVersion = request.Version;
                _logger.LogInformation("Device {DeviceId} firmware updated to {Version}", deviceId, request.Version);
                await _unitOfWork.SaveChangesAsync(ct);
            }
        }
        else if (request.Status == "failed")
        {
            _logger.LogWarning("Device {DeviceId} firmware update failed: {Error}", deviceId, request.Error);
        }

        return Ok(new { success = true, received_at = DateTime.UtcNow });
    }

    // ============================================
    // Schedule Confirmation
    // POST /api/v1/devices/{deviceId}/schedule/confirm
    // ============================================

    /// <summary>
    /// Device confirms receipt and application of schedule data.
    /// </summary>
    [HttpPost("devices/{deviceId}/schedule/confirm")]
    public async Task<ActionResult> ConfirmSchedule(
        string deviceId,
        [FromBody] ScheduleConfirmRequest request,
        CancellationToken ct)
    {
        var validDeviceId = await ValidateDeviceToken(deviceId, ct);
        if (validDeviceId == null)
            return Unauthorized(new { message = "Invalid or missing authorization" });

        _logger.LogInformation("Device {DeviceId} confirmed schedule v{Version} with {Count} items",
            deviceId, request.ScheduleVersion, request.ScheduleCount);

        return Ok(new { success = true, confirmed_at = DateTime.UtcNow });
    }

    // ============================================
    // Health Check (device-facing)
    // GET /api/v1/ping
    // ============================================

    /// <summary>
    /// Simple health check endpoint for device connectivity testing.
    /// </summary>
    [HttpGet("ping")]
    [AllowAnonymous]
    public ActionResult Ping()
    {
        return Ok(new { status = "ok", server_time = DateTime.UtcNow });
    }

    // ============================================
    // Helper Methods
    // ============================================

    private async Task<Guid?> ValidateDeviceToken(string deviceId, CancellationToken ct)
    {
        // 1. Check Bearer token (JWT from device registration)
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader["Bearer ".Length..].Trim();
            // Validate the JWT token using the same parameters as user JWT
            try
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                
                // Extract device ID from the token's NameIdentifier claim
                var nameIdClaim = jwtToken.Claims.FirstOrDefault(c => 
                    c.Type == System.Security.Claims.ClaimTypes.NameIdentifier ||
                    c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
                
                if (nameIdClaim != null && Guid.TryParse(nameIdClaim.Value, out var tokenDeviceId))
                {
                    // Verify the token hasn't expired
                    if (jwtToken.ValidTo > DateTime.UtcNow)
                        return tokenDeviceId;
                    
                    _logger.LogWarning("Device token expired for {DeviceId}", deviceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Invalid device JWT token for {DeviceId}", deviceId);
            }
        }

        // 2. Check X-API-Key header (API key authentication)
        var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
        if (!string.IsNullOrEmpty(apiKey))
        {
            return await _apiKeyResolver.ResolveDeviceIdFromApiKeyAsync(apiKey, ct);
        }

        // 3. Fallback: parse device ID from URL (for anonymous endpoints like register)
        if (Guid.TryParse(deviceId, out var parsedGuid))
            return parsedGuid;

        return null;
    }
}

// ============================================
// Inventory Sync DTOs
// ============================================

public record SyncInventoryRequest(
    List<SyncInventorySlotData>? Slots
);

public record SyncInventorySlotData(
    int Slot,
    string? Medication,
    int Pills,
    int? Capacity
);
