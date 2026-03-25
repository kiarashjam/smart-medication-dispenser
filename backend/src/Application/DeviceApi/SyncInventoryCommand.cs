using MediatR;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Sync device slot inventory with cloud.</summary>
public record SyncInventoryCommand(
    Guid DeviceId,
    List<InventorySlot> Slots
) : IRequest<SyncInventoryResult>;

public record InventorySlot(
    int Slot,
    string? Medication,
    int Pills,
    int? Capacity
);

public record SyncInventoryResult(
    bool Success,
    DateTime SyncedAt
);
