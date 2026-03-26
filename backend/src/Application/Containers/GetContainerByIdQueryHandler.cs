using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public class GetContainerByIdQueryHandler : IRequestHandler<GetContainerByIdQuery, ContainerDto?>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;

    public GetContainerByIdQueryHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
    }

    public async Task<ContainerDto?> Handle(GetContainerByIdQuery request, CancellationToken ct)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, ct);
        if (container == null) return null;

        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, ct);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, ct)) return null;

        return new ContainerDto(
            container.Id,
            container.DeviceId,
            container.SlotNumber,
            container.MedicationName,
            container.MedicationImageUrl,
            container.Quantity,
            container.PillsPerDose,
            container.LowStockThreshold,
            container.SourceContainerId
        );
    }
}
