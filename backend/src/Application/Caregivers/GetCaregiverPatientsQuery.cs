using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Domain.Enums;

namespace SmartMedicationDispenser.Application.Caregivers;

public record PatientSummaryDto(Guid Id, string FullName, string Email);

public record GetCaregiverPatientsQuery(Guid CaregiverUserId) : IRequest<IReadOnlyList<PatientSummaryDto>>;

public class GetCaregiverPatientsQueryHandler : IRequestHandler<GetCaregiverPatientsQuery, IReadOnlyList<PatientSummaryDto>>
{
    private readonly IUserRepository _users;

    public GetCaregiverPatientsQueryHandler(IUserRepository users) => _users = users;

    public async Task<IReadOnlyList<PatientSummaryDto>> Handle(GetCaregiverPatientsQuery request, CancellationToken cancellationToken)
    {
        var user = await _users.GetByIdAsync(request.CaregiverUserId, cancellationToken);
        if (user == null || user.Role != UserRole.Caregiver)
            return Array.Empty<PatientSummaryDto>();

        var patients = await _users.GetPatientsByCaregiverIdAsync(request.CaregiverUserId, cancellationToken);
        return patients.Select(p => new PatientSummaryDto(p.Id, p.FullName, p.Email)).ToList();
    }
}
