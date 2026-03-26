using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Schedules;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, bool>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IContainerRepository _containerRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IContainerRepository containerRepository,
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _containerRepository = containerRepository;
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
            return false;
        var container = await _containerRepository.GetByIdAsync(schedule.ContainerId, cancellationToken);
        if (container == null)
            return false;
        var device = await _deviceRepository.GetByIdAsync(container.DeviceId, cancellationToken);
        if (device == null || !await _deviceAccess.CanAccessDeviceAsync(request.UserId, device.Id, cancellationToken))
            return false;
        await _scheduleRepository.DeleteAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
