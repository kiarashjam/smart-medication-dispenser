using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Schedules;

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, ScheduleDto?>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public CreateScheduleCommandHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<ScheduleDto?> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, cancellationToken);
        if (container == null)
            return null;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return null;
        var r = request.Request;
        var schedule = new Schedule
        {
            Id = Guid.NewGuid(),
            ContainerId = request.ContainerId,
            TimeOfDay = r.TimeOfDay,
            DaysOfWeekBitmask = r.DaysOfWeekBitmask,
            StartDate = r.StartDate,
            EndDate = r.EndDate,
            Notes = r.Notes,
            TimeZoneId = r.TimeZoneId,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _scheduleRepository.AddAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new ScheduleDto(schedule.Id, schedule.ContainerId, schedule.TimeOfDay, schedule.DaysOfWeekBitmask,
            schedule.StartDate, schedule.EndDate, schedule.Notes, schedule.TimeZoneId);
    }
}
