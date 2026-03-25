using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Integrations;

public class CreateWebhookEndpointCommandHandler : IRequestHandler<CreateWebhookEndpointCommand, WebhookEndpointDto?>
{
    private readonly IWebhookEndpointRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public CreateWebhookEndpointCommandHandler(IWebhookEndpointRepository repository, IUnitOfWork unitOfWork, IDateTimeProvider dateTime)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<WebhookEndpointDto?> Handle(CreateWebhookEndpointCommand request, CancellationToken cancellationToken)
    {
        var r = request.Request;
        if (string.IsNullOrWhiteSpace(r.Url)) return null;
        var endpoint = new WebhookEndpoint
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Url = r.Url.Trim(),
            Secret = string.IsNullOrWhiteSpace(r.Secret) ? null : r.Secret.Trim(),
            Description = string.IsNullOrWhiteSpace(r.Description) ? null : r.Description.Trim(),
            IsActive = true,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _repository.AddAsync(endpoint, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new WebhookEndpointDto(endpoint.Id, endpoint.Url, endpoint.IsActive, endpoint.Description, endpoint.LastTriggeredAtUtc, endpoint.LastStatus, endpoint.CreatedAtUtc);
    }
}
