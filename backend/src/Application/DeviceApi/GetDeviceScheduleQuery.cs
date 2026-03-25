using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Get schedules for a device (called by firmware to know dispensing times).</summary>
public record GetDeviceScheduleQuery(Guid DeviceId) : IRequest<DeviceScheduleResponse>;
