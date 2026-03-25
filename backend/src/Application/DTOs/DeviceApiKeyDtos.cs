namespace SmartMedicationDispenser.Application.DTOs;

public record DeviceApiKeyDto(Guid Id, string? Name, DateTime CreatedAtUtc, DateTime? LastUsedAtUtc);
