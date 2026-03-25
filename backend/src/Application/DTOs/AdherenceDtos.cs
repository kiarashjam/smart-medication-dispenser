namespace SmartMedicationDispenser.Application.DTOs;

public record AdherenceSummaryDto(
    int TotalScheduled,
    int Confirmed,
    int Missed,
    int Pending,
    double AdherencePercent);
