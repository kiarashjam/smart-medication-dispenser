using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Notifications;

public record GetNotificationsQuery(Guid UserId, int Limit) : IRequest<IReadOnlyList<NotificationDto>>;
