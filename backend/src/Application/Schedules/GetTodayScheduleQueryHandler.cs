using MediatR;
using Microsoft.Extensions.Caching.Memory;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Schedules;

public class GetTodayScheduleQueryHandler : IRequestHandler<GetTodayScheduleQuery, IReadOnlyList<TodayScheduleItemDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDateTimeProvider _dateTime;
    private readonly IMemoryCache _cache;

    public GetTodayScheduleQueryHandler(IDeviceRepository deviceRepository, IDateTimeProvider dateTime, IMemoryCache cache)
    {
        _deviceRepository = deviceRepository;
        _dateTime = dateTime;
        _cache = cache;
    }

    public async Task<IReadOnlyList<TodayScheduleItemDto>> Handle(GetTodayScheduleQuery request, CancellationToken cancellationToken)
    {
        // Cache today's schedule for 2 minutes per device+timezone to reduce DB queries
        var cacheKey = $"today_schedule_{request.DeviceId}_{request.TimeZoneId ?? "UTC"}";
        if (_cache.TryGetValue<IReadOnlyList<TodayScheduleItemDto>>(cacheKey, out var cached) && cached != null)
            return cached;

        var device = await _deviceRepository.GetByIdWithContainersAndSchedulesAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return Array.Empty<TodayScheduleItemDto>();

        var tz = string.IsNullOrWhiteSpace(request.TimeZoneId) ? TimeZoneInfo.Utc : TimeZoneInfo.FindSystemTimeZoneById(request.TimeZoneId);
        var nowUtc = _dateTime.UtcNow;
        var localToday = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz).Date;
        var dayOfWeek = (int)localToday.DayOfWeek;
        var dayBit = 1 << dayOfWeek;

        var results = new List<TodayScheduleItemDto>();
        foreach (var container in device.Containers.OrderBy(c => c.SlotNumber))
        {
            foreach (var schedule in container.Schedules)
            {
                if (schedule.EndDate.HasValue && schedule.EndDate.Value.Date < localToday)
                    continue;
                if (schedule.StartDate.Date > localToday)
                    continue;
                if ((schedule.DaysOfWeekBitmask & dayBit) == 0)
                    continue;

                var scheduledLocal = localToday.Add(schedule.TimeOfDay.ToTimeSpan());
                var scheduledUtc = TimeZoneInfo.ConvertTimeToUtc(scheduledLocal, tz);
                results.Add(new TodayScheduleItemDto(
                    schedule.Id,
                    container.Id,
                    container.SlotNumber,
                    container.MedicationName,
                    container.MedicationImageUrl,
                    container.PillsPerDose,
                    scheduledUtc,
                    schedule.Notes
                ));
            }
        }
        var result = results.OrderBy(x => x.ScheduledAtUtc).ToList();
        _cache.Set(cacheKey, (IReadOnlyList<TodayScheduleItemDto>)result, TimeSpan.FromMinutes(2));
        return result;
    }
}
