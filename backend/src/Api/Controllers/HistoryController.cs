using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Dispensing;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Dispense event history for a device (filter by date range, limit).</summary>
[ApiController]
[Route("api")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public HistoryController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Get dispense events for a device; optional fromUtc, toUtc, and limit.</summary>
    [HttpGet("devices/{deviceId:guid}/events")]
    public async Task<ActionResult> GetDeviceEvents(Guid deviceId, [FromQuery] DateTime? fromUtc, [FromQuery] DateTime? toUtc, [FromQuery] int limit = 100, CancellationToken ct = default)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetDeviceEventsQuery(UserId.Value, deviceId, fromUtc, toUtc, limit), ct);
        return Ok(list);
    }
}
