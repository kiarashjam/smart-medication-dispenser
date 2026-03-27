using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Application.DeviceApi;
using SmartMedicationDispenser.Domain.Entities;
using SmartMedicationDispenser.Domain.Enums;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

/// <summary>Seeds demo users (caregiver + several patients), devices, containers, and schedules.</summary>
public static class SeedData
{
    public const string DemoPatientEmail = "patient@demo.com";
    public const string DemoCaregiverEmail = "caregiver@demo.com";
    public const string DemoPassword = "Demo123!";

    private const string DemoTimeZone = "Europe/Zurich";

    private sealed record DemoPatientSpec(
        string Email,
        string FullName,
        string MainDeviceName,
        string? PortableDeviceName,
        (string Medication, int Quantity, int LowStock) Slot1,
        (string Medication, int Quantity, int LowStock) Slot2);

    private static readonly DemoPatientSpec[] DemoPatientSpecs =
    [
        new(
            DemoPatientEmail,
            "Demo Patient",
            "Home Dispenser",
            "Travel Dispenser",
            ("Vitamin D", 30, 7),
            ("Aspirin", 60, 14)),
        new(
            "maria.schneider@demo.com",
            "Maria Schneider",
            "Maria — Home unit",
            null,
            ("Metformin", 45, 10),
            ("Omega-3", 20, 5)),
        new(
            "hans.weber@demo.com",
            "Hans Weber",
            "Hans — Kitchen dispenser",
            null,
            ("Lisinopril", 28, 7),
            ("Vitamin B12", 15, 4)),
    ];

    /// <summary>Full seed when the database has no users (original behavior).</summary>
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
            return;

        var caregiver = NewCaregiver();
        db.Users.Add(caregiver);
        await db.SaveChangesAsync(cancellationToken);

        foreach (var spec in DemoPatientSpecs)
            AddPatientWithDevices(db, caregiver.Id, spec);

        await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Ensures demo caregiver and linked demo patients exist (idempotent). Use for Docker/production demos
    /// when the DB was already populated and <see cref="SeedAsync"/> did not run.
    /// </summary>
    public static async Task EnsureDemoAccountsAsync(AppDbContext db, bool enabled, CancellationToken cancellationToken = default)
    {
        if (!enabled)
            return;

        var caregiver = await db.Users.FirstOrDefaultAsync(u => u.Email == DemoCaregiverEmail, cancellationToken);
        if (caregiver == null)
        {
            caregiver = NewCaregiver();
            db.Users.Add(caregiver);
            await db.SaveChangesAsync(cancellationToken);
        }
        else if (caregiver.Role != UserRole.Caregiver)
        {
            return;
        }

        foreach (var spec in DemoPatientSpecs)
        {
            var patient = await db.Users.FirstOrDefaultAsync(u => u.Email == spec.Email, cancellationToken);
            if (patient == null)
            {
                patient = NewPatient(spec, caregiver.Id);
                db.Users.Add(patient);
                await db.SaveChangesAsync(cancellationToken);
            }
            else
            {
                if (patient.Role != UserRole.Patient)
                    continue;
                if (patient.CaregiverUserId != caregiver.Id)
                {
                    patient.CaregiverUserId = caregiver.Id;
                    patient.UpdatedAtUtc = DateTime.UtcNow;
                }
            }

            if (!await db.Devices.AnyAsync(d => d.UserId == patient.Id, cancellationToken))
                AddPatientWithDevices(db, caregiver.Id, spec, patient.Id);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Ensures a dedicated user exists so <see cref="RegisterDeviceCommandHandler"/> can satisfy the devices → users FK.
    /// Idempotent; safe on every startup.
    /// </summary>
    public static async Task EnsureUnassignedDeviceOwnerAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(u => u.Id == DeviceRegistrationConstants.UnassignedOwnerUserId, cancellationToken))
            return;

        db.Users.Add(new User
        {
            Id = DeviceRegistrationConstants.UnassignedOwnerUserId,
            Email = DeviceRegistrationConstants.UnassignedOwnerEmail,
            PasswordHash = BCryptNet.HashPassword(Guid.NewGuid().ToString("N")),
            FullName = "Unassigned devices (system)",
            Role = UserRole.Patient,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private static User NewCaregiver() => new()
    {
        Id = Guid.NewGuid(),
        Email = DemoCaregiverEmail,
        PasswordHash = BCryptNet.HashPassword(DemoPassword),
        FullName = "Demo Caregiver",
        Role = UserRole.Caregiver,
        CreatedAtUtc = DateTime.UtcNow
    };

    private static User NewPatient(DemoPatientSpec spec, Guid caregiverId) => new()
    {
        Id = Guid.NewGuid(),
        Email = spec.Email,
        PasswordHash = BCryptNet.HashPassword(DemoPassword),
        FullName = spec.FullName,
        Role = UserRole.Patient,
        CaregiverUserId = caregiverId,
        CreatedAtUtc = DateTime.UtcNow
    };

    /// <summary>Adds devices, containers, and schedules for a patient. Optionally reuse an existing patient id (ensure path).</summary>
    private static void AddPatientWithDevices(AppDbContext db, Guid caregiverId, DemoPatientSpec spec, Guid? existingPatientId = null)
    {
        Guid patientId;
        if (existingPatientId.HasValue)
        {
            patientId = existingPatientId.Value;
        }
        else
        {
            var patient = NewPatient(spec, caregiverId);
            patientId = patient.Id;
            db.Users.Add(patient);
        }

        var mainDeviceId = Guid.NewGuid();
        db.Devices.Add(new Device
        {
            Id = mainDeviceId,
            UserId = patientId,
            Name = spec.MainDeviceName,
            Type = DeviceType.Main,
            Status = DeviceStatus.Active,
            TimeZoneId = DemoTimeZone,
            CreatedAtUtc = DateTime.UtcNow
        });

        if (spec.PortableDeviceName != null)
        {
            db.Devices.Add(new Device
            {
                Id = Guid.NewGuid(),
                UserId = patientId,
                Name = spec.PortableDeviceName,
                Type = DeviceType.Portable,
                Status = DeviceStatus.Paused,
                TimeZoneId = DemoTimeZone,
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        var c1Id = Guid.NewGuid();
        var c2Id = Guid.NewGuid();
        db.Containers.AddRange(
            new Container
            {
                Id = c1Id,
                DeviceId = mainDeviceId,
                SlotNumber = 1,
                MedicationName = spec.Slot1.Medication,
                Quantity = spec.Slot1.Quantity,
                PillsPerDose = 1,
                LowStockThreshold = spec.Slot1.LowStock,
                CreatedAtUtc = DateTime.UtcNow
            },
            new Container
            {
                Id = c2Id,
                DeviceId = mainDeviceId,
                SlotNumber = 2,
                MedicationName = spec.Slot2.Medication,
                Quantity = spec.Slot2.Quantity,
                PillsPerDose = 1,
                LowStockThreshold = spec.Slot2.LowStock,
                CreatedAtUtc = DateTime.UtcNow
            });

        var startDate = DateTime.UtcNow.Date.AddDays(-7);
        db.Schedules.AddRange(
            new Schedule
            {
                Id = Guid.NewGuid(),
                ContainerId = c1Id,
                TimeOfDay = new TimeOnly(8, 0),
                DaysOfWeekBitmask = 127,
                StartDate = startDate,
                EndDate = null,
                Notes = "Morning",
                TimeZoneId = DemoTimeZone,
                CreatedAtUtc = DateTime.UtcNow
            },
            new Schedule
            {
                Id = Guid.NewGuid(),
                ContainerId = c2Id,
                TimeOfDay = new TimeOnly(20, 0),
                DaysOfWeekBitmask = 127,
                StartDate = startDate,
                EndDate = null,
                Notes = "Evening",
                TimeZoneId = DemoTimeZone,
                CreatedAtUtc = DateTime.UtcNow
            });
    }
}
