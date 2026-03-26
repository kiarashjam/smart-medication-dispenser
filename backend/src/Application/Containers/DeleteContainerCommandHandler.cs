using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Containers;

public class DeleteContainerCommandHandler : IRequestHandler<DeleteContainerCommand, bool>
{
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteContainerCommandHandler(
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IUnitOfWork unitOfWork)
    {
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteContainerCommand request, CancellationToken cancellationToken)
    {
        var container = await _containerRepository.GetByIdAsync(request.ContainerId, cancellationToken);
        if (container == null)
            return false;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return false;
        await _containerRepository.DeleteAsync(container, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
