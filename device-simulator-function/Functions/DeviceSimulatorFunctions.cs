using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.DeviceSimulator.Models;
using SmartMedicationDispenser.DeviceSimulator.Services;

namespace SmartMedicationDispenser.DeviceSimulator.Functions;

public sealed class DeviceSimulatorFunctions
{
    private static readonly JsonSerializerOptions JsonPretty = new() { WriteIndented = true };

    private readonly DeviceApiSimulationService _simulation;
    private readonly ILogger<DeviceSimulatorFunctions> _logger;

    public DeviceSimulatorFunctions(
        DeviceApiSimulationService simulation,
        ILogger<DeviceSimulatorFunctions> logger)
    {
        _simulation = simulation;
        _logger = logger;
    }

    /// <summary>Every 5 minutes: same calls as firmware (ping, schedule, heartbeat, firmware check).</summary>
    [Function(nameof(SimulateDeviceTimer))]
    public async Task SimulateDeviceTimer([TimerTrigger("0 */5 * * * *")] TimerInfo timer, FunctionContext context)
    {
        _logger.LogInformation("Timer simulation started at {Time}", DateTime.UtcNow);
        var report = await _simulation.RunFullSimulationAsync(context.CancellationToken);
        _logger.LogInformation(
            "Timer simulation done. FullCycle={Full} Steps={Count} Skipped={Skip}",
            report.FullCycleCompleted,
            report.Steps.Count,
            report.SkippedReason);
    }

    /// <summary>Manual run: GET/POST with function key. Returns JSON report.</summary>
    [Function(nameof(RunSimulation))]
    public async Task<HttpResponseData> RunSimulation(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "device/simulate")] HttpRequestData req,
        FunctionContext context)
    {
        var report = await _simulation.RunFullSimulationAsync(context.CancellationToken);
        return await JsonResponseAsync(req, HttpStatusCode.OK, report);
    }

    /// <summary>
    /// One-shot device registration (SMD-XXXXXXXX). Copy DISPENSER_DEVICE_ID + DISPENSER_DEVICE_JWT from response into app settings.
    /// </summary>
    [Function(nameof(RegisterSimulatorDevice))]
    public async Task<HttpResponseData> RegisterSimulatorDevice(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "device/register")] HttpRequestData req,
        FunctionContext context)
    {
        var (ok, message, body) = await _simulation.RegisterHardwareDeviceAsync(context.CancellationToken);
        var token = body?.DeviceToken;
        var guid = DeviceJwtPayloadReader.TryGetNameIdentifier(token);
        var response = new RegisterSimulatorResponse
        {
            Ok = ok,
            Message = message,
            SuggestedDeviceIdFromJwt = guid,
            DeviceTokenPreview = token == null ? null : token[..Math.Min(24, token.Length)] + "…",
            NextSteps = ok
                ? "Set app settings: DISPENSER_DEVICE_ID=<SuggestedDeviceIdFromJwt>, DISPENSER_DEVICE_JWT=<full device_token>. Or create X-API-Key in portal and use DISPENSER_X_API_KEY instead of JWT."
                : null,
        };
        var status = ok ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
        return await JsonResponseAsync(req, status, new { register = response, raw = body });
    }

    private static async Task<HttpResponseData> JsonResponseAsync<T>(HttpRequestData req, HttpStatusCode status, T body)
    {
        var res = req.CreateResponse(status);
        res.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await res.WriteStringAsync(JsonSerializer.Serialize(body, JsonPretty));
        return res;
    }
}
