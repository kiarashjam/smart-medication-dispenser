using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Devices;

public class GetDeviceByIdQueryHandler : IRequestHandler<GetDeviceByIdQuery, DeviceDto?>
{
    private readonly IDeviceAccessService _deviceAccess;

    public GetDeviceByIdQueryHandler(IDeviceAccessService deviceAccess)
    {
        _deviceAccess = deviceAccess;
    }

    public async Task<DeviceDto?> Handle(GetDeviceByIdQuery request, CancellationToken cancellationToken)
    {
        var device = await _deviceAccess.GetDeviceIfAccessibleAsync(request.UserId, request.DeviceId, cancellationToken);
        return device?.ToDto();
    }
}
