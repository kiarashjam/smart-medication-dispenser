using Microsoft.Extensions.Logging;
using Moq;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Application.DTOs;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests;

public class DeviceApiTests
{
    // ============================================
    // RegisterDeviceCommandHandler Tests
    // ============================================

    [Fact]
    public async Task RegisterDevice_ValidId_ReturnsSuccessWithToken()
    {
        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device d, CancellationToken _) => d);
        var unitOfWork = new Mock<IUnitOfWork>();
        var authService = new Mock<IAuthService>();
        authService.Setup(a => a.GenerateJwt(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<UserRole>()))
            .Returns("test-jwt-token");
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<RegisterDeviceCommandHandler>>();

        var handler = new RegisterDeviceCommandHandler(
            deviceRepo.Object, unitOfWork.Object, authService.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new RegisterDeviceCommand(
            "SMD-12345678", "main", "1.0.0", "1.0", "AA:BB:CC:DD:EE:FF"
        ), default);

        Assert.True(result.Success);
        Assert.Equal("test-jwt-token", result.DeviceToken);
        Assert.Equal(60, result.HeartbeatInterval);
        deviceRepo.Verify(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterDevice_InvalidIdFormat_ReturnsFailed()
    {
        var deviceRepo = new Mock<IDeviceRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();
        var authService = new Mock<IAuthService>();
        var dateTime = new Mock<IDateTimeProvider>();
        var logger = new Mock<ILogger<RegisterDeviceCommandHandler>>();

        var handler = new RegisterDeviceCommandHandler(
            deviceRepo.Object, unitOfWork.Object, authService.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new RegisterDeviceCommand(
            "INVALID-ID", "main", null, null, null
        ), default);

        Assert.False(result.Success);
        Assert.Null(result.DeviceToken);
        deviceRepo.Verify(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegisterDevice_PortableType_SetsCorrectDeviceType()
    {
        Device? capturedDevice = null;
        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()))
            .Callback<Device, CancellationToken>((d, _) => capturedDevice = d)
            .ReturnsAsync((Device d, CancellationToken _) => d);
        var unitOfWork = new Mock<IUnitOfWork>();
        var authService = new Mock<IAuthService>();
        authService.Setup(a => a.GenerateJwt(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<UserRole>()))
            .Returns("token");
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<RegisterDeviceCommandHandler>>();

        var handler = new RegisterDeviceCommandHandler(
            deviceRepo.Object, unitOfWork.Object, authService.Object, dateTime.Object, logger.Object);

        await handler.Handle(new RegisterDeviceCommand(
            "SMD-ABCDEF01", "portable", "1.0.0", "1.0", null
        ), default);

        Assert.NotNull(capturedDevice);
        Assert.Equal(DeviceType.Portable, capturedDevice!.Type);
    }

    // ============================================
    // ProcessDeviceHeartbeatCommandHandler Tests
    // ============================================

    [Fact]
    public async Task ProcessHeartbeat_ValidDevice_UpdatesDeviceState()
    {
        var deviceId = Guid.NewGuid();
        var device = new Device
        {
            Id = deviceId,
            UserId = Guid.NewGuid(),
            Name = "Test Device",
            IsOnline = false,
            BatteryLevel = 50,
            Containers = new List<Container>
            {
                new Container { Id = Guid.NewGuid(), SlotNumber = 1, MedicationName = "Med1", Quantity = 20 },
                new Container { Id = Guid.NewGuid(), SlotNumber = 2, MedicationName = "Med2", Quantity = 15 }
            }
        };

        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);
        var containerRepo = new Mock<IContainerRepository>();
        var notifRepo = new Mock<INotificationRepository>();
        notifRepo.Setup(n => n.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification n, CancellationToken _) => n);
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<ProcessDeviceHeartbeatCommandHandler>>();

        var handler = new ProcessDeviceHeartbeatCommandHandler(
            deviceRepo.Object, containerRepo.Object, notifRepo.Object,
            unitOfWork.Object, dateTime.Object, logger.Object);

        var payload = new HeartbeatPayload(
            DeviceId: deviceId.ToString(),
            Timestamp: DateTime.UtcNow,
            Battery: 85,
            WifiSignal: -45,
            Temperature: 22.5m,
            Humidity: 55,
            Firmware: "1.2.0",
            Slots: new List<HeartbeatSlot>
            {
                new HeartbeatSlot(1, "Med1", 18),
                new HeartbeatSlot(2, "Med2", 12)
            }
        );

        var result = await handler.Handle(new ProcessDeviceHeartbeatCommand(deviceId, payload), default);

        Assert.True(result.Success);
        Assert.Equal(60, result.NextHeartbeat);
        Assert.True(device.IsOnline);
        Assert.Equal(85, device.BatteryLevel);
        Assert.Equal(-45, device.WifiSignal);
        Assert.Equal(22.5m, device.Temperature);
        Assert.Equal(55, device.Humidity);
        Assert.Equal("1.2.0", device.FirmwareVersion);
        // Verify slot updates
        Assert.Equal(18, device.Containers.First(c => c.SlotNumber == 1).Quantity);
        Assert.Equal(12, device.Containers.First(c => c.SlotNumber == 2).Quantity);
    }

    [Fact]
    public async Task ProcessHeartbeat_DeviceNotFound_ReturnsFailed()
    {
        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdWithContainersAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device?)null);
        var containerRepo = new Mock<IContainerRepository>();
        var notifRepo = new Mock<INotificationRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<ProcessDeviceHeartbeatCommandHandler>>();

        var handler = new ProcessDeviceHeartbeatCommandHandler(
            deviceRepo.Object, containerRepo.Object, notifRepo.Object,
            unitOfWork.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new ProcessDeviceHeartbeatCommand(
            Guid.NewGuid(),
            new HeartbeatPayload("dev1", null, null, null, null, null, null, null)
        ), default);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task ProcessHeartbeat_LowBattery_CreatesNotification()
    {
        var deviceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var device = new Device
        {
            Id = deviceId,
            UserId = userId,
            Name = "Portable Device",
            Containers = new List<Container>()
        };

        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);
        var containerRepo = new Mock<IContainerRepository>();
        var notifRepo = new Mock<INotificationRepository>();
        notifRepo.Setup(n => n.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification n, CancellationToken _) => n);
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<ProcessDeviceHeartbeatCommandHandler>>();

        var handler = new ProcessDeviceHeartbeatCommandHandler(
            deviceRepo.Object, containerRepo.Object, notifRepo.Object,
            unitOfWork.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new ProcessDeviceHeartbeatCommand(
            deviceId,
            new HeartbeatPayload("dev1", null, 15, null, null, null, null, null)
        ), default);

        Assert.True(result.Success);
        notifRepo.Verify(n => n.AddAsync(
            It.Is<Notification>(n => n.Type == NotificationType.BatteryLow),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // ============================================
    // SyncInventoryCommandHandler Tests
    // ============================================

    [Fact]
    public async Task SyncInventory_ValidDevice_UpdatesContainerQuantities()
    {
        var deviceId = Guid.NewGuid();
        var device = new Device
        {
            Id = deviceId,
            Containers = new List<Container>
            {
                new Container { SlotNumber = 1, Quantity = 20, MedicationName = "Med1" },
                new Container { SlotNumber = 2, Quantity = 15, MedicationName = "Med2" }
            }
        };

        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdWithContainersAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<SyncInventoryCommandHandler>>();

        var handler = new SyncInventoryCommandHandler(
            deviceRepo.Object, unitOfWork.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new SyncInventoryCommand(deviceId, new List<InventorySlot>
        {
            new InventorySlot(1, "Med1", 18, null),
            new InventorySlot(2, "Med2", 10, null)
        }), default);

        Assert.True(result.Success);
        Assert.Equal(18, device.Containers.First(c => c.SlotNumber == 1).Quantity);
        Assert.Equal(10, device.Containers.First(c => c.SlotNumber == 2).Quantity);
    }

    // ============================================
    // ReportDeviceErrorCommandHandler Tests
    // ============================================

    [Fact]
    public async Task ReportError_ValidDevice_LogsErrorAndCreatesNotification()
    {
        var deviceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var device = new Device { Id = deviceId, UserId = userId, Name = "Test Device" };

        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdAsync(deviceId, It.IsAny<CancellationToken>())).ReturnsAsync(device);
        var eventLogRepo = new Mock<IDeviceEventLogRepository>();
        eventLogRepo.Setup(r => r.AddAsync(It.IsAny<DeviceEventLog>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DeviceEventLog e, CancellationToken _) => e);
        var notifRepo = new Mock<INotificationRepository>();
        notifRepo.Setup(n => n.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification n, CancellationToken _) => n);
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(u => u.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = userId, CaregiverUserId = null });
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<ReportDeviceErrorCommandHandler>>();

        var handler = new ReportDeviceErrorCommandHandler(
            deviceRepo.Object, eventLogRepo.Object, notifRepo.Object,
            userRepo.Object, unitOfWork.Object, dateTime.Object, logger.Object);

        var error = new DeviceErrorData("HW-M001", "hardware", 1, "Stepper motor jammed", "high");
        var result = await handler.Handle(new ReportDeviceErrorCommand(deviceId, error), default);

        Assert.True(result);
        Assert.Equal("HW-M001", device.LastErrorCode);
        Assert.Equal("Stepper motor jammed", device.LastErrorMessage);
        eventLogRepo.Verify(r => r.AddAsync(It.IsAny<DeviceEventLog>(), It.IsAny<CancellationToken>()), Times.Once);
        notifRepo.Verify(n => n.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    // ============================================
    // GetDeviceScheduleQueryHandler Tests
    // ============================================

    [Fact]
    public async Task GetSchedule_DeviceWithSchedules_ReturnsFormattedItems()
    {
        var deviceId = Guid.NewGuid();
        var containerId = Guid.NewGuid();
        var scheduleId = Guid.NewGuid();

        var device = new Device
        {
            Id = deviceId,
            Containers = new List<Container>
            {
                new Container
                {
                    Id = containerId,
                    SlotNumber = 1,
                    MedicationName = "Metformin 500mg",
                    PillsPerDose = 2,
                    Schedules = new List<Schedule>
                    {
                        new Schedule
                        {
                            Id = scheduleId,
                            ContainerId = containerId,
                            TimeOfDay = new TimeOnly(8, 0),
                            DaysOfWeekBitmask = 0x7F, // all days
                            StartDate = DateTime.UtcNow.AddDays(-30),
                            EndDate = null
                        }
                    }
                }
            }
        };

        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdWithContainersAndSchedulesAsync(deviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(device);
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var logger = new Mock<ILogger<GetDeviceScheduleQueryHandler>>();

        var handler = new GetDeviceScheduleQueryHandler(deviceRepo.Object, dateTime.Object, logger.Object);

        var result = await handler.Handle(new GetDeviceScheduleQuery(deviceId), default);

        Assert.Single(result.Schedules);
        var item = result.Schedules[0];
        Assert.Equal("Metformin 500mg", item.Medication);
        Assert.Equal(1, item.Slot);
        Assert.Equal(2, item.Pills);
        Assert.Contains("08:00", item.Times);
        Assert.Equal(7, item.Days.Count); // All 7 days
    }
}
