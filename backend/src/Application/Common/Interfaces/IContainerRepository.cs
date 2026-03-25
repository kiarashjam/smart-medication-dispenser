using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface IContainerRepository
{
    Task<Container?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Container?> GetByIdWithSchedulesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Container>> GetByDeviceIdAsync(Guid deviceId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Container>> GetLowStockContainersAsync(CancellationToken cancellationToken = default);
    Task<Container> AddAsync(Container container, CancellationToken cancellationToken = default);
    Task DeleteAsync(Container container, CancellationToken cancellationToken = default);
}
