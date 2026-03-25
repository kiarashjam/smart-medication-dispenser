namespace SmartMedicationDispenser.Application.DTOs;

public record DispenseEventDto(
    Guid Id,
    Guid DeviceId,
    Guid ContainerId,
    Guid ScheduleId,
    DateTime ScheduledAtUtc,
    string Status,
    DateTime? DispensedAtUtc,
    DateTime? ConfirmedAtUtc,
    DateTime? MissedMarkedAtUtc,
    string? MedicationName,
    int PillsPerDose);

public record DispenseRequest(Guid? ScheduleId);
public record ConfirmDispenseRequest;
public record DelayDispenseRequest(int Minutes);
