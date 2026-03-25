using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Application.Common.Interfaces;

public interface IDeviceRepository
{
    Task<Device?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Device?> GetByIdWithContainersAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Device>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Device> AddAsync(Device device, CancellationToken cancellationToken = default);
    Task<Device?> GetByIdWithContainersAndSchedulesAsync(Guid id, CancellationToken cancellationToken = default);
}
