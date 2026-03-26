using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public class UpdateContainerCommandHandler : IRequestHandler<UpdateContainerCommand, ContainerDto?>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public UpdateContainerCommandHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<ContainerDto?> Handle(UpdateContainerCommand request, CancellationToken cancellationToken)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, cancellationToken);
        if (container == null)
            return null;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return null;
        var r = request.Request;
        container.SlotNumber = r.SlotNumber;
        container.MedicationName = r.MedicationName;
        container.MedicationImageUrl = r.MedicationImageUrl;
        container.Quantity = Math.Max(0, r.Quantity);
        container.PillsPerDose = r.PillsPerDose;
        container.LowStockThreshold = r.LowStockThreshold;
        container.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new ContainerDto(container.Id, container.DeviceId, container.SlotNumber, container.MedicationName,
            container.MedicationImageUrl, container.Quantity, container.PillsPerDose, container.LowStockThreshold, container.SourceContainerId);
    }
}
