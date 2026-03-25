using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Infrastructure.Background;

/// <summary>Runs every 5 minutes: marks overdue dispense events as Missed (and notifies caregiver), creates LowStock notifications.</summary>
public class MissedDoseAndLowStockHostedService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<MissedDoseAndLowStockHostedService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan MissedThreshold = TimeSpan.FromMinutes(60);

    public MissedDoseAndLowStockHostedService(IServiceProvider services, ILogger<MissedDoseAndLowStockHostedService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunOnceAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background job failed.");
                }
                await Task.Delay(Interval, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Normal shutdown
        }
    }

    private async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        await using var scope = _services.CreateAsyncScope();
        var dispenseRepo = scope.ServiceProvider.GetRequiredService<IDispenseEventRepository>();
        var deviceRepo = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();
        var notificationRepo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dateTime = scope.ServiceProvider.GetRequiredService<IDateTimeProvider>();
        var webhookEndpoints = scope.ServiceProvider.GetRequiredService<IWebhookEndpointRepository>();
        var webhookDelivery = scope.ServiceProvider.GetRequiredService<IWebhookDeliveryService>();

        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var threshold = dateTime.UtcNow - MissedThreshold;
        var pending = await dispenseRepo.GetPendingDispensedEventsOlderThanAsync(threshold, cancellationToken);
        foreach (var evt in pending)
        {
            evt.Status = DispenseEventStatus.Missed;
            evt.MissedMarkedAtUtc = dateTime.UtcNow;
            var device = await deviceRepo.GetByIdAsync(evt.DeviceId, cancellationToken);
            if (device != null)
            {
                await notificationRepo.AddAsync(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = device.UserId,
                    Type = NotificationType.MissedDose,
                    Title = "Missed dose",
                    Body = "A scheduled dose was not confirmed in time.",
                    IsRead = false,
                    CreatedAtUtc = dateTime.UtcNow,
                    RelatedEntityId = evt.Id
                }, cancellationToken);
                var patient = await userRepo.GetByIdAsync(device.UserId, cancellationToken);
                if (patient?.CaregiverUserId != null)
                {
                    await notificationRepo.AddAsync(new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = patient.CaregiverUserId.Value,
                        Type = NotificationType.MissedDose,
                        Title = "Patient missed dose",
                        Body = "A scheduled dose was not confirmed in time.",
                        IsRead = false,
                        CreatedAtUtc = dateTime.UtcNow,
                        RelatedEntityId = evt.Id
                    }, cancellationToken);
                }
                await SendWebhooksAsync(webhookEndpoints, webhookDelivery, device.UserId, "notification.missed_dose", new { dispenseEventId = evt.Id, deviceId = evt.DeviceId }, cancellationToken);
                if (patient?.CaregiverUserId != null)
                    await SendWebhooksAsync(webhookEndpoints, webhookDelivery, patient.CaregiverUserId.Value, "notification.missed_dose", new { dispenseEventId = evt.Id, deviceId = evt.DeviceId, role = "caregiver" }, cancellationToken);
            }
        }

        var containerRepo = scope.ServiceProvider.GetRequiredService<IContainerRepository>();
        var lowStock = await containerRepo.GetLowStockContainersAsync(cancellationToken);
        foreach (var c in lowStock)
        {
            if (c.LowStockThreshold < 0) continue;
            var hasExisting = await notificationRepo.HasUnreadLowStockForContainerAsync(c.Device.UserId, c.Id, cancellationToken);
            if (!hasExisting)
            {
                await notificationRepo.AddAsync(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = c.Device.UserId,
                    Type = NotificationType.LowStock,
                    Title = "Low stock",
                    Body = $"{c.MedicationName} (slot {c.SlotNumber}) is low: {c.Quantity} remaining.",
                    IsRead = false,
                    CreatedAtUtc = dateTime.UtcNow,
                    RelatedEntityId = c.Id
                }, cancellationToken);
                await SendWebhooksAsync(webhookEndpoints, webhookDelivery, c.Device.UserId, "notification.low_stock", new { containerId = c.Id, deviceId = c.DeviceId, medicationName = c.MedicationName, quantity = c.Quantity }, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task SendWebhooksAsync(IWebhookEndpointRepository webhookEndpoints, IWebhookDeliveryService webhookDelivery, Guid userId, string eventType, object data, CancellationToken cancellationToken)
    {
        var endpoints = await webhookEndpoints.GetActiveByUserIdAsync(userId, cancellationToken);
        foreach (var ep in endpoints)
        {
            var payload = new { eventType, timestampUtc = DateTime.UtcNow, data };
            var status = await webhookDelivery.SendAsync(ep.Url, payload, ep.Secret, cancellationToken);
            if (status.HasValue) await webhookEndpoints.UpdateLastTriggeredAsync(ep.Id, status.Value.ToString(), cancellationToken);
        }
    }
}
