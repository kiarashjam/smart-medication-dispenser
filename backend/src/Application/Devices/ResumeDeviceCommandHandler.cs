using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class ResumeDeviceCommandHandler : IRequestHandler<ResumeDeviceCommand, DeviceDto?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public ResumeDeviceCommandHandler(IDeviceRepository deviceRepository, IUnitOfWork unitOfWork, IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<DeviceDto?> Handle(ResumeDeviceCommand request, CancellationToken cancellationToken)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null || device.UserId != request.UserId)
            return null;
        device.Status = DeviceStatus.Active;
        device.UpdatedAtUtc = _dateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return device.ToDto();
    }
}
