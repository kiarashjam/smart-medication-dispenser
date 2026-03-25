using MediatR;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.DeviceApi;

public class SyncInventoryCommandHandler : IRequestHandler<SyncInventoryCommand, SyncInventoryResult>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<SyncInventoryCommandHandler> _logger;

    public SyncInventoryCommandHandler(
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime,
        ILogger<SyncInventoryCommandHandler> logger)
    {
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<SyncInventoryResult> Handle(SyncInventoryCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdWithContainersAsync(request.DeviceId, ct);
        if (device == null)
            return new SyncInventoryResult(false, _dateTime.UtcNow);

        foreach (var slotData in request.Slots)
        {
            var container = device.Containers.FirstOrDefault(c => c.SlotNumber == slotData.Slot);
            if (container != null)
            {
                container.Quantity = slotData.Pills;
                if (!string.IsNullOrEmpty(slotData.Medication))
                    container.MedicationName = slotData.Medication;
                container.UpdatedAtUtc = _dateTime.UtcNow;
            }
        }

        device.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Inventory synced for device {DeviceId}, {SlotCount} slots updated",
            request.DeviceId, request.Slots.Count);

        return new SyncInventoryResult(true, _dateTime.UtcNow);
    }
}
