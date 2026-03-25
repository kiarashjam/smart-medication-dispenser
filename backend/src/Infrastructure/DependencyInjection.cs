using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Infrastructure.Background;
using SmartMedicationDispenser.Infrastructure.Persistence;
using SmartMedicationDispenser.Infrastructure.Services;

namespace SmartMedicationDispenser.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var conn = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret";
        var useSqlite = conn.TrimStart().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase);
        if (useSqlite)
            services.AddDbContext<AppDbContext>(o => o.UseSqlite(conn));
        else
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(conn));

        // Repositories and unit of work.
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<IContainerRepository, ContainerRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IDispenseEventRepository, DispenseEventRepository>();
        services.AddScoped<ITravelSessionRepository, TravelSessionRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IWebhookEndpointRepository, WebhookEndpointRepository>();
        services.AddScoped<IDeviceApiKeyRepository, DeviceApiKeyRepository>();
        services.AddScoped<IDeviceEventLogRepository, DeviceEventLogRepository>();

        // HTTP client for webhooks
        services.AddHttpClient();

        // Services
        services.AddScoped<IWebhookDeliveryService, WebhookDeliveryService>();
        services.AddScoped<IDeviceApiKeyResolver, DeviceApiKeyResolver>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddScoped<IAuthService, JwtAuthService>();

        // Background jobs
        services.AddHostedService<MissedDoseAndLowStockHostedService>();
        services.AddHostedService<DeviceOfflineDetectionHostedService>();
        services.AddHostedService<DataRetentionHostedService>();

        return services;
    }
}
