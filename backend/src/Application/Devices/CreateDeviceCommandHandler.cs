using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class CreateDeviceCommandHandler : IRequestHandler<CreateDeviceCommand, DeviceDto>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDeviceCommandHandler(IDeviceRepository deviceRepository, IUnitOfWork unitOfWork)
    {
        _deviceRepository = deviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeviceDto> Handle(CreateDeviceCommand request, CancellationToken cancellationToken)
    {
        var type = Enum.TryParse<DeviceType>(request.Request.Type, true, out var t) ? t : DeviceType.Main;
        var device = new Device
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Name = request.Request.Name,
            Type = type,
            Status = DeviceStatus.Active,
            TimeZoneId = request.Request.TimeZoneId,
            CreatedAtUtc = DateTime.UtcNow,
            IsOnline = false
        };
        await _deviceRepository.AddAsync(device, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return device.ToDto();
    }
}
