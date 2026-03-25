namespace SmartMedicationDispenser.Application.DTOs;

public record ContainerDto(
    Guid Id,
    Guid DeviceId,
    int SlotNumber,
    string MedicationName,
    string? MedicationImageUrl,
    int Quantity,
    int PillsPerDose,
    int LowStockThreshold,
    Guid? SourceContainerId);

public record CreateContainerRequest(
    int SlotNumber,
    string MedicationName,
    string? MedicationImageUrl,
    int Quantity,
    int PillsPerDose,
    int LowStockThreshold,
    Guid? SourceContainerId);

public record UpdateContainerRequest(
    int SlotNumber,
    string MedicationName,
    string? MedicationImageUrl,
    int Quantity,
    int PillsPerDose,
    int LowStockThreshold);
