using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Adherence;
using SmartMedicationDispenser.Application.Common.Interfaces;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Patient-specific endpoints (e.g. adherence summary for current user).</summary>
[ApiController]
[Route("api/patients")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDeviceAccessService _deviceAccess;

    public PatientsController(IMediator mediator, IDeviceAccessService deviceAccess)
    {
        _mediator = mediator;
        _deviceAccess = deviceAccess;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>
    /// Adherence for the signed-in patient, or for a linked patient when <paramref name="forPatientUserId"/> is set (caregivers only).
    /// </summary>
    [HttpGet("me/adherence")]
    public async Task<ActionResult> GetMyAdherence(
        [FromQuery] Guid? forPatientUserId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct = default)
    {
        if (!UserId.HasValue) return Unauthorized();
        var targetUserId = UserId.Value;
        if (forPatientUserId.HasValue && forPatientUserId.Value != UserId.Value)
        {
            var ok = await _deviceAccess.IsCaregiverForPatientAsync(UserId.Value, forPatientUserId.Value, ct);
            if (!ok) return Forbid();
            targetUserId = forPatientUserId.Value;
        }

        var result = await _mediator.Send(new GetAdherenceQuery(targetUserId, fromUtc, toUtc), ct);
        return Ok(result);
    }
}
