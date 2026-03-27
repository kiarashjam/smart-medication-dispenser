using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.DeviceSimulator.Models;

namespace SmartMedicationDispenser.DeviceSimulator.Services;

/// <summary>
/// Calls the Smart Medication Dispenser device API the same way firmware would:
/// connectivity checks → ping → schedule → heartbeat (optional register via HTTP helper).
/// </summary>
public sealed class DeviceApiSimulationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        WriteIndented = false,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DeviceApiSimulationService> _logger;

    public DeviceApiSimulationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<DeviceApiSimulationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public string? GetApiBase() => Setting("DISPENSER_API_BASE")?.Trim().TrimEnd('/');

    public bool TryGetDeviceAuth(out string deviceId, out string? apiKey, out string? bearer)
    {
        deviceId = Setting("DISPENSER_DEVICE_ID")?.Trim() ?? "";
        apiKey = Setting("DISPENSER_X_API_KEY")?.Trim();
        if (string.IsNullOrEmpty(apiKey)) apiKey = null;
        bearer = Setting("DISPENSER_DEVICE_JWT")?.Trim();
        if (string.IsNullOrEmpty(bearer)) bearer = null;
        return Guid.TryParse(deviceId, out _) && (apiKey != null || bearer != null);
    }

    /// <summary>Read portal app settings (see also APPSETTING_ prefix on Azure App Service / Functions).</summary>
    private string? Setting(string key) =>
        Environment.GetEnvironmentVariable(key)
        ?? Environment.GetEnvironmentVariable($"APPSETTING_{key}")
        ?? _configuration[key];

    /// <summary>POST /api/v1/devices/register — returns token + instructions (use once, then set app settings).</summary>
    public async Task<(bool Ok, string Message, DeviceRegistrationResponseDto? Body)> RegisterHardwareDeviceAsync(
        CancellationToken cancellationToken)
    {
        var baseUrl = GetApiBase();
        if (string.IsNullOrEmpty(baseUrl))
            return (false, "DISPENSER_API_BASE is not set.", null);

        var hardwareId = Setting("DISPENSER_HARDWARE_ID")?.Trim() ?? "SMD-A1F4C9E2";
        if (!System.Text.RegularExpressions.Regex.IsMatch(hardwareId, @"^SMD-[0-9A-Fa-f]{8}$"))
            return (false, "DISPENSER_HARDWARE_ID must match pattern SMD-XXXXXXXX (8 hex chars).", null);

        var client = CreateClient(baseUrl);
        var body = new DeviceRegistrationRequestDto
        {
            DeviceId = hardwareId,
            DeviceType = "main",
            FirmwareVersion = "azure-sim-1.0.0",
            HardwareVersion = "sim",
            MacAddress = "02:SIM:AZ:FN:01",
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "/api/v1/devices/register")
        {
            Content = new StringContent(JsonSerializer.Serialize(body, JsonOptions), Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage res;
        try
        {
            res = await client.SendAsync(req, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Register request failed");
            return (false, ex.Message, null);
        }

        var text = await res.Content.ReadAsStringAsync(cancellationToken);
        DeviceRegistrationResponseDto? dto = null;
        try
        {
            dto = JsonSerializer.Deserialize<DeviceRegistrationResponseDto>(text, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            });
        }
        catch
        {
            /* ignore */
        }

        if (!res.IsSuccessStatusCode)
            return (false, $"HTTP {(int)res.StatusCode}: {text[..Math.Min(500, text.Length)]}", dto);

        if (dto is not { Success: true } || string.IsNullOrEmpty(dto.DeviceToken))
            return (false, "Registration response missing token.", dto);

        var msg =
            "Decode JWT payload sub/nameid for device GUID, or create a device API key in the portal for that device. " +
            "Set DISPENSER_DEVICE_ID=<guid> and DISPENSER_X_API_KEY or DISPENSER_DEVICE_JWT, then run simulation.";
        return (true, msg, dto);
    }

    /// <summary>Runs the same sequence a board would after it has cloud credentials.</summary>
    public async Task<SimulationReport> RunFullSimulationAsync(CancellationToken cancellationToken)
    {
        var report = new SimulationReport { StartedAtUtc = DateTime.UtcNow };
        var baseUrl = GetApiBase();
        if (string.IsNullOrEmpty(baseUrl))
        {
            report.SkippedReason = "DISPENSER_API_BASE is not configured.";
            report.CompletedAtUtc = DateTime.UtcNow;
            return report;
        }

        var client = CreateClient(baseUrl);

        // Board-test routes may be missing on older deployed APIs; 404 is treated as OK when Optional.
        report.Steps.Add(await ExecuteStepAsync(client, "board_hello", "GET", "/api/v1/board-test/step/0-hello", null, null, optional: true, cancellationToken));
        report.Steps.Add(await ExecuteStepAsync(client, "device_ping", "GET", "/api/v1/ping", null, null, optional: false, cancellationToken));

        if (!TryGetDeviceAuth(out var deviceId, out var apiKey, out var bearer))
        {
            report.SkippedReason =
                "Configure DISPENSER_DEVICE_ID (portal device GUID) and either DISPENSER_X_API_KEY or DISPENSER_DEVICE_JWT. " +
                "Optional: call the RegisterSimulatorDevice function once, then assign the device to a user and create an API key in Integrations.";
            report.CompletedAtUtc = DateTime.UtcNow;
            return report;
        }

        void ApplyAuth(HttpRequestMessage m)
        {
            if (!string.IsNullOrEmpty(apiKey))
                m.Headers.TryAddWithoutValidation("X-API-Key", apiKey);
            if (!string.IsNullOrEmpty(bearer))
                m.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        }

        report.Steps.Add(await ExecuteStepAsync(client, "get_schedule", "GET", $"/api/v1/devices/{deviceId}/schedule", ApplyAuth, null, optional: false, cancellationToken));

        var heartbeatBody = new Dictionary<string, object?>
        {
            ["device_id"] = deviceId,
            ["timestamp"] = DateTime.UtcNow,
            ["battery"] = 91,
            ["wifi_signal"] = -52,
            ["firmware"] = "azure-device-sim-1.0",
        };
        report.Steps.Add(await ExecuteStepAsync(client, "heartbeat", "POST", $"/api/v1/devices/{deviceId}/heartbeat", ApplyAuth, heartbeatBody, optional: false, cancellationToken));

        report.Steps.Add(await ExecuteStepAsync(client, "firmware_check", "GET", $"/api/v1/devices/{deviceId}/firmware?current_version=1.0.0", ApplyAuth, null, optional: false, cancellationToken));

        report.CompletedAtUtc = DateTime.UtcNow;
        _logger.LogInformation(
            "Simulation finished: {Steps} steps, allOk={AllOk}",
            report.Steps.Count,
            report.FullCycleCompleted);
        return report;
    }

    private HttpClient CreateClient(string baseUrl)
    {
        var client = _httpClientFactory.CreateClient(nameof(DeviceApiSimulationService));
        client.BaseAddress = new Uri(baseUrl + "/");
        client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
        return client;
    }

    private async Task<SimulationStepResult> ExecuteStepAsync(
        HttpClient client,
        string name,
        string method,
        string path,
        Action<HttpRequestMessage>? configure,
        object? jsonBody,
        bool optional,
        CancellationToken cancellationToken)
    {
        using var req = new HttpRequestMessage(new HttpMethod(method), path.TrimStart('/'));
        configure?.Invoke(req);
        if (jsonBody != null)
            req.Content = new StringContent(JsonSerializer.Serialize(jsonBody, JsonOptions), Encoding.UTF8, "application/json");

        try
        {
            using var res = await client.SendAsync(req, cancellationToken);
            var text = await res.Content.ReadAsStringAsync(cancellationToken);
            var preview = text.Length > 400 ? text[..400] + "…" : text;
            return new SimulationStepResult
            {
                Name = name,
                Method = method,
                Path = path,
                StatusCode = (int)res.StatusCode,
                Optional = optional,
                ResponsePreview = preview,
                Error = res.IsSuccessStatusCode || (optional && res.StatusCode == HttpStatusCode.NotFound)
                    ? null
                    : preview,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Step {Name} failed", name);
            return new SimulationStepResult
            {
                Name = name,
                Method = method,
                Path = path,
                StatusCode = 0,
                Optional = optional,
                Error = ex.Message,
            };
        }
    }
}
