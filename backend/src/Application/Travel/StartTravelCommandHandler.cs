using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Travel;

public class StartTravelCommandHandler : IRequestHandler<StartTravelCommand, TravelSessionDto?>
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAccessService _deviceAccess;
    private readonly IContainerRepository _containerRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITravelSessionRepository _travelSessionRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public StartTravelCommandHandler(
        IDeviceRepository deviceRepository,
        IDeviceAccessService deviceAccess,
        IContainerRepository containerRepository,
        IScheduleRepository scheduleRepository,
        ITravelSessionRepository travelSessionRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _deviceRepository = deviceRepository;
        _deviceAccess = deviceAccess;
        _containerRepository = containerRepository;
        _scheduleRepository = scheduleRepository;
        _travelSessionRepository = travelSessionRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<TravelSessionDto?> Handle(StartTravelCommand request, CancellationToken cancellationToken)
    {
        var days = Math.Clamp(request.Request.Days, 1, 14);
        var portableDevice = await _deviceRepository.GetByIdAsync(request.Request.PortableDeviceId, cancellationToken);
        if (portableDevice == null || portableDevice.Type != DeviceType.Portable)
            return null;
        if (!await _deviceAccess.CanAccessDeviceAsync(request.UserId, portableDevice.Id, cancellationToken))
            return null;

        var patientUserId = portableDevice.UserId;
        var userDevices = await _deviceRepository.GetByUserIdAsync(patientUserId, cancellationToken);
        var main = userDevices.FirstOrDefault(d => d.Type == DeviceType.Main);
        if (main == null)
            return null;
        if (portableDevice.Id == main.Id)
            return null;

        var existing = await _travelSessionRepository.GetActiveByUserIdAsync(patientUserId, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("Travel mode already active.");

        main.Status = DeviceStatus.Paused;
        main.UpdatedAtUtc = _dateTime.UtcNow;
        portableDevice.Status = DeviceStatus.Active;
        portableDevice.UpdatedAtUtc = _dateTime.UtcNow;

        var mainWithContainers = await _deviceRepository.GetByIdWithContainersAndSchedulesAsync(main!.Id, cancellationToken);
        if (mainWithContainers != null)
        {
            foreach (var src in mainWithContainers.Containers)
            {
                var dest = new Container
                {
                    Id = Guid.NewGuid(),
                    DeviceId = portableDevice.Id,
                    SlotNumber = src.SlotNumber,
                    MedicationName = src.MedicationName,
                    MedicationImageUrl = src.MedicationImageUrl,
                    Quantity = src.Quantity,
                    PillsPerDose = src.PillsPerDose,
                    LowStockThreshold = src.LowStockThreshold,
                    SourceContainerId = src.Id,
                    CreatedAtUtc = _dateTime.UtcNow
                };
                await _containerRepository.AddAsync(dest, cancellationToken);
                foreach (var s in src.Schedules)
                {
                    var sched = new Schedule
                    {
                        Id = Guid.NewGuid(),
                        ContainerId = dest.Id,
                        TimeOfDay = s.TimeOfDay,
                        DaysOfWeekBitmask = s.DaysOfWeekBitmask,
                        StartDate = s.StartDate,
                        EndDate = s.EndDate,
                        Notes = s.Notes,
                        TimeZoneId = s.TimeZoneId,
                        CreatedAtUtc = _dateTime.UtcNow
                    };
                    await _scheduleRepository.AddAsync(sched, cancellationToken);
                }
            }
        }

        var startedAt = _dateTime.UtcNow;
        var plannedEnd = startedAt.AddDays(days);
        var session = new TravelSession
        {
            Id = Guid.NewGuid(),
            UserId = patientUserId,
            MainDeviceId = main.Id,
            PortableDeviceId = portableDevice.Id,
            StartedAtUtc = startedAt,
            PlannedEndDateUtc = plannedEnd,
            CreatedAtUtc = _dateTime.UtcNow
        };
        await _travelSessionRepository.AddAsync(session, cancellationToken);

        await _notificationRepository.AddAsync(new Domain.Entities.Notification
        {
            Id = Guid.NewGuid(),
            UserId = patientUserId,
            Type = NotificationType.TravelStarted,
            Title = "Travel mode started",
            Body = $"Portable device is now active until {plannedEnd:g}.",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = session.Id
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new TravelSessionDto(session.Id, session.MainDeviceId, session.PortableDeviceId, session.StartedAtUtc, session.EndedAtUtc, session.PlannedEndDateUtc);
    }
}
