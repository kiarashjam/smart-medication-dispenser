using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class GetDeviceScheduleQueryHandler : IRequestHandler<GetDeviceScheduleQuery, DeviceScheduleResponse>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<GetDeviceScheduleQueryHandler> _logger;

    public GetDeviceScheduleQueryHandler(
        IDeviceRepository deviceRepository,
        IDateTimeProvider dateTime,
        ILogger<GetDeviceScheduleQueryHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<DeviceScheduleResponse> Handle(GetDeviceScheduleQuery request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdWithContainersAndSchedulesAsync(request.DeviceId, ct);
        if (device == null)
            return new DeviceScheduleResponse(new List<ScheduleItem>());

        var scheduleItems = new List<ScheduleItem>();

        foreach (var container in device.Containers)
        {
            foreach (var schedule in container.Schedules)
            {
                // Check if schedule is currently active
                var today = _dateTime.UtcNow.Date;
                if (schedule.StartDate > today) continue;
                if (schedule.EndDate.HasValue && schedule.EndDate.Value < today) continue;

                // Convert bitmask to day names
                var days = ConvertBitmaskToDays(schedule.DaysOfWeekBitmask);
                var times = new List<string> { schedule.TimeOfDay.ToString("HH:mm") };

                scheduleItems.Add(new ScheduleItem(
                    Id: schedule.Id.ToString(),
                    Medication: container.MedicationName,
                    Slot: container.SlotNumber,
                    Pills: container.PillsPerDose,
                    Times: times,
                    Days: days
                ));
            }
        }

        _logger.LogDebug("Returning {Count} schedule items for device {DeviceId}",
            scheduleItems.Count, request.DeviceId);

        return new DeviceScheduleResponse(scheduleItems);
    }

    private static List<string> ConvertBitmaskToDays(int bitmask)
    {
        var days = new List<string>();
        if ((bitmask & 0x01) != 0) days.Add("mon");
        if ((bitmask & 0x02) != 0) days.Add("tue");
        if ((bitmask & 0x04) != 0) days.Add("wed");
        if ((bitmask & 0x08) != 0) days.Add("thu");
        if ((bitmask & 0x10) != 0) days.Add("fri");
        if ((bitmask & 0x20) != 0) days.Add("sat");
        if ((bitmask & 0x40) != 0) days.Add("sun");
        return days;
    }
}
