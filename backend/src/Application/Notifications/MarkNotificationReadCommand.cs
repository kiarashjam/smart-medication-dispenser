using MediatR;

namespace SmartMedicationDispenser.Application.Notifications;

public record MarkNotificationReadCommand(Guid UserId, Guid NotificationId) : IRequest<bool>;
