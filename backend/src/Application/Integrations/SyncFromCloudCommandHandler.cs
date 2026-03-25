using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Integrations;

public class SyncFromCloudCommandHandler : IRequestHandler<SyncFromCloudCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public SyncFromCloudCommandHandler(
        IDeviceRepository deviceRepository,
        IContainerRepository containerRepository,
        IScheduleRepository scheduleRepository,
        IDispenseEventRepository dispenseEventRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
        _scheduleRepository = scheduleRepository;
        _dispenseEventRepository = dispenseEventRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<bool> Handle(SyncFromCloudCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null) return false;

        var r = request.Request;

        if (r.Device != null)
        {
            if (r.Device.Status != null)
            {
                if (string.Equals(r.Device.Status, "Paused", StringComparison.OrdinalIgnoreCase)) device.Status = DeviceStatus.Paused;
                else if (string.Equals(r.Device.Status, "Active", StringComparison.OrdinalIgnoreCase)) device.Status = DeviceStatus.Active;
            }
            if (r.Device.TimeZoneId != null) device.TimeZoneId = r.Device.TimeZoneId;
            if (r.Device.LastHeartbeatAtUtc.HasValue) device.LastHeartbeatAtUtc = r.Device.LastHeartbeatAtUtc;
            device.UpdatedAtUtc = _dateTime.UtcNow;
        }

        if (r.Events != null)
        {
            foreach (var e in r.Events)
            {
                if (!Guid.TryParse(e.ContainerId, out var containerId) || !Guid.TryParse(e.ScheduleId, out var scheduleId)) continue;
                var container = await _containerRepository.GetByIdAsync(containerId, cancellationToken);
                var schedule = await _scheduleRepository.GetByIdAsync(scheduleId, cancellationToken);
                if (container == null || schedule == null || container.DeviceId != request.DeviceId || schedule.ContainerId != containerId) continue;
                var status = ParseStatus(e.Status);
                var evt = new DispenseEvent
                {
                    Id = Guid.NewGuid(),
                    DeviceId = request.DeviceId,
                    ContainerId = containerId,
                    ScheduleId = scheduleId,
                    ScheduledAtUtc = e.ScheduledAtUtc,
                    Status = status,
                    DispensedAtUtc = e.DispensedAtUtc ?? (status != DispenseEventStatus.Pending ? _dateTime.UtcNow : null),
                    ConfirmedAtUtc = e.ConfirmedAtUtc,
                    CreatedAtUtc = _dateTime.UtcNow
                };
                await _dispenseEventRepository.AddAsync(evt, cancellationToken);
                if (status == DispenseEventStatus.Confirmed && container.Quantity >= container.PillsPerDose)
                {
                    container.Quantity -= container.PillsPerDose;
                    container.UpdatedAtUtc = _dateTime.UtcNow;
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static DispenseEventStatus ParseStatus(string? s)
    {
        if (string.IsNullOrEmpty(s)) return DispenseEventStatus.Pending;
        return s.ToLowerInvariant() switch
        {
            "dispensed" => DispenseEventStatus.Dispensed,
            "confirmed" => DispenseEventStatus.Confirmed,
            "missed" => DispenseEventStatus.Missed,
            "delayed" => DispenseEventStatus.Delayed,
            _ => DispenseEventStatus.Pending
        };
    }
}
