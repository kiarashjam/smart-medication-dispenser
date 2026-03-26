using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Devices;

public class CreateDeviceCommandHandler : IRequestHandler<CreateDeviceCommand, DeviceDto>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDeviceCommandHandler(
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeviceDto> Handle(CreateDeviceCommand request, CancellationToken cancellationToken)
    {
        var acting = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (acting?.Role == UserRole.Caregiver)
            throw new InvalidOperationException("Caregivers cannot register new devices. Sign in as the patient or register a patient account.");

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
