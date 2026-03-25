using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Infrastructure.Services;

public class DeviceApiKeyResolver : IDeviceApiKeyResolver
{
    private readonly IDeviceApiKeyRepository _repository;

    public DeviceApiKeyResolver(IDeviceApiKeyRepository repository) => _repository = repository;

    public async Task<Guid?> ResolveDeviceIdFromApiKeyAsync(string? apiKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(apiKey)) return null;
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(apiKey))).ToLowerInvariant();
        var key = await _repository.FindByKeyHashAsync(hash, cancellationToken);
        if (key == null) return null;
        await _repository.UpdateLastUsedAsync(key.Id, cancellationToken);
        return key.DeviceId;
    }
}
