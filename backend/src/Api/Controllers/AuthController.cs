using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartMedicationDispenser.Application.Auth;
using SmartMedicationDispenser.Application.DTOs;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>Authentication: register, login, and get current user (me).</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    /// <summary>Register a new user; returns JWT and user info. Returns 400 if email already exists.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _mediator.Send(new RegisterCommand(request), ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>Login with email/password; returns JWT and user info. Returns 401 if invalid.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _mediator.Send(new LoginCommand(request), ct);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }

    /// <summary>Get current user profile. Requires valid JWT.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var id))
            return Unauthorized();
        try
        {
            var result = await _mediator.Send(new MeQuery(id), ct);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    /// <summary>Get current user profile with user ID and all device IDs (machines) the user owns. Requires valid JWT.</summary>
    [Authorize]
    [HttpGet("me/profile")]
    public async Task<ActionResult<MeProfileResponse>> MeProfile(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var id))
            return Unauthorized();
        try
        {
            var result = await _mediator.Send(new MeProfileQuery(id), ct);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    /// <summary>Update current user profile (name, caregiver assignment). Requires valid JWT.</summary>
    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<MeResponse>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var id))
            return Unauthorized();
        var result = await _mediator.Send(new UpdateProfileCommand(id, request), ct);
        return Ok(result);
    }

    /// <summary>GDPR data export: download all personal data in JSON format. Requires valid JWT.</summary>
    [Authorize]
    [HttpGet("me/export")]
    public async Task<ActionResult> ExportData(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var id))
            return Unauthorized();
        var export = await _mediator.Send(new SmartMedicationDispenser.Application.Users.ExportUserDataQuery(id), ct);
        return Ok(export);
    }
}
