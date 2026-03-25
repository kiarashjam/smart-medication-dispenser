// Smart Medication Dispenser API - Entry point and service configuration.
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartMedicationDispenser.Api.Configuration;
using SmartMedicationDispenser.Api.Middleware;
using SmartMedicationDispenser.Application;
using SmartMedicationDispenser.Infrastructure;
using SmartMedicationDispenser.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MvpOptions>(builder.Configuration.GetSection(MvpOptions.SectionName));

// MVC controllers and API explorer for Swagger / OpenAPI.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSmartDispenserSwagger();

// JWT authentication: validate signing key, issuer, audience, and lifetime.
var jwtKey = builder.Configuration["Jwt:SecretKey"] ?? "SmartMedicationDispenser_MVP_SecretKey_AtLeast32Characters!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "SmartMedicationDispenser",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "SmartMedicationDispenser",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

// Rate limiting: prevent abuse on API endpoints.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global rate limit: partition by authenticated user (JWT nameid) or IP for anonymous
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        // Prefer user ID from JWT for authenticated requests
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var partitionKey = userId ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = userId != null ? 120 : 60, // 120/min for authenticated, 60/min for anonymous
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 10
        });
    });

    // Strict policy for auth endpoints: 10 attempts per 15 minutes per IP
    options.AddPolicy("auth", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(15),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 2
        });
    });

    // Device API policy: 30 per minute per device (by API key or Bearer token)
    options.AddPolicy("device", context =>
    {
        var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();
        var deviceKey = apiKey ?? context.Request.Headers["Authorization"].FirstOrDefault() ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter($"device:{deviceKey}", _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 30,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 5
        });
    });
});

// In-memory caching for schedule and device lookups
builder.Services.AddMemoryCache();

// Application layer (MediatR, FluentValidation) and Infrastructure (EF Core, repos, services).
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Correlation ID must be first to tag all logs and responses
app.UseMiddleware<CorrelationIdMiddleware>();

// Global exception handler so all unhandled exceptions return consistent JSON
app.UseMiddleware<GlobalExceptionMiddleware>();

// Swagger: on in Development, or when Swagger:Enabled is true (e.g. staging). See backend/README.md and software-docs/SWAGGER_AND_OPENAPI.md
var swaggerEnabled = app.Environment.IsDevelopment()
    || app.Configuration.GetValue("Swagger:Enabled", false);
if (swaggerEnabled)
    app.UseSmartDispenserSwaggerUi();

// CORS: allow all origins for development/MVP; tighten in production.
app.UseCors(policy =>
{
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
});

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Audit logging for all mutating requests (POST, PUT, DELETE)
app.UseMiddleware<AuditLoggingMiddleware>();

app.MapControllers();

// Apply pending migrations (PostgreSQL) or ensure created (SQLite) and seed demo data on startup.
var connString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
var useSqlite = connString.TrimStart().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase);
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (useSqlite)
        await db.Database.EnsureCreatedAsync();
    else
        await db.Database.MigrateAsync();
    await SeedData.SeedAsync(db);
}

app.Run();

// Required for WebApplicationFactory<Program> in integration tests
public partial class Program { }
