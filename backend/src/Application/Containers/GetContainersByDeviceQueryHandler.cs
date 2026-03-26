using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public class GetContainersByDeviceQueryHandler : IRequestHandler<GetContainersByDeviceQuery, IReadOnlyList<ContainerDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IContainerRepository _containerRepository;

    public GetContainersByDeviceQueryHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IContainerRepository containerRepository)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _containerRepository = containerRepository;
    }

    public async Task<IReadOnlyList<ContainerDto>> Handle(GetContainersByDeviceQuery request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return Array.Empty<ContainerDto>();
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null)
            return Array.Empty<ContainerDto>();
        var containers = await _containerRepository.GetByDeviceIdAsync(request.DeviceId, cancellationToken);
        return containers.Select(c => new ContainerDto(
            c.Id, c.DeviceId, c.SlotNumber, c.MedicationName, c.MedicationImageUrl,
            c.Quantity, c.PillsPerDose, c.LowStockThreshold, c.SourceContainerId
        )).ToList();
    }
}
