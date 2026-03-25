using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Dispensing;

public class DispenseCommandHandler : IRequestHandler<DispenseCommand, DispenseEventDto?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public DispenseCommandHandler(
        IDeviceRepository deviceRepository,
        IDispenseEventRepository dispenseEventRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _dispenseEventRepository = dispenseEventRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<DispenseEventDto?> Handle(DispenseCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdWithContainersAndSchedulesAsync(request.DeviceId, cancellationToken);
        if (device == null)
            return null;
        if (device.Status != DeviceStatus.Active)
            return null;
        if (request.UserId.HasValue && device.UserId != request.UserId.Value)
            return null;

        Schedule? schedule = null;
        Container? container = null;
        if (request.Request.ScheduleId.HasValue)
        {
            foreach (var c in device.Containers)
            {
                schedule = c.Schedules?.FirstOrDefault(s => s.Id == request.Request.ScheduleId.Value);
                if (schedule != null)
                {
                    container = c;
                    break;
                }
            }
        }
        if (schedule == null || container == null)
            return null;
        if (container.Quantity < container.PillsPerDose)
            throw new InvalidOperationException("Insufficient quantity in container.");

        var scheduledAtUtc = _dateTime.UtcNow;
        var evt = new DispenseEvent
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            ContainerId = container.Id,
            ScheduleId = schedule.Id,
            ScheduledAtUtc = scheduledAtUtc,
            Status = DispenseEventStatus.Dispensed,
            DispensedAtUtc = _dateTime.UtcNow,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _dispenseEventRepository.AddAsync(evt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DispenseEventDto(
            evt.Id, evt.DeviceId, evt.ContainerId, evt.ScheduleId, evt.ScheduledAtUtc,
            evt.Status.ToString(), evt.DispensedAtUtc, evt.ConfirmedAtUtc, evt.MissedMarkedAtUtc,
            container.MedicationName, container.PillsPerDose
        );
    }
}
