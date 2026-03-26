using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Devices;
using SmartMedicationDispenser.Application.DTOs;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>CRUD for patient devices (main / portable). Caregiver-scoped via JWT.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DevicesController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DeviceDto>>> GetDevices(CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetDevicesQuery(UserId.Value), ct);
        return Ok(list);
    }

    /// <summary>Get a single device by ID; 404 if not found or not owned by user.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeviceDto>> GetById(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var d = await _mediator.Send(new GetDeviceByIdQuery(UserId.Value, id), ct);
        if (d == null) return NotFound();
        return Ok(d);
    }

    [HttpPost]
    public async Task<ActionResult<DeviceDto>> Create([FromBody] CreateDeviceRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        try
        {
            var d = await _mediator.Send(new CreateDeviceCommand(UserId.Value, request), ct);
            return CreatedAtAction(nameof(GetById), new { id = d.Id }, d);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Pause dispensing for the device.</summary>
    [HttpPatch("{id:guid}/pause")]
    public async Task<ActionResult<DeviceDto>> Pause(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var d = await _mediator.Send(new PauseDeviceCommand(UserId.Value, id), ct);
        if (d == null) return NotFound();
        return Ok(d);
    }

    [HttpPatch("{id:guid}/resume")]
    public async Task<ActionResult<DeviceDto>> Resume(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var d = await _mediator.Send(new ResumeDeviceCommand(UserId.Value, id), ct);
        if (d == null) return NotFound();
        return Ok(d);
    }

    /// <summary>Record device heartbeat (can be called by device without user context).</summary>
    [HttpPost("{id:guid}/heartbeat")]
    public async Task<ActionResult> Heartbeat(Guid id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new HeartbeatCommand(id, UserId), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}
