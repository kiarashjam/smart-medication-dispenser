using System.Security.Cryptography;
using System.Text;
using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Integrations;

public class CreateDeviceApiKeyCommandHandler : IRequestHandler<CreateDeviceApiKeyCommand, CreateDeviceApiKeyResult?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IDeviceApiKeyRepository _apiKeyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public CreateDeviceApiKeyCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IDeviceApiKeyRepository apiKeyRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _apiKeyRepository = apiKeyRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<CreateDeviceApiKeyResult?> Handle(CreateDeviceApiKeyCommand request, CancellationToken cancellationToken)
    {
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, request.DeviceId, cancellationToken))
            return null;
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
        if (device == null) return null;

        var plainKey = "sk_" + Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plainKey))).ToLowerInvariant();

        var apiKey = new DeviceApiKey
        {
            Id = Guid.NewGuid(),
            DeviceId = request.DeviceId,
            KeyHash = hash,
            Name = request.Name,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _apiKeyRepository.AddAsync(apiKey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new CreateDeviceApiKeyResult(apiKey.Id, plainKey);
    }
}
