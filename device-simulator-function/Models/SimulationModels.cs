using System.Text.Json.Serialization;

namespace SmartMedicationDispenser.DeviceSimulator.Models;

public sealed class SimulationReport
{
    public DateTime StartedAtUtc { get; init; }
    public DateTime? CompletedAtUtc { get; set; }
    public string? SkippedReason { get; set; }
    public List<SimulationStepResult> Steps { get; } = new();
    public bool AllStepsSucceeded => Steps.Count > 0 && Steps.All(s => s.Success);
    public bool FullCycleCompleted => string.IsNullOrEmpty(SkippedReason) && AllStepsSucceeded;
}

public sealed class SimulationStepResult
{
    public required string Name { get; init; }
    public required string Method { get; init; }
    public required string Path { get; init; }
    public int StatusCode { get; init; }
    /// <summary>When true, a non-success HTTP result does not fail <see cref="SimulationReport.AllStepsSucceeded"/> (e.g. board-test routes absent on older API builds).</summary>
    public bool Optional { get; init; }
    public bool Success =>
        StatusCode is >= 200 and < 300
        || (Optional && StatusCode == 404);
    public string? ResponsePreview { get; init; }
    public string? Error { get; init; }
}

public sealed class DeviceRegistrationRequestDto
{
    [JsonPropertyName("device_id")]
    public required string DeviceId { get; init; }

    [JsonPropertyName("device_type")]
    public required string DeviceType { get; init; }

    [JsonPropertyName("firmware_version")]
    public string? FirmwareVersion { get; init; }

    [JsonPropertyName("hardware_version")]
    public string? HardwareVersion { get; init; }

    [JsonPropertyName("mac_address")]
    public string? MacAddress { get; init; }
}

public sealed class DeviceRegistrationResponseDto
{
    [JsonPropertyName("success")]
    public bool Success { get; init; }

    [JsonPropertyName("device_token")]
    public string? DeviceToken { get; init; }

    [JsonPropertyName("token_expires_at")]
    public DateTime? TokenExpiresAt { get; init; }

    [JsonPropertyName("api_endpoint")]
    public string? ApiEndpoint { get; init; }

    [JsonPropertyName("heartbeat_interval")]
    public int HeartbeatInterval { get; init; }
}

/// <summary>Returned from Register HTTP for copying into app settings.</summary>
public sealed class RegisterSimulatorResponse
{
    public bool Ok { get; init; }
    public string Message { get; init; } = "";
    public string? SuggestedDeviceIdFromJwt { get; init; }
    public string? DeviceTokenPreview { get; init; }
    public string? NextSteps { get; init; }
}
