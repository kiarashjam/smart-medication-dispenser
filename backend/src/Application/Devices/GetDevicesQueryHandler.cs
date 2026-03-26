using MediatR;
using Microsoft.Extensions.Caching.Memory;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class GetDevicesQueryHandler : IRequestHandler<GetDevicesQuery, IReadOnlyList<DeviceDto>>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IMemoryCache _cache;

    public GetDevicesQueryHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IMemoryCache cache)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _cache = cache;
    }

    public async Task<IReadOnlyList<DeviceDto>> Handle(GetDevicesQuery request, CancellationToken cancellationToken)
    {
        var ownerIds = await _deviceAccess.GetAccessibleDeviceOwnerUserIdsAsync(request.UserId, cancellationToken);
        var cacheKey = $"devices_{request.UserId}_{string.Join(',', ownerIds.OrderBy(x => x))}";
        if (_cache.TryGetValue<IReadOnlyList<DeviceDto>>(cacheKey, out var cached) && cached != null)
            return cached;

        var devices = await _deviceRepository.GetByUserIdsAsync(ownerIds, cancellationToken);
        var result = devices.Select(d => d.ToDto()).ToList();
        _cache.Set(cacheKey, (IReadOnlyList<DeviceDto>)result, TimeSpan.FromMinutes(1));
        return result;
    }
}

/// <summary>Extension methods for mapping Device to DTOs</summary>
public static class DeviceMappingExtensions
{
    public static DeviceDto ToDto(this Device d) => new(
        d.Id,
        d.UserId,
        d.Name,
        d.Type.ToString(),
        d.Status.ToString(),
        d.TimeZoneId,
        d.LastHeartbeatAtUtc,
        d.FirmwareVersion,
        d.IsOnline,
        d.BatteryLevel,
        d.WifiSignal,
        d.Temperature,
        d.Humidity
    );
}
