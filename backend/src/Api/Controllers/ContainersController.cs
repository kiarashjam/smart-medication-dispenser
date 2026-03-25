using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Containers;
using SmartMedicationDispenser.Application.DTOs;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>CRUD for medication containers (slots) on a device.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContainersController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContainersController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>List all containers for a device. User must own the device.</summary>
    [HttpGet("~/api/devices/{deviceId:guid}/containers")]
    public async Task<ActionResult<IReadOnlyList<ContainerDto>>> GetByDevice(Guid deviceId, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetContainersByDeviceQuery(UserId.Value, deviceId), ct);
        return Ok(list);
    }

    /// <summary>Create a new container (medication slot) on the device.</summary>
    [HttpPost("~/api/devices/{deviceId:guid}/containers")]
    public async Task<ActionResult<ContainerDto>> Create(Guid deviceId, [FromBody] CreateContainerRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var c = await _mediator.Send(new CreateContainerCommand(UserId.Value, deviceId, request), ct);
        if (c == null) return NotFound();
        return CreatedAtAction(nameof(GetById), "Containers", new { id = c.Id }, c);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContainerDto>> GetById(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var container = await _mediator.Send(new GetContainerByIdQuery(UserId.Value, id), ct);
        if (container == null) return NotFound();
        return Ok(container);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ContainerDto>> Update(Guid id, [FromBody] UpdateContainerRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var c = await _mediator.Send(new UpdateContainerCommand(UserId.Value, id, request), ct);
        if (c == null) return NotFound();
        return Ok(c);
    }

    /// <summary>Delete a container. Fails if schedules exist for it.</summary>
    /// <summary>Delete a container. Fails if schedules reference it.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var ok = await _mediator.Send(new DeleteContainerCommand(UserId.Value, id), ct);
        if (!ok) return NotFound();
        return NoContent();
    }
}
