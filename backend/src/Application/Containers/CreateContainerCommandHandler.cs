using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Containers;

public class CreateContainerCommandHandler : IRequestHandler<CreateContainerCommand, ContainerDto?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public CreateContainerCommandHandler(
        IDeviceRepository deviceRepository,
        IContainerRepository containerRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _containerRepository = containerRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<ContainerDto?> Handle(CreateContainerCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return null;
        var r = request.Request;
        var container = new Container
        {
            Id = Guid.NewGuid(),
            DeviceId = request.DeviceId,
            SlotNumber = r.SlotNumber,
            MedicationName = r.MedicationName,
            MedicationImageUrl = r.MedicationImageUrl,
            Quantity = r.Quantity,
            PillsPerDose = r.PillsPerDose,
            LowStockThreshold = r.LowStockThreshold,
            SourceContainerId = r.SourceContainerId,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _containerRepository.AddAsync(container, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new ContainerDto(container.Id, container.DeviceId, container.SlotNumber, container.MedicationName,
            container.MedicationImageUrl, container.Quantity, container.PillsPerDose, container.LowStockThreshold, container.SourceContainerId);
    }
}
