using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Travel;
using SmartMedicationDispenser.Application.DTOs;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Travel mode: link portable device to main device for a period.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TravelController : ControllerBase
{
    private readonly IMediator _mediator;

    public TravelController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Start a travel session (portable device, number of days).</summary>
    [HttpPost("start")]
    public async Task<ActionResult<TravelSessionDto>> Start([FromBody] StartTravelRequest request, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        try
        {
            var s = await _mediator.Send(new StartTravelCommand(UserId.Value, request), ct);
            if (s == null) return NotFound();
            return Ok(s);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>End the current travel session.</summary>
    [HttpPost("end")]
    public async Task<ActionResult<TravelSessionDto>> End(CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var s = await _mediator.Send(new EndTravelCommand(UserId.Value), ct);
        if (s == null) return NotFound();
        return Ok(s);
    }
}
