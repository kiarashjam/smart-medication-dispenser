using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

/// <summary>Outgoing webhook endpoints per user.</summary>
public interface IWebhookEndpointRepository
{
    Task<IReadOnlyList<WebhookEndpoint>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WebhookEndpoint>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<WebhookEndpoint?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WebhookEndpoint?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<WebhookEndpoint> AddAsync(WebhookEndpoint endpoint, CancellationToken cancellationToken = default);
    Task UpdateLastTriggeredAsync(Guid id, string status, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
}
