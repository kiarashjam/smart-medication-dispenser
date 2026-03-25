using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Application.Notifications;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>In-app notification list and mark-as-read. JWT required.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMemoryCache _cache;

    public NotificationsController(IMediator mediator, IMemoryCache cache)
    {
        _mediator = mediator;
        _cache = cache;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<ActionResult> Get([FromQuery] int limit = 50, CancellationToken ct = default)
    {
        if (!UserId.HasValue) return Unauthorized();
        var list = await _mediator.Send(new GetNotificationsQuery(UserId.Value, limit), ct);
        return Ok(list);
    }

    /// <summary>Mark a notification as read.</summary>
    [HttpPost("{id:guid}/read")]
    public async Task<ActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        if (!UserId.HasValue) return Unauthorized();
        var ok = await _mediator.Send(new MarkNotificationReadCommand(UserId.Value, id), ct);
        if (!ok) return NotFound();

        // Invalidate notification preferences cache
        _cache.Remove($"notif_prefs_{UserId.Value}");
        return NoContent();
    }

    /// <summary>Get notification preferences for the current user.</summary>
    [HttpGet("preferences")]
    public ActionResult<NotificationPreferencesDto> GetPreferences()
    {
        if (!UserId.HasValue) return Unauthorized();

        var prefs = _cache.GetOrCreate($"notif_prefs_{UserId.Value}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return new NotificationPreferencesDto(); // defaults
        });

        return Ok(prefs);
    }

    /// <summary>Update notification preferences for the current user.</summary>
    [HttpPut("preferences")]
    public ActionResult<NotificationPreferencesDto> UpdatePreferences([FromBody] NotificationPreferencesDto prefs)
    {
        if (!UserId.HasValue) return Unauthorized();

        _cache.Set($"notif_prefs_{UserId.Value}", prefs, TimeSpan.FromHours(1));
        return Ok(prefs);
    }
}
