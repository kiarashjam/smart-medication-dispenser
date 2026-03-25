using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public class UpdateScheduleCommandHandler : IRequestHandler<UpdateScheduleCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public UpdateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _scheduleRepository = scheduleRepository;
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<ScheduleDto?> Handle(UpdateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
            return null;
        var container = await _containerRepository.GetByIdAsync(schedule.ContainerId, cancellationToken);
        if (container == null)
            return null;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return null;
        var r = request.Request;
        schedule.TimeOfDay = r.TimeOfDay;
        schedule.DaysOfWeekBitmask = r.DaysOfWeekBitmask;
        schedule.StartDate = r.StartDate;
        schedule.EndDate = r.EndDate;
        schedule.Notes = r.Notes;
        schedule.TimeZoneId = r.TimeZoneId;
        schedule.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new ScheduleDto(schedule.Id, schedule.ContainerId, schedule.TimeOfDay, schedule.DaysOfWeekBitmask,
            schedule.StartDate, schedule.EndDate, schedule.Notes, schedule.TimeZoneId);
    }
}
