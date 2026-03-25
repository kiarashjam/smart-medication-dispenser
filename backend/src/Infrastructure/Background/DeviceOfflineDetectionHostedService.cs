using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Infrastructure.Background;

/// <summary>
/// Runs every 2 minutes: marks devices as offline if no heartbeat received within 3 minutes.
/// Creates notifications for device owners and caregivers when a device goes offline.
/// </summary>
public class DeviceOfflineDetectionHostedService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<DeviceOfflineDetectionHostedService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(2);
    private static readonly TimeSpan OfflineThreshold = TimeSpan.FromMinutes(3);

    public DeviceOfflineDetectionHostedService(IServiceProvider services, ILogger<DeviceOfflineDetectionHostedService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // Wait a bit before first run to let the app start
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DetectOfflineDevicesAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Device offline detection failed.");
                }
                await Task.Delay(Interval, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Normal shutdown
        }
    }

    private async Task DetectOfflineDevicesAsync(CancellationToken ct)
    {
        await using var scope = _services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var notificationRepo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dateTime = scope.ServiceProvider.GetRequiredService<IDateTimeProvider>();

        var threshold = dateTime.UtcNow - OfflineThreshold;

        // Find devices that are marked online but haven't sent a heartbeat recently
        var staleDevices = await db.Devices
            .Where(d => d.IsOnline && d.LastHeartbeatAtUtc < threshold)
            .ToListAsync(ct);

        if (staleDevices.Count == 0) return;

        _logger.LogInformation("Detected {Count} devices that appear to be offline", staleDevices.Count);

        foreach (var device in staleDevices)
        {
            device.IsOnline = false;
            device.LastOfflineAtUtc = dateTime.UtcNow;
            device.UpdatedAtUtc = dateTime.UtcNow;

            // Notify owner
            await notificationRepo.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = device.UserId,
                Type = NotificationType.DeviceOffline,
                Title = "Device offline",
                Body = $"{device.Name} has not sent a heartbeat in {OfflineThreshold.TotalMinutes} minutes.",
                IsRead = false,
                CreatedAtUtc = dateTime.UtcNow,
                RelatedEntityId = device.Id
            }, ct);

            // Notify caregiver
            var patient = await userRepo.GetByIdAsync(device.UserId, ct);
            if (patient?.CaregiverUserId != null)
            {
                await notificationRepo.AddAsync(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = patient.CaregiverUserId.Value,
                    Type = NotificationType.DeviceOffline,
                    Title = "Patient device offline",
                    Body = $"{device.Name} appears to be offline.",
                    IsRead = false,
                    CreatedAtUtc = dateTime.UtcNow,
                    RelatedEntityId = device.Id
                }, ct);
            }

            _logger.LogWarning("Device {DeviceId} ({DeviceName}) marked offline, last heartbeat: {LastHB}",
                device.Id, device.Name, device.LastHeartbeatAtUtc);
        }

        await unitOfWork.SaveChangesAsync(ct);
    }
}
