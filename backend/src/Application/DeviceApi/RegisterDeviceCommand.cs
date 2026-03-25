using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Register a new device on first boot.</summary>
public record RegisterDeviceCommand(
    string DeviceId,
    string DeviceType,
    string? FirmwareVersion,
    string? HardwareVersion,
    string? MacAddress
) : IRequest<DeviceRegistrationResponse>;
