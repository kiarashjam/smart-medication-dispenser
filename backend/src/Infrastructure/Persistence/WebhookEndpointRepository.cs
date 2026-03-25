using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

public class WebhookEndpointRepository : IWebhookEndpointRepository
{
    private readonly AppDbContext _db;

    public WebhookEndpointRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<WebhookEndpoint>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _db.WebhookEndpoints.Where(w => w.UserId == userId && w.IsActive).OrderBy(w => w.CreatedAtUtc).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<WebhookEndpoint>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _db.WebhookEndpoints.Where(w => w.UserId == userId).OrderBy(w => w.CreatedAtUtc).ToListAsync(cancellationToken);

    public async Task<WebhookEndpoint?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _db.WebhookEndpoints.FindAsync(new object[] { id }, cancellationToken);

    public async Task<WebhookEndpoint?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default) =>
        await _db.WebhookEndpoints.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId, cancellationToken);

    public async Task<WebhookEndpoint> AddAsync(WebhookEndpoint endpoint, CancellationToken cancellationToken = default)
    {
        _db.WebhookEndpoints.Add(endpoint);
        return endpoint;
    }

    public async Task UpdateLastTriggeredAsync(Guid id, string status, CancellationToken cancellationToken = default)
    {
        var w = await _db.WebhookEndpoints.FindAsync(new object[] { id }, cancellationToken);
        if (w != null)
        {
            w.LastTriggeredAtUtc = DateTime.UtcNow;
            w.LastStatus = status.Length > 50 ? status[..50] : status;
        }
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        var w = await _db.WebhookEndpoints.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, cancellationToken);
        if (w == null) return false;
        _db.WebhookEndpoints.Remove(w);
        return true;
    }
}
