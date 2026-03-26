using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Schedules;

public class GetSchedulesByContainerQueryHandler : IRequestHandler<GetSchedulesByContainerQuery, IReadOnlyList<ScheduleDto>>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IScheduleRepository _scheduleRepository;

    public GetSchedulesByContainerQueryHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IScheduleRepository scheduleRepository)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _scheduleRepository = scheduleRepository;
    }

    public async Task<IReadOnlyList<ScheduleDto>> Handle(GetSchedulesByContainerQuery request, CancellationToken cancellationToken)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, cancellationToken);
        if (container == null)
            return Array.Empty<ScheduleDto>();
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return Array.Empty<ScheduleDto>();
        var schedules = await _scheduleRepository.GetByContainerIdAsync(request.ContainerId, cancellationToken);
        return schedules.Select(s => new ScheduleDto(
            s.Id, s.ContainerId, s.TimeOfDay, s.DaysOfWeekBitmask, s.StartDate, s.EndDate, s.Notes, s.TimeZoneId
        )).ToList();
    }
}
