using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Adherence;

public class GetAdherenceQueryHandler : IRequestHandler<GetAdherenceQuery, AdherenceSummaryDto>
{
    private readonly IDispenseEventRepository _dispenseEventRepository;
    private readonly IDateTimeProvider _dateTime;

    public GetAdherenceQueryHandler(IDispenseEventRepository dispenseEventRepository, IDateTimeProvider dateTime)
    {
        _dispenseEventRepository = dispenseEventRepository;
        _dateTime = dateTime;
    }

    public async Task<AdherenceSummaryDto> Handle(GetAdherenceQuery request, CancellationToken cancellationToken)
    {
        var now = _dateTime.UtcNow;
        var from = request.FromUtc ?? now.AddDays(-30);
        var to = request.ToUtc ?? now;
        var events = await _dispenseEventRepository.GetByUserIdAsync(request.UserId, from, to, cancellationToken);
        var total = events.Count;
        var confirmed = events.Count(e => e.Status == DispenseEventStatus.Confirmed);
        var missed = events.Count(e => e.Status == DispenseEventStatus.Missed);
        var pending = events.Count(e => e.Status == DispenseEventStatus.Pending || e.Status == DispenseEventStatus.Dispensed);
        var delayed = events.Count(e => e.Status == DispenseEventStatus.Delayed);
        var completed = confirmed + missed;
        var adherencePercent = completed > 0 ? (double)confirmed / completed * 100.0 : 100.0;
        return new AdherenceSummaryDto(total, confirmed, missed, pending, Math.Round(adherencePercent, 1));
    }
}
