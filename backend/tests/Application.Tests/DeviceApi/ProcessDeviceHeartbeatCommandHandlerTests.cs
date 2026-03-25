using Microsoft.Extensions.Logging;
using Moq;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests.DeviceApi;

public class ProcessDeviceHeartbeatCommandHandlerTests
{
    private readonly Mock<IDeviceRepository> _deviceRepo = new();
    private readonly Mock<IContainerRepository> _containerRepo = new();
    private readonly Mock<INotificationRepository> _notificationRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IDateTimeProvider> _dateTime = new();
    private readonly Mock<ILogger<ProcessDeviceHeartbeatCommandHandler>> _logger = new();

    private ProcessDeviceHeartbeatCommandHandler CreateHandler() =>
        new(_deviceRepo.Object, _containerRepo.Object, _notificationRepo.Object,
            _unitOfWork.Object, _dateTime.Object, _logger.Object);

    [Fact]
    public async Task Handle_ValidDevice_UpdatesStatusAndReturnsSuccess()
    {
        var deviceId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        _dateTime.Setup(d => d.UtcNow).Returns(now);

        var device = new Device
        {
            Id = deviceId,
            UserId = Guid.NewGuid(),
            Name = "Test Device",
            IsOnline = false,
            Containers = new List<Container>
            {
                new Container { SlotNumber = 1, Quantity = 20 },
                new Container { SlotNumber = 2, Quantity = 10 }
            }
        };
        _deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        var handler = CreateHandler();

        var payload = new HeartbeatPayload("dev-1", now, 85, -45, 22.5m, 60, "1.2.0",
            new List<HeartbeatSlot>
            {
                new HeartbeatSlot(1, "Metformin", 18),
                new HeartbeatSlot(2, "Aspirin", 8)
            });

        var result = await handler.Handle(
            new ProcessDeviceHeartbeatCommand(deviceId, payload), CancellationToken.None);

        Assert.True(result.Success);
        Assert.True(device.IsOnline);
        Assert.Equal(85, device.BatteryLevel);
        Assert.Equal(-45, device.WifiSignal);
        Assert.Equal(22.5m, device.Temperature);
        Assert.Equal(60, device.Humidity);
        Assert.Equal("1.2.0", device.FirmwareVersion);
        Assert.Equal(18, device.Containers.First(c => c.SlotNumber == 1).Quantity);
        Assert.Equal(8, device.Containers.First(c => c.SlotNumber == 2).Quantity);
    }

    [Fact]
    public async Task Handle_DeviceNotFound_ReturnsFalse()
    {
        var deviceId = Guid.NewGuid();
        _dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        _deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device?)null);

        var handler = CreateHandler();

        var result = await handler.Handle(
            new ProcessDeviceHeartbeatCommand(deviceId, new HeartbeatPayload("d", null, null, null, null, null, null, null)),
            CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_BatteryLow_CreatesNotification()
    {
        var deviceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        _dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);

        var device = new Device
        {
            Id = deviceId,
            UserId = userId,
            Name = "Test",
            Containers = new List<Container>()
        };
        _deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        var handler = CreateHandler();

        var payload = new HeartbeatPayload("d", null, 15, null, null, null, null, null);
        await handler.Handle(new ProcessDeviceHeartbeatCommand(deviceId, payload), CancellationToken.None);

        _notificationRepo.Verify(n => n.AddAsync(
            It.Is<Notification>(notif => notif.Type == NotificationType.BatteryLow),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_BatteryCritical_CreatesCriticalNotification()
    {
        var deviceId = Guid.NewGuid();
        _dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);

        var device = new Device
        {
            Id = deviceId,
            UserId = Guid.NewGuid(),
            Name = "Test",
            Containers = new List<Container>()
        };
        _deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);

        var handler = CreateHandler();

        var payload = new HeartbeatPayload("d", null, 3, null, null, null, null, null);
        await handler.Handle(new ProcessDeviceHeartbeatCommand(deviceId, payload), CancellationToken.None);

        _notificationRepo.Verify(n => n.AddAsync(
            It.Is<Notification>(notif => notif.Type == NotificationType.BatteryCritical),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
