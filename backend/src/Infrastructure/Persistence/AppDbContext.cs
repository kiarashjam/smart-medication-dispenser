using Microsoft.EntityFrameworkCore;
using SmartMedicationDispenser.Domain.Entities;

namespace SmartMedicationDispenser.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext for PostgreSQL. Configures entities, indexes, and relationships.
/// Matches documentation in technical-docs
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Container> Containers => Set<Container>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<DispenseEvent> DispenseEvents => Set<DispenseEvent>();
    public DbSet<TravelSession> TravelSessions => Set<TravelSession>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<WebhookEndpoint> WebhookEndpoints => Set<WebhookEndpoint>();
    public DbSet<DeviceApiKey> DeviceApiKeys => Set<DeviceApiKey>();
    public DbSet<DeviceEventLog> DeviceEventLogs => Set<DeviceEventLog>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User: unique email; optional caregiver relationship.
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.FullName).HasMaxLength(200);
            e.HasOne(x => x.CaregiverUser).WithMany(x => x.Patients).HasForeignKey(x => x.CaregiverUserId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Device>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.TimeZoneId).HasMaxLength(100);
            e.Property(x => x.FirmwareVersion).HasMaxLength(50);
            e.Property(x => x.HardwareVersion).HasMaxLength(50);
            e.Property(x => x.MacAddress).HasMaxLength(20);
            e.Property(x => x.LastErrorCode).HasMaxLength(20);
            e.Property(x => x.LastErrorMessage).HasMaxLength(500);
            e.HasOne(x => x.User).WithMany(x => x.Devices).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<Container>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.MedicationName).HasMaxLength(200);
            e.Property(x => x.MedicationImageUrl).HasMaxLength(500);
            e.HasOne(x => x.Device).WithMany(x => x.Containers).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.SourceContainer).WithMany(x => x.PortableCopies).HasForeignKey(x => x.SourceContainerId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Schedule>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Notes).HasMaxLength(500);
            e.Property(x => x.TimeZoneId).HasMaxLength(100);
            e.HasOne(x => x.Container).WithMany(x => x.Schedules).HasForeignKey(x => x.ContainerId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<DispenseEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Device).WithMany(x => x.DispenseEvents).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Container).WithMany(x => x.DispenseEvents).HasForeignKey(x => x.ContainerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Schedule).WithMany(x => x.DispenseEvents).HasForeignKey(x => x.ScheduleId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<TravelSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.MainDevice).WithMany().HasForeignKey(x => x.MainDeviceId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.PortableDevice).WithMany().HasForeignKey(x => x.PortableDeviceId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Body).HasMaxLength(2000);
            e.HasOne(x => x.User).WithMany(x => x.Notifications).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<WebhookEndpoint>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Url).HasMaxLength(2000);
            e.Property(x => x.Secret).HasMaxLength(256);
            e.Property(x => x.Description).HasMaxLength(200);
            e.Property(x => x.LastStatus).HasMaxLength(50);
            e.HasOne(x => x.User).WithMany(x => x.WebhookEndpoints).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<DeviceApiKey>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.KeyHash).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(100);
            e.HasOne(x => x.Device).WithMany(x => x.ApiKeys).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
        });
        
        // DeviceEventLog: stores events received from devices
        modelBuilder.Entity<DeviceEventLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.DataJson).HasMaxLength(8000);
            e.Property(x => x.ProcessingError).HasMaxLength(1000);
            e.HasIndex(x => new { x.DeviceId, x.EventTimestampUtc });
            e.HasIndex(x => x.ReceivedAtUtc);
            e.HasOne(x => x.Device).WithMany().HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
        });

        // AuditLog: immutable audit trail for compliance
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Action).HasMaxLength(500);
            e.Property(x => x.EntityType).HasMaxLength(100);
            e.Property(x => x.IpAddress).HasMaxLength(50);
            e.Property(x => x.UserAgent).HasMaxLength(500);
            e.Property(x => x.CorrelationId).HasMaxLength(50);
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.CreatedAtUtc);
        });
    }
}
