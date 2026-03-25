using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public class GetScheduleByIdQueryHandler : IRequestHandler<GetScheduleByIdQuery, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;

    public GetScheduleByIdQueryHandler(
        IScheduleRepository scheduleRepository,
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository)
    {
        _scheduleRepository = scheduleRepository;
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
    }

    public async Task<ScheduleDto?> Handle(GetScheduleByIdQuery request, CancellationToken ct)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, ct);
        if (schedule == null) return null;

        // Verify ownership: schedule -> container -> device -> user
        var container = await _containerRepository.GetByIdAsync(schedule.ContainerId, ct);
        if (container == null) return null;

        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, ct);
        if (device == null || device.UserId != request.UserId) return null;

        return new ScheduleDto(
            schedule.Id,
            schedule.ContainerId,
            schedule.TimeOfDay,
            schedule.DaysOfWeekBitmask,
            schedule.StartDate,
            schedule.EndDate,
            schedule.Notes,
            schedule.TimeZoneId
        );
    }
}
