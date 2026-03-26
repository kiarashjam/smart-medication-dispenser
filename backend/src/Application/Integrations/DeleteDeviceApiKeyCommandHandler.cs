using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Integrations;

public class DeleteDeviceApiKeyCommandHandler : IRequestHandler<DeleteDeviceApiKeyCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IDeviceApiKeyRepository _apiKeyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteDeviceApiKeyCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IDeviceApiKeyRepository apiKeyRepository,
        IUnitOfWork unitOfWork)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _apiKeyRepository = apiKeyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteDeviceApiKeyCommand request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return false;
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null) return false;
        var ok = await _apiKeyRepository.DeleteAsync(request.ApiKeyId, request.DeviceId, cancellationToken);
        if (ok) await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ok;
    }
}
