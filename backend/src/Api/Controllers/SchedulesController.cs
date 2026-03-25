using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Application.Schedules;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>CRUD for dosing schedules (time of day, days of week) per container, plus today-schedule.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SchedulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SchedulesController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>List all schedules for a container.</summary>
    [HttpGet("~/api/containers/{containerId:guid}/schedules")]
    public async Task<ActionResult<IReadOnlyList<ScheduleDto>>> GetByContainer(Guid containerId, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetSchedulesByContainerQuery(UserId.Value, containerId), ct);
        return Ok(list);
    }

    /// <summary>Create a new schedule for a container.</summary>
    [HttpPost("~/api/containers/{containerId:guid}/schedules")]
    public async Task<ActionResult<ScheduleDto>> Create(Guid containerId, [FromBody] CreateScheduleRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var s = await _mediator.Send(new CreateScheduleCommand(UserId.Value, containerId, request), ct);
        if (s == null) return NotFound();
        return CreatedAtAction(nameof(GetById), "Schedules", new { id = s.Id }, s);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ScheduleDto>> GetById(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var schedule = await _mediator.Send(new GetScheduleByIdQuery(UserId.Value, id), ct);
        if (schedule == null) return NotFound();
        return Ok(schedule);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ScheduleDto>> Update(Guid id, [FromBody] UpdateScheduleRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var s = await _mediator.Send(new UpdateScheduleCommand(UserId.Value, id, request), ct);
        if (s == null) return NotFound();
        return Ok(s);
    }

    /// <summary>Delete a schedule.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var ok = await _mediator.Send(new DeleteScheduleCommand(UserId.Value, id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }

    /// <summary>Get today's scheduled doses for a device, optionally in a given time zone.</summary>
    [HttpGet("~/api/devices/{deviceId:guid}/today-schedule")]
    public async Task<ActionResult<IReadOnlyList<TodayScheduleItemDto>>> GetTodaySchedule(Guid deviceId, [FromQuery] string? timeZoneId, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetTodayScheduleQuery(UserId.Value, deviceId, timeZoneId), ct);
        return Ok(list);
    }
}
