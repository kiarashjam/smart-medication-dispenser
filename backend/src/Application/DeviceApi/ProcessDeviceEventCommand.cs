using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Process an event from device (dose dispensed/taken/missed, refill, error, etc.).</summary>
public record ProcessDeviceEventCommand(
    Guid DeviceId,
    DeviceEventPayload Payload
) : IRequest<ProcessDeviceEventResult>;

public record ProcessDeviceEventResult(
    bool Success,
    string? EventId,
    string? Error
);
