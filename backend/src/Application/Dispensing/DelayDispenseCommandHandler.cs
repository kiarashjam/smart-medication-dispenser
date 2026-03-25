using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Dispensing;

public class DelayDispenseCommandHandler : IRequestHandler<DelayDispenseCommand, DispenseEventDto?>
{
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public DelayDispenseCommandHandler(
        IDispenseEventRepository dispenseEventRepository,
        IDeviceRepository deviceRepository,
        IContainerRepository containerRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _dispenseEventRepository = dispenseEventRepository;
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<DispenseEventDto?> Handle(DelayDispenseCommand request, CancellationToken cancellationToken)
    {
        var evt = await _dispenseEventRepository.GetByIdAsync(request.DispenseEventId, cancellationToken);
        if (evt == null)
            return null;
        var device = await _deviceRepository.GetByIdAsync(evt.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return null;
        if (evt.Status != DispenseEventStatus.Pending && evt.Status != DispenseEventStatus.Dispensed)
            return null;
        evt.Status = DispenseEventStatus.Delayed;
        evt.DelayedAtUtc = _dateTime.UtcNow;
        var container = await _containerRepository.GetByIdAsync(evt.ContainerId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new DispenseEventDto(
            evt.Id, evt.DeviceId, evt.ContainerId, evt.ScheduleId, evt.ScheduledAtUtc,
            evt.Status.ToString(), evt.DispensedAtUtc, evt.ConfirmedAtUtc, evt.MissedMarkedAtUtc,
            container?.MedicationName ?? "", container?.PillsPerDose ?? 0
        );
    }
}
