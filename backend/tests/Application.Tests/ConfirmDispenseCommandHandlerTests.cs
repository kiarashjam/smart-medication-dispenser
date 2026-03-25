using Moq;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.Dispensing;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests;

public class ConfirmDispenseCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenEventIsDispensed_DecrementsQuantityAndMarksConfirmed()
    {
        var userId = Guid.NewGuid();
        var deviceId = Guid.NewGuid();
        var containerId = Guid.NewGuid();
        var scheduleId = Guid.NewGuid();
        var evt = new DispenseEvent
        {
            Id = Guid.NewGuid(),
            DeviceId = deviceId,
            ContainerId = containerId,
            ScheduleId = scheduleId,
            Status = DispenseEventStatus.Dispensed,
            ScheduledAtUtc = DateTime.UtcNow,
            DispensedAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };
        var device = new Device { Id = deviceId, UserId = userId };
        var container = new Container
        {
            Id = containerId,
            MedicationName = "Test",
            PillsPerDose = 2,
            Quantity = 10
        };

        var dispenseRepo = new Mock<IDispenseEventRepository>();
        dispenseRepo.Setup(r => r.GetByIdAsync(evt.Id, It.IsAny<CancellationToken>())).ReturnsAsync(evt);
        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdAsync(deviceId, It.IsAny<CancellationToken>())).ReturnsAsync(device);
        var containerRepo = new Mock<IContainerRepository>();
        containerRepo.Setup(r => r.GetByIdAsync(containerId, It.IsAny<CancellationToken>())).ReturnsAsync(container);
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        var webhookEndpoints = new Mock<IWebhookEndpointRepository>();
        webhookEndpoints.Setup(w => w.GetActiveByUserIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Domain.Entities.WebhookEndpoint>());
        var webhookDelivery = new Mock<IWebhookDeliveryService>();

        var handler = new ConfirmDispenseCommandHandler(
            dispenseRepo.Object, containerRepo.Object, deviceRepo.Object, unitOfWork.Object, dateTime.Object, webhookEndpoints.Object, webhookDelivery.Object);
        var result = await handler.Handle(new ConfirmDispenseCommand(userId, evt.Id), default);

        Assert.NotNull(result);
        Assert.Equal("Confirmed", result.Status);
        Assert.Equal(8, container.Quantity);
    }

    [Fact]
    public async Task Handle_WhenEventIsNotDispensed_Throws()
    {
        var userId = Guid.NewGuid();
        var evt = new DispenseEvent
        {
            Id = Guid.NewGuid(),
            DeviceId = Guid.NewGuid(),
            ContainerId = Guid.NewGuid(),
            ScheduleId = Guid.NewGuid(),
            Status = DispenseEventStatus.Missed,
            CreatedAtUtc = DateTime.UtcNow
        };
        var device = new Device { Id = evt.DeviceId, UserId = userId };
        var dispenseRepo = new Mock<IDispenseEventRepository>();
        dispenseRepo.Setup(r => r.GetByIdAsync(evt.Id, It.IsAny<CancellationToken>())).ReturnsAsync(evt);
        var deviceRepo = new Mock<IDeviceRepository>();
        deviceRepo.Setup(r => r.GetByIdAsync(evt.DeviceId, It.IsAny<CancellationToken>())).ReturnsAsync(device);
        var containerRepo = new Mock<IContainerRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();
        var dateTime = new Mock<IDateTimeProvider>();
        var webhookEndpoints = new Mock<IWebhookEndpointRepository>();
        var webhookDelivery = new Mock<IWebhookDeliveryService>();

        var handler = new ConfirmDispenseCommandHandler(
            dispenseRepo.Object, containerRepo.Object, deviceRepo.Object, unitOfWork.Object, dateTime.Object, webhookEndpoints.Object, webhookDelivery.Object);
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new ConfirmDispenseCommand(userId, evt.Id), default));
    }
}
