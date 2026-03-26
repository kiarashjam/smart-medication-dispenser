using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Caregivers;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Caregiver-scoped helpers (linked patients).</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CaregiversController : ControllerBase
{
    private readonly IMediator _mediator;

    public CaregiversController(IMediator mediator) => _mediator = mediator;

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Patients assigned to the current caregiver (empty if not a caregiver).</summary>
    [HttpGet("my-patients")]
    public async Task<ActionResult<IReadOnlyList<PatientSummaryDto>>> MyPatients(CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetCaregiverPatientsQuery(UserId.Value), ct);
        return Ok(list);
    }
}
