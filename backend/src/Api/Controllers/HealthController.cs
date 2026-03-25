using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SmartMedicationDispenser.Api.Configuration;
using SmartMedicationDispenser.Infrastructure.Persistence;

namespace SmartMedicationDispenser.Api.Controllers;

/// <summary>
/// Health check endpoints for monitoring and load balancers.
/// Matches documentation in software-docs/02_BACKEND_API.md
/// Provides both /api/health/* and /health/* paths for compatibility.
/// </summary>
[ApiController]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<HealthController> _logger;
    private readonly MvpOptions _mvp;

    public HealthController(AppDbContext db, ILogger<HealthController> logger, IOptions<MvpOptions> mvp)
    {
        _db = db;
        _logger = logger;
        _mvp = mvp.Value;
    }

    /// <summary>
    /// Liveness probe - returns 200 if the application is running.
    /// Available at: /api/health/live, /health/live, /health
    /// </summary>
    [HttpGet("api/health/live")]
    [HttpGet("health/live")]
    [HttpGet("health")]
    public ActionResult Live()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            mvp = _mvp.Enabled,
            mvpLabel = _mvp.Enabled ? _mvp.Label : null
        });
    }

    /// <summary>
    /// Readiness probe - checks database connectivity and returns detailed health.
    /// Available at: /api/health/ready, /health/ready
    /// </summary>
    [HttpGet("api/health/ready")]
    [HttpGet("health/ready")]
    public async Task<ActionResult> Ready(CancellationToken ct)
    {
        var checks = new Dictionary<string, object>();
        var isHealthy = true;

        // Database check
        try
        {
            var canConnect = await _db.Database.CanConnectAsync(ct);
            checks["database"] = new { status = canConnect ? "healthy" : "unhealthy", type = "postgresql" };
            if (!canConnect) isHealthy = false;
        }
        catch (Exception ex)
        {
            checks["database"] = new { status = "unhealthy", error = ex.Message };
            isHealthy = false;
            _logger.LogError(ex, "Health check: database connection failed");
        }

        // Memory check
        var process = System.Diagnostics.Process.GetCurrentProcess();
        var memoryMb = process.WorkingSet64 / 1024 / 1024;
        checks["memory"] = new { status = memoryMb < 512 ? "healthy" : "warning", usedMb = memoryMb };

        // Uptime
        var uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime();
        checks["uptime"] = new { hours = Math.Round(uptime.TotalHours, 2) };

        var result = new
        {
            status = isHealthy ? "healthy" : "unhealthy",
            timestamp = DateTime.UtcNow,
            mvp = _mvp.Enabled,
            mvpLabel = _mvp.Enabled ? _mvp.Label : null,
            checks
        };

        return isHealthy ? Ok(result) : StatusCode(503, result);
    }

    /// <summary>
    /// Detailed health (admin) - includes all subsystem checks.
    /// Available at: /api/health/detailed, /health/detailed
    /// </summary>
    [HttpGet("api/health/detailed")]
    [HttpGet("health/detailed")]
    public async Task<ActionResult> Detailed(CancellationToken ct)
    {
        var checks = new Dictionary<string, object>();
        var isHealthy = true;

        // Database check with timing
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var canConnect = await _db.Database.CanConnectAsync(ct);
            sw.Stop();
            checks["database"] = new { status = canConnect ? "healthy" : "unhealthy", type = "postgresql", latency_ms = sw.ElapsedMilliseconds };
            if (!canConnect) isHealthy = false;
        }
        catch (Exception ex)
        {
            checks["database"] = new { status = "unhealthy", error = ex.Message };
            isHealthy = false;
        }

        // Memory
        var process = System.Diagnostics.Process.GetCurrentProcess();
        var memoryMb = process.WorkingSet64 / 1024 / 1024;
        checks["memory"] = new { status = memoryMb < 512 ? "healthy" : "warning", usedMb = memoryMb, gc_gen0 = GC.CollectionCount(0), gc_gen1 = GC.CollectionCount(1), gc_gen2 = GC.CollectionCount(2) };

        // Thread pool
        ThreadPool.GetAvailableThreads(out var workerThreads, out var completionPortThreads);
        checks["threadpool"] = new { worker_available = workerThreads, io_available = completionPortThreads };

        // Uptime
        var uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime();
        checks["uptime"] = new { hours = Math.Round(uptime.TotalHours, 2), started_at = process.StartTime.ToUniversalTime() };

        // Environment
        checks["environment"] = new { dotnet = Environment.Version.ToString(), os = Environment.OSVersion.ToString() };

        var result = new
        {
            status = isHealthy ? "healthy" : "unhealthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            mvp = _mvp.Enabled,
            mvpLabel = _mvp.Enabled ? _mvp.Label : null,
            checks
        };

        return isHealthy ? Ok(result) : StatusCode(503, result);
    }

    /// <summary>
    /// Startup probe - basic check that the service has started.
    /// Available at: /api/health/startup, /health/startup
    /// </summary>
    [HttpGet("api/health/startup")]
    [HttpGet("health/startup")]
    public ActionResult Startup()
    {
        return Ok(new { status = "started", timestamp = DateTime.UtcNow, mvp = _mvp.Enabled, mvpLabel = _mvp.Enabled ? _mvp.Label : null });
    }
}
