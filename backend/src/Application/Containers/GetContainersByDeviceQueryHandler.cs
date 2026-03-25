using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Containers;

public class GetContainersByDeviceQueryHandler : IRequestHandler<GetContainersByDeviceQuery, IReadOnlyList<ContainerDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;

    public GetContainersByDeviceQueryHandler(IDeviceRepository deviceRepository, IContainerRepository containerRepository)
    {
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
    }

    public async Task<IReadOnlyList<ContainerDto>> Handle(GetContainersByDeviceQuery request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return Array.Empty<ContainerDto>();
        var containers = await _containerRepository.GetByDeviceIdAsync(request.DeviceId, cancellationToken);
        return containers.Select(c => new ContainerDto(
            c.Id, c.DeviceId, c.SlotNumber, c.MedicationName, c.MedicationImageUrl,
            c.Quantity, c.PillsPerDose, c.LowStockThreshold, c.SourceContainerId
        )).ToList();
    }
}
