using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Dispensing;
using SmartMedicationDispenser.Application.DTOs;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Dispense medication (create event), confirm intake, or delay reminder.</summary>
[ApiController]
[Route("api")]
[Authorize]
public class DispensingController : ControllerBase
{
    private readonly IMediator _mediator;

    public DispensingController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Trigger dispense for a schedule (or ad-hoc). Returns new dispense event.</summary>
    [HttpPost("devices/{deviceId:guid}/dispense")]
    public async Task<ActionResult<DispenseEventDto>> Dispense(Guid deviceId, [FromBody] DispenseRequest request, CancellationToken ct)
    {
        try
        {
            var d = await _mediator.Send(new DispenseCommand(deviceId, UserId, request), ct);
            if (d == null) return NotFound();
            return Ok(d);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Mark that the user has taken the medication (confirm intake).</summary>
    [HttpPost("dispense-events/{id:guid}/confirm")]
    public async Task<ActionResult<DispenseEventDto>> Confirm(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        try
        {
            var d = await _mediator.Send(new ConfirmDispenseCommand(UserId.Value, id), ct);
            if (d == null) return NotFound();
            return Ok(d);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Delay the reminder by N minutes (reschedule notification).</summary>
    [HttpPost("dispense-events/{id:guid}/delay")]
    public async Task<ActionResult<DispenseEventDto>> Delay(Guid id, [FromBody] DelayDispenseRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var d = await _mediator.Send(new DelayDispenseCommand(UserId.Value, id, request), ct);
        if (d == null) return NotFound();
        return Ok(d);
    }
}
