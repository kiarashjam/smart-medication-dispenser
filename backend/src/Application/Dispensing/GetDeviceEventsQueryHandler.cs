using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Dispensing;

public class GetDeviceEventsQueryHandler : IRequestHandler<GetDeviceEventsQuery, IReadOnlyList<DispenseEventDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IDispenseEventRepository _dispenseEventRepository;

    public GetDeviceEventsQueryHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IDispenseEventRepository dispenseEventRepository)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _dispenseEventRepository = dispenseEventRepository;
    }

    public async Task<IReadOnlyList<DispenseEventDto>> Handle(GetDeviceEventsQuery request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return Array.Empty<DispenseEventDto>();
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null)
            return Array.Empty<DispenseEventDto>();
        var limit = request.Limit <= 0 ? 100 : Math.Min(request.Limit, 500);
        var events = await _dispenseEventRepository.GetByDeviceIdAsync(
            request.DeviceId, request.FromUtc, request.ToUtc, limit, cancellationToken);
        return events.Select(e => new DispenseEventDto(
            e.Id, e.DeviceId, e.ContainerId, e.ScheduleId, e.ScheduledAtUtc,
            e.Status.ToString(), e.DispensedAtUtc, e.ConfirmedAtUtc, e.MissedMarkedAtUtc,
            e.Container?.MedicationName ?? "", e.Container?.PillsPerDose ?? 0
        )).ToList();
    }
}
