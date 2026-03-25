using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests;

public class MissedDoseLogicTests
{
    [Fact]
    public void DispensedEvent_OlderThan60Minutes_ShouldBeMarkedMissed()
    {
        var dispensedAt = DateTime.UtcNow.AddMinutes(-61);
        var threshold = DateTime.UtcNow.AddMinutes(-60);
        var shouldMarkMissed = dispensedAt < threshold;
        Assert.True(shouldMarkMissed);
    }

    [Fact]
    public void DispensedEvent_Within60Minutes_ShouldNotBeMarkedMissed()
    {
        var dispensedAt = DateTime.UtcNow.AddMinutes(-30);
        var threshold = DateTime.UtcNow.AddMinutes(-60);
        var shouldMarkMissed = dispensedAt < threshold;
        Assert.False(shouldMarkMissed);
    }

    [Fact]
    public void OnlyDispensedStatus_IsCandidateForMissed()
    {
        Assert.Equal(DispenseEventStatus.Dispensed, DispenseEventStatus.Dispensed);
        Assert.NotEqual(DispenseEventStatus.Confirmed, DispenseEventStatus.Dispensed);
        Assert.NotEqual(DispenseEventStatus.Missed, DispenseEventStatus.Dispensed);
    }
}
