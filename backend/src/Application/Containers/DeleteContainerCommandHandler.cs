using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Containers;

public class DeleteContainerCommandHandler : IRequestHandler<DeleteContainerCommand, bool>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteContainerCommandHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IUnitOfWork unitOfWork)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteContainerCommand request, CancellationToken cancellationToken)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, cancellationToken);
        if (container == null)
            return false;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return false;
        await _containerRepository.DeleteAsync(container, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
