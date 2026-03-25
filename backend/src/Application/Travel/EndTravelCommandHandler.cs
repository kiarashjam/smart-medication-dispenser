using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Travel;

public class EndTravelCommandHandler : IRequestHandler<EndTravelCommand, TravelSessionDto?>
{
    private readonly ITravelSessionRepository _travelSessionRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTime;

    public EndTravelCommandHandler(
        ITravelSessionRepository travelSessionRepository,
        IDeviceRepository deviceRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        IDateTimeProvider dateTime)
    {
        _travelSessionRepository = travelSessionRepository;
        _deviceRepository = deviceRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<TravelSessionDto?> Handle(EndTravelCommand request, CancellationToken cancellationToken)
    {
        var session = await _travelSessionRepository.GetActiveByUserIdAsync(request.UserId, cancellationToken);
        if (session == null)
            return null;
        session.EndedAtUtc = _dateTime.UtcNow;
        var main = await _deviceRepository.GetByIdAsync(session.MainDeviceId, cancellationToken);
        var portable = await _deviceRepository.GetByIdAsync(session.PortableDeviceId, cancellationToken);
        if (main != null)
        {
            main.Status = DeviceStatus.Active;
            main.UpdatedAtUtc = _dateTime.UtcNow;
        }
        if (portable != null)
        {
            portable.Status = DeviceStatus.Paused;
            portable.UpdatedAtUtc = _dateTime.UtcNow;
        }
        await _notificationRepository.AddAsync(new Domain.Entities.Notification
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Type = Domain.Enums.NotificationType.TravelEnded,
            Title = "Travel mode ended",
            Body = "Main device is active again.",
            IsRead = false,
            CreatedAtUtc = _dateTime.UtcNow,
            RelatedEntityId = session.Id
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new TravelSessionDto(session.Id, session.MainDeviceId, session.PortableDeviceId, session.StartedAtUtc, session.EndedAtUtc, session.PlannedEndDateUtc);
    }
}
