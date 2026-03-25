using Microsoft.Extensions.Logging;
using Moq;
using SmartMedicationDispenser.Application.Common.Interfaces;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using Xunit;

namespace SmartMedicationDispenser.Application.Tests.DeviceApi;

public class RegisterDeviceCommandHandlerTests
{
    private readonly Mock<IDeviceRepository> _deviceRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IAuthService> _authService = new();
    private readonly Mock<IDateTimeProvider> _dateTime = new();
    private readonly Mock<ILogger<RegisterDeviceCommandHandler>> _logger = new();

    private RegisterDeviceCommandHandler CreateHandler() =>
        new(_deviceRepo.Object, _unitOfWork.Object, _authService.Object, _dateTime.Object, _logger.Object);

    [Fact]
    public async Task Handle_ValidDeviceId_RegistersSuccessfully()
    {
        // Arrange
        _dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        _authService.Setup(a => a.GenerateJwt(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<UserRole>()))
            .Returns("test-token");
        _deviceRepo.Setup(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device d, CancellationToken _) => d);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(new RegisterDeviceCommand(
            "SMD-12345678", "main", "1.0.0", "2.0", "AA:BB:CC:DD:EE:FF"
        ), CancellationToken.None);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("test-token", result.DeviceToken);
        Assert.Equal(60, result.HeartbeatInterval);
        _deviceRepo.Verify(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("INVALID")]
    [InlineData("SMD-12345")]  // Too short
    [InlineData("SMD-1234567890")]  // Too long
    public async Task Handle_InvalidDeviceId_ReturnsFailed(string deviceId)
    {
        var handler = CreateHandler();

        var result = await handler.Handle(new RegisterDeviceCommand(
            deviceId, "main", null, null, null
        ), CancellationToken.None);

        Assert.False(result.Success);
        Assert.Null(result.DeviceToken);
    }

    [Fact]
    public async Task Handle_PortableType_CreatesPortableDevice()
    {
        _dateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        _authService.Setup(a => a.GenerateJwt(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<UserRole>()))
            .Returns("token");

        Device? capturedDevice = null;
        _deviceRepo.Setup(r => r.AddAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()))
            .Callback<Device, CancellationToken>((d, _) => capturedDevice = d)
            .ReturnsAsync((Device d, CancellationToken _) => d);

        var handler = CreateHandler();

        await handler.Handle(new RegisterDeviceCommand(
            "SMD-ABCDEF01", "portable", null, null, null
        ), CancellationToken.None);

        Assert.NotNull(capturedDevice);
        Assert.Equal(DeviceType.Portable, capturedDevice!.Type);
    }
}
