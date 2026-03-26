using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Dispensing;

public class ConfirmDispenseCommandHandler : IRequestHandler<ConfirmDispenseCommand, DispenseEventDto?>
{
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;
    private readonly IWebhookEndpointRepository _webhookEndpoints;
    private readonly IWebhookDeliveryService _webhookDelivery;

    public ConfirmDispenseCommandHandler(
        IDispenseEventRepository dispenseEventRepository,
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime,
        IWebhookEndpointRepository webhookEndpoints,
        IWebhookDeliveryService webhookDelivery)
    {
        _dispenseEventRepository = dispenseEventRepository;
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
        _webhookEndpoints = webhookEndpoints;
        _webhookDelivery = webhookDelivery;
    }

    public async Task<DispenseEventDto?> Handle(ConfirmDispenseCommand request, CancellationToken cancellationToken)
    {
        var evt = await _dispenseEventRepository.GetByIdAsync(request.DispenseEventId, cancellationToken);
        if (evt == null)
            return null;
        var device = await _deviceRepository.GetByIdAsync(evt.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return null;
        if (evt.Status != DispenseEventStatus.Dispensed)
            throw new InvalidOperationException("Only dispensed events can be confirmed.");
        var container = await _containerRepository.GetByIdAsync(evt.ContainerId, cancellationToken);
        if (container == null)
            return null;
        if (container.Quantity < container.PillsPerDose)
            throw new InvalidOperationException("Insufficient quantity in container.");
        evt.Status = DispenseEventStatus.Confirmed;
        evt.ConfirmedAtUtc = _dateTime.UtcNow;
        container.Quantity -= container.PillsPerDose;
        container.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Notify outgoing webhooks (fire-and-forget style; do not fail the request).
        var endpoints = await _webhookEndpoints.GetActiveByUserIdAsync(device.UserId, cancellationToken);
        foreach (var ep in endpoints)
        {
            var payload = new
            {
                eventType = "dispense.confirmed",
                timestampUtc = _dateTime.UtcNow,
                data = new
                {
                    dispenseEventId = evt.Id,
                    deviceId = evt.DeviceId,
                    containerId = evt.ContainerId,
                    scheduleId = evt.ScheduleId,
                    medicationName = container.MedicationName,
                    pillsPerDose = container.PillsPerDose
                }
            };
            var status = await _webhookDelivery.SendAsync(ep.Url, payload, ep.Secret, cancellationToken);
            if (status.HasValue) await _webhookEndpoints.UpdateLastTriggeredAsync(ep.Id, status.Value.ToString(), cancellationToken);
        }
        if (endpoints.Count > 0) await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DispenseEventDto(
            evt.Id, evt.DeviceId, evt.ContainerId, evt.ScheduleId, evt.ScheduledAtUtc,
            evt.Status.ToString(), evt.DispensedAtUtc, evt.ConfirmedAtUtc, evt.MissedMarkedAtUtc,
            container.MedicationName, container.PillsPerDose
        );
    }
}
