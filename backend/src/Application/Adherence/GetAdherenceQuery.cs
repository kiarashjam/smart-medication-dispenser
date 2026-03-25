using MediatR;
using SmartMedicationDispenser.Application.DTOs;

namespace SmartMedicationDispenser.Application.Adherence;

public record GetAdherenceQuery(Guid UserId, DateTime? FromUtc, DateTime? ToUtc) : IRequest<AdherenceSummaryDto>;
