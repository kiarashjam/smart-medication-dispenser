namespace SmartMedicationDispenser.Application.DTOs;

public record StartTravelRequest(Guid PortableDeviceId, int Days);
public record TravelSessionDto(Guid Id, Guid MainDeviceId, Guid PortableDeviceId, DateTime StartedAtUtc, DateTime? EndedAtUtc, DateTime PlannedEndDateUtc);
