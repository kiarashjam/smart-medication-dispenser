using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Domain.Tests;

public class DomainTests
{
    [Fact]
    public void UserRole_Values_AreDefined()
    {
        Assert.Equal(0, (int)UserRole.Patient);
        Assert.Equal(1, (int)UserRole.Caregiver);
        Assert.Equal(2, (int)UserRole.Admin);
    }

    [Fact]
    public void DispenseEventStatus_Values_AreDefined()
    {
        Assert.Equal(1, (int)DispenseEventStatus.Dispensed);
        Assert.Equal(2, (int)DispenseEventStatus.Confirmed);
        Assert.Equal(3, (int)DispenseEventStatus.Missed);
    }
}
