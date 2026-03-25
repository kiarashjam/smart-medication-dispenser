using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Integrations;

public class DeleteDeviceApiKeyCommandHandler : IRequestHandler<DeleteDeviceApiKeyCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceApiKeyRepository _apiKeyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteDeviceApiKeyCommandHandler(IDeviceRepository deviceRepository, IDeviceApiKeyRepository apiKeyRepository, IUnitOfWork unitOfWork)
    {
        _deviceRepository = deviceRepository;
        _apiKeyRepository = apiKeyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteDeviceApiKeyCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId) return false;
        var ok = await _apiKeyRepository.DeleteAsync(request.ApiKeyId, request.DeviceId, cancellationToken);
        if (ok) await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ok;
    }
}
