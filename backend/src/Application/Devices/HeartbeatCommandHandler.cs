using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class HeartbeatCommandHandler : IRequestHandler<HeartbeatCommand, bool>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public HeartbeatCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<bool> Handle(HeartbeatCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null)
            return false;
        if (request.UserId.HasValue &&
            !await _deviceAccess.CanAccessDeviceAsync(request.UserId.Value, request.DeviceId, cancellationToken))
            return false;
        device.LastHeartbeatAtUtc = _dateTime.UtcNow;
        device.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
