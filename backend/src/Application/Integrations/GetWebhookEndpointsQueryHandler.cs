using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Integrations;

public class GetWebhookEndpointsQueryHandler : IRequestHandler<GetWebhookEndpointsQuery, IReadOnlyList<WebhookEndpointDto>>
{
    private readonly IWebhookEndpointRepository _repository;

    public GetWebhookEndpointsQueryHandler(IWebhookEndpointRepository repository) => _repository = repository;

    public async Task<IReadOnlyList<WebhookEndpointDto>> Handle(GetWebhookEndpointsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);
        return all.Select(w => new WebhookEndpointDto(w.Id, w.Url, w.IsActive, w.Description, w.LastTriggeredAtUtc, w.LastStatus, w.CreatedAtUtc)).ToList();
    }
}
