using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public class GetDeviceApiKeysQueryHandler : IRequestHandler<GetDeviceApiKeysQuery, IReadOnlyList<DeviceApiKeyDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IDeviceApiKeyRepository _apiKeyRepository;

    public GetDeviceApiKeysQueryHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IDeviceApiKeyRepository apiKeyRepository)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _apiKeyRepository = apiKeyRepository;
    }

    public async Task<IReadOnlyList<DeviceApiKeyDto>> Handle(GetDeviceApiKeysQuery request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return Array.Empty<DeviceApiKeyDto>();
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null) return Array.Empty<DeviceApiKeyDto>();
        var keys = await _apiKeyRepository.GetByDeviceIdAsync(request.DeviceId, cancellationToken);
        return keys.Select(k => new DeviceApiKeyDto(k.Id, k.Name, k.CreatedAtUtc, k.LastUsedAtUtc)).ToList();
    }
}
