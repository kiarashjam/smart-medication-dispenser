using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Process heartbeat from device - updates status, battery, sensors, slot counts.</summary>
public record ProcessDeviceHeartbeatCommand(
    Guid DeviceId,
    HeartbeatPayload Payload
) : IRequest<ProcessDeviceHeartbeatResult>;

public record ProcessDeviceHeartbeatResult(
    bool Success,
    DateTime ServerTime,
    int NextHeartbeat,
    List<DeviceCommand>? Commands
);

public record DeviceCommand(
    string Type,
    object? Payload
);
