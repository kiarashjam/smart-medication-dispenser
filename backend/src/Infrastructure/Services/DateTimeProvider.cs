using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
