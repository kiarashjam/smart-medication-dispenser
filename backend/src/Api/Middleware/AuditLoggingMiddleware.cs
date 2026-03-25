using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Infrastructure.Persistence;
using System.Security.Claims;

namespace SmartMedicationDispenser.Api.Middleware;

/// <summary>
/// Logs all mutating requests (POST, PUT, DELETE) to the AuditLog table.
/// Provides an immutable audit trail for compliance (GDPR, nDSG).
/// </summary>
public class AuditLoggingMiddleware
{
    private static readonly HashSet<string> AuditedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST", "PUT", "DELETE", "PATCH"
    };

    private readonly RequestDelegate _next;

    public AuditLoggingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Only audit mutating requests
        if (!AuditedMethods.Contains(context.Request.Method))
        {
            await _next(context);
            return;
        }

        await _next(context);

        // Log after the response to capture status code
        try
        {
            using var scope = context.RequestServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var correlationId = context.Items.TryGetValue("CorrelationId", out var cid) ? cid?.ToString() : null;

            db.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = Guid.TryParse(userId, out var uid) ? uid : null,
                Action = $"{context.Request.Method} {context.Request.Path}",
                IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                UserAgent = context.Request.Headers.UserAgent.FirstOrDefault(),
                StatusCode = context.Response.StatusCode,
                CorrelationId = correlationId,
                CreatedAtUtc = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
        }
        catch
        {
            // Audit logging must never break the request pipeline
        }
    }
}
