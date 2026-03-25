using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Adherence;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Patient-specific endpoints (e.g. adherence summary for current user).</summary>
[ApiController]
[Route("api/patients")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PatientsController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Get adherence summary (scheduled vs confirmed vs missed) for date range.</summary>
    [HttpGet("me/adherence")]
    public async Task<ActionResult> GetMyAdherence([FromQuery] DateTime? fromUtc, [FromQuery] DateTime? toUtc, CancellationToken ct = default)
    {
        if (!UserId.HasValue) return Unauthorized();
        var result = await _mediator.Send(new GetAdherenceQuery(UserId.Value, fromUtc, toUtc), ct);
        return Ok(result);
    }
}
