namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>Resolves device ID from API key (e.g. from X-API-Key header). Used by webhook/sync endpoints.</summary>
public interface IDeviceApiKeyResolver
{
    Task<Guid?> ResolveDeviceIdFromApiKeyAsync(string? apiKey, CancellationToken cancellationToken = default);
}
