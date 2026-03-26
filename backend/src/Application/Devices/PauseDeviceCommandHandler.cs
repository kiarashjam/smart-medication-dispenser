using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class PauseDeviceCommandHandler : IRequestHandler<PauseDeviceCommand, DeviceDto?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public PauseDeviceCommandHandler(
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

    public async Task<DeviceDto?> Handle(PauseDeviceCommand request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return null;
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null)
            return null;
        device.Status = DeviceStatus.Paused;
        device.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return device.ToDto();
    }
}
