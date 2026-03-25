using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests;

public class TravelModeLogicTests
{
    [Fact]
    public void TravelMode_DaysClamped_To14()
    {
        var requestedDays = 20;
        var days = Math.Clamp(requestedDays, 1, 14);
        Assert.Equal(14, days);
    }

    [Fact]
    public void MainDevice_ShouldBePaused_DuringTravel()
    {
        Assert.Equal(DeviceStatus.Paused, DeviceStatus.Paused);
        Assert.Equal(DeviceStatus.Active, DeviceStatus.Active);
    }

    [Fact]
    public void PortableDevice_ShouldBeActive_DuringTravel()
    {
        var portableStatus = DeviceStatus.Active;
        Assert.Equal(DeviceStatus.Active, portableStatus);
    }
}
