using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

/// <summary>Seeds demo users (patient, caregiver), devices, containers, and schedules if DB is empty.</summary>
public static class SeedData
{
    public const string DemoPatientEmail = "patient@demo.com";
    public const string DemoCaregiverEmail = "caregiver@demo.com";
    public const string DemoPassword = "Demo123!";

    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
            return;

        var patientId = Guid.NewGuid();
        var caregiverId = Guid.NewGuid();
        var mainDeviceId = Guid.NewGuid();
        var portableDeviceId = Guid.NewGuid();

        var patient = new User
        {
            Id = patientId,
            Email = DemoPatientEmail,
            PasswordHash = BCryptNet.HashPassword(DemoPassword),
            FullName = "Demo Patient",
            Role = UserRole.Patient,
            CaregiverUserId = caregiverId,
            CreatedAtUtc = DateTime.UtcNow
        };
        var caregiver = new User
        {
            Id = caregiverId,
            Email = DemoCaregiverEmail,
            PasswordHash = BCryptNet.HashPassword(DemoPassword),
            FullName = "Demo Caregiver",
            Role = UserRole.Caregiver,
            CreatedAtUtc = DateTime.UtcNow
        };
        db.Users.AddRange(patient, caregiver);

        var mainDevice = new Device
        {
            Id = mainDeviceId,
            UserId = patientId,
            Name = "Home Dispenser",
            Type = DeviceType.Main,
            Status = DeviceStatus.Active,
            TimeZoneId = "America/New_York",
            CreatedAtUtc = DateTime.UtcNow
        };
        var portableDevice = new Device
        {
            Id = portableDeviceId,
            UserId = patientId,
            Name = "Travel Dispenser",
            Type = DeviceType.Portable,
            Status = DeviceStatus.Paused,
            TimeZoneId = "America/New_York",
            CreatedAtUtc = DateTime.UtcNow
        };
        db.Devices.AddRange(mainDevice, portableDevice);

        var container1Id = Guid.NewGuid();
        var container2Id = Guid.NewGuid();
        var container1 = new Container
        {
            Id = container1Id,
            DeviceId = mainDeviceId,
            SlotNumber = 1,
            MedicationName = "Vitamin D",
            MedicationImageUrl = null,
            Quantity = 30,
            PillsPerDose = 1,
            LowStockThreshold = 7,
            CreatedAtUtc = DateTime.UtcNow
        };
        var container2 = new Container
        {
            Id = container2Id,
            DeviceId = mainDeviceId,
            SlotNumber = 2,
            MedicationName = "Aspirin",
            MedicationImageUrl = null,
            Quantity = 60,
            PillsPerDose = 1,
            LowStockThreshold = 14,
            CreatedAtUtc = DateTime.UtcNow
        };
        db.Containers.AddRange(container1, container2);

        var schedule1Id = Guid.NewGuid();
        var schedule2Id = Guid.NewGuid();
        var startDate = DateTime.UtcNow.Date.AddDays(-7);
        db.Schedules.AddRange(
            new Schedule
            {
                Id = schedule1Id,
                ContainerId = container1Id,
                TimeOfDay = new TimeOnly(8, 0),
                DaysOfWeekBitmask = 127,
                StartDate = startDate,
                EndDate = null,
                Notes = "With breakfast",
                TimeZoneId = "America/New_York",
                CreatedAtUtc = DateTime.UtcNow
            },
            new Schedule
            {
                Id = schedule2Id,
                ContainerId = container2Id,
                TimeOfDay = new TimeOnly(20, 0),
                DaysOfWeekBitmask = 127,
                StartDate = startDate,
                EndDate = null,
                Notes = "After dinner",
                TimeZoneId = "America/New_York",
                CreatedAtUtc = DateTime.UtcNow
            }
        );

        await db.SaveChangesAsync(cancellationToken);
    }
}
