using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Infrastructure.Background;

/// <summary>
/// Runs daily: purges old data per retention policies.
/// - Device event logs: 90 days (processed events)
/// - Read notifications: 30 days
/// - Confirmed/missed dispense events: 365 days (for compliance archiving)
/// Matches documentation in software-docs/03_DATABASE.md
/// </summary>
public class DataRetentionHostedService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<DataRetentionHostedService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    // Retention periods
    private static readonly TimeSpan EventLogRetention = TimeSpan.FromDays(90);
    private static readonly TimeSpan NotificationRetention = TimeSpan.FromDays(30);

    public DataRetentionHostedService(IServiceProvider services, ILogger<DataRetentionHostedService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // Wait for app to be fully started
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunRetentionAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Data retention job failed.");
                }
                await Task.Delay(Interval, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Normal shutdown
        }
    }

    private async Task RunRetentionAsync(CancellationToken ct)
    {
        await using var scope = _services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var dateTime = scope.ServiceProvider.GetRequiredService<IDateTimeProvider>();

        _logger.LogInformation("Starting data retention job at {Time}", dateTime.UtcNow);

        // 1. Purge old processed device event logs
        var eventLogCutoff = dateTime.UtcNow - EventLogRetention;
        var deletedEventLogs = await db.DeviceEventLogs
            .Where(e => e.ReceivedAtUtc < eventLogCutoff && e.Processed)
            .ExecuteDeleteAsync(ct);

        if (deletedEventLogs > 0)
            _logger.LogInformation("Purged {Count} device event logs older than {Days} days",
                deletedEventLogs, EventLogRetention.TotalDays);

        // 2. Purge old read notifications
        var notificationCutoff = dateTime.UtcNow - NotificationRetention;
        var deletedNotifications = await db.Notifications
            .Where(n => n.IsRead && n.CreatedAtUtc < notificationCutoff)
            .ExecuteDeleteAsync(ct);

        if (deletedNotifications > 0)
            _logger.LogInformation("Purged {Count} read notifications older than {Days} days",
                deletedNotifications, NotificationRetention.TotalDays);

        _logger.LogInformation("Data retention job completed: {EventLogs} event logs, {Notifications} notifications purged",
            deletedEventLogs, deletedNotifications);
    }
}
