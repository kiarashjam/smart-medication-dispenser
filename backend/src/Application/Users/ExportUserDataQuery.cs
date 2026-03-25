using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Users;

/// <summary>GDPR data export: returns all user data in a portable format.</summary>
public record ExportUserDataQuery(Guid UserId) : IRequest<UserDataExport>;

public record UserDataExport(
    UserExportProfile Profile,
    IReadOnlyList<UserExportDevice> Devices,
    IReadOnlyList<UserExportDispenseEvent> DispenseEvents,
    IReadOnlyList<UserExportNotification> Notifications,
    DateTime ExportedAtUtc
);

public record UserExportProfile(Guid Id, string Email, string FullName, string Role, DateTime CreatedAtUtc);
public record UserExportDevice(Guid Id, string Name, string Type, string Status, DateTime? LastHeartbeatAtUtc);
public record UserExportDispenseEvent(Guid Id, Guid DeviceId, DateTime ScheduledAtUtc, string Status, DateTime? DispensedAtUtc, DateTime? ConfirmedAtUtc);
public record UserExportNotification(Guid Id, string Type, string Title, string Body, bool IsRead, DateTime CreatedAtUtc);

public class ExportUserDataQueryHandler : IRequestHandler<ExportUserDataQuery, UserDataExport>
{
    private readonly IUserRepository _userRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly INotificationRepository _notificationRepository;

    public ExportUserDataQueryHandler(
        IUserRepository userRepository,
        IDeviceRepository deviceRepository,
        IDispenseEventRepository dispenseEventRepository,
        INotificationRepository notificationRepository)
    {
        _userRepository = userRepository;
        _deviceRepository = deviceRepository;
        _dispenseEventRepository = dispenseEventRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<UserDataExport> Handle(ExportUserDataQuery request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, ct)
            ?? throw new KeyNotFoundException("User not found");

        var devices = await _deviceRepository.GetByUserIdAsync(request.UserId, ct);
        var notifications = await _notificationRepository.GetByUserIdAsync(request.UserId, 10000, ct);

        // Collect dispense events across all devices
        var allEvents = new List<UserExportDispenseEvent>();
        foreach (var device in devices)
        {
            var events = await _dispenseEventRepository.GetByDeviceIdAsync(device.Id, null, null, 10000, ct);
            allEvents.AddRange(events.Select(e => new UserExportDispenseEvent(
                e.Id, e.DeviceId, e.ScheduledAtUtc, e.Status.ToString(),
                e.DispensedAtUtc, e.ConfirmedAtUtc)));
        }

        return new UserDataExport(
            Profile: new UserExportProfile(user.Id, user.Email, user.FullName, user.Role.ToString(), user.CreatedAtUtc),
            Devices: devices.Select(d => new UserExportDevice(d.Id, d.Name, d.Type.ToString(), d.Status.ToString(), d.LastHeartbeatAtUtc)).ToList(),
            DispenseEvents: allEvents,
            Notifications: notifications.Select(n => new UserExportNotification(n.Id, n.Type.ToString(), n.Title, n.Body, n.IsRead, n.CreatedAtUtc)).ToList(),
            ExportedAtUtc: DateTime.UtcNow
        );
    }
}
