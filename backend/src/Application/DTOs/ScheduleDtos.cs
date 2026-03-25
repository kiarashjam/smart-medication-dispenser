namespace SmartMedicationDispenser.Application.DTOs;

public record ScheduleDto(
    Guid Id,
    Guid ContainerId,
    TimeOnly TimeOfDay,
    int DaysOfWeekBitmask,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes,
    string? TimeZoneId);

public record CreateScheduleRequest(
    TimeOnly TimeOfDay,
    int DaysOfWeekBitmask,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes,
    string? TimeZoneId);

public record UpdateScheduleRequest(
    TimeOnly TimeOfDay,
    int DaysOfWeekBitmask,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes,
    string? TimeZoneId);

public record TodayScheduleItemDto(
    Guid ScheduleId,
    Guid ContainerId,
    int SlotNumber,
    string MedicationName,
    string? MedicationImageUrl,
    int PillsPerDose,
    DateTime ScheduledAtUtc,
    string? Notes);
