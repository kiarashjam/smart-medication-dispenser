using System.Net;
using System.Text.Json;
using FluentValidation;

namespace SmartMedicationDispenser.Api.Middleware;

/// <summary>
/// Catches unhandled exceptions and returns a consistent JSON error response.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await WriteErrorResponseAsync(context, ex);
        }
    }

    /// <summary>Maps exception types to HTTP status and user-facing message; returns JSON body.</summary>
    private async Task WriteErrorResponseAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        // Map known exception types to appropriate status codes.
        var (statusCode, message) = ex switch
        {
            ValidationException validation => (HttpStatusCode.BadRequest, string.Join(" ", validation.Errors.Select(e => e.ErrorMessage))),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized."),
            KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
            ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
            _ => (HttpStatusCode.InternalServerError, _env.IsDevelopment() ? ex.Message : "An error occurred.")
        };

        context.Response.StatusCode = (int)statusCode;

        var body = new Dictionary<string, object?>
        {
            ["message"] = message,
            ["detail"] = message
        };
        if (_env.IsDevelopment() && statusCode == HttpStatusCode.InternalServerError)
            body["stackTrace"] = ex.StackTrace;

        await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
