using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.DeviceApi;

/// <summary>Report an error from the device hardware/firmware.</summary>
public record ReportDeviceErrorCommand(
    Guid DeviceId,
    DeviceErrorData ErrorData
) : IRequest<bool>;
