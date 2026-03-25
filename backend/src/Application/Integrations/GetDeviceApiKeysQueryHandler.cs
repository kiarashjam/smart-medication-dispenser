using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public class GetDeviceApiKeysQueryHandler : IRequestHandler<GetDeviceApiKeysQuery, IReadOnlyList<DeviceApiKeyDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceApiKeyRepository _apiKeyRepository;

    public GetDeviceApiKeysQueryHandler(IDeviceRepository deviceRepository, IDeviceApiKeyRepository apiKeyRepository)
    {
        _deviceRepository = deviceRepository;
        _apiKeyRepository = apiKeyRepository;
    }

    public async Task<IReadOnlyList<DeviceApiKeyDto>> Handle(GetDeviceApiKeysQuery request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId) return Array.Empty<DeviceApiKeyDto>();
        var keys = await _apiKeyRepository.GetByDeviceIdAsync(request.DeviceId, cancellationToken);
        return keys.Select(k => new DeviceApiKeyDto(k.Id, k.Name, k.CreatedAtUtc, k.LastUsedAtUtc)).ToList();
    }
}
