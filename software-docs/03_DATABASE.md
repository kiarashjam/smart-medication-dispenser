# Database Documentation

**Smart Medication Dispenser — Entity Framework Core, Schema Design & Migrations**

**Version 2.0 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.0 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | Backend Engineers |
| **Related Documents** | [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md), [02_BACKEND_API.md](./02_BACKEND_API.md), [04_CLOUD_DEPLOYMENT.md](./04_CLOUD_DEPLOYMENT.md) |

---

## 1. Overview

| Aspect | Detail |
|:-------|:-------|
| **ORM** | Entity Framework Core 8.0 |
| **Production DB** | PostgreSQL 15 (Alpine) |
| **Development DB** | SQLite (auto-detected from connection string) |
| **Tables** | 11 |
| **Migrations** | Code-first with EF Core Migrations |
| **Auto-detect** | Connection string starting with `Data Source=` → SQLite; otherwise → PostgreSQL |

---

## 2. Database Schema

### 2.1 Entity-Relationship Diagram

```
┌──────────────────┐          ┌──────────────────┐
│      Users        │          │     Devices       │
├──────────────────┤          ├──────────────────┤
│ Id (PK, GUID)    │──1:N───▶│ Id (PK, GUID)    │
│ Email (unique)   │          │ UserId (FK)      │
│ PasswordHash     │          │ Name             │
│ FullName         │          │ Type (enum)      │
│ Role (enum)      │          │ Status (enum)    │
│ CaregiverUserId  │──self──▶│ TimeZoneId       │
│ CreatedAtUtc     │          │ LastHeartbeatAtUtc│
│ UpdatedAtUtc     │          │ FirmwareVersion  │
└──────────────────┘          │ HardwareVersion  │
        │                     │ MacAddress       │
        │                     │ BatteryLevel     │
        │                     │ WifiSignal       │
        │                     │ Temperature      │
        │                     │ Humidity         │
        │                     │ IsOnline         │
        │                     │ LastOnlineAtUtc  │
        │                     │ LastOfflineAtUtc │
        │                     │ LastErrorCode    │
        │                     │ LastErrorMessage │
        │                     │ CreatedAtUtc     │
        │                     │ UpdatedAtUtc     │
        │                     └──────────────────┘
        │                            │
        │                     ┌──────┼──────────────────────────┐
        │                     │      │                          │
        │                     ▼      ▼                          ▼
        │         ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
        │         │  Containers   │ │DeviceApiKeys │  │ DeviceEventLogs  │
        │         ├──────────────┤ ├──────────────┤  ├──────────────────┤
        │         │ Id (PK)      │ │ Id (PK)      │  │ Id (PK)          │
        │         │ DeviceId(FK) │ │ DeviceId(FK) │  │ DeviceId (FK)    │
        │         │ SlotNumber   │ │ KeyHash      │  │ EventType (enum) │
        │         │ MedicationName   │ │ Name         │  │ EventTimestampUtc│
        │         │ MedicationImageUrl│ │ CreatedAtUtc │  │ ReceivedAtUtc    │
        │         │ Quantity     │ │ LastUsedAtUtc│  │ DataJson         │
        │         │ PillsPerDose │ └──────────────┘  │ Processed        │
        │         │ LowStockThreshold│                │ ProcessingError  │
        │         │ SourceContId │                   └──────────────────┘
        │         │ CreatedAtUtc │
        │         │ UpdatedAtUtc │
        │         └──────────────┘
        │                │
        │                │ 1:N
        │                ▼
        │         ┌──────────────┐
        │         │  Schedules    │
        │         ├──────────────┤
        │         │ Id (PK)      │
        │         │ ContainerId  │
        │         │ TimeOfDay    │
        │         │ DaysOfWeekBitmask │
        │         │ StartDate    │
        │         │ EndDate      │
        │         │ Notes        │
        │         │ TimeZoneId   │
        │         │ CreatedAtUtc │
        │         │ UpdatedAtUtc │
        │         └──────────────┘
        │                │
        │                │ 1:N
        │                ▼
        │         ┌──────────────────┐
        │         │  DispenseEvents   │
        │         ├──────────────────┤
        │         │ Id (PK)          │
        │         │ DeviceId (FK)    │
        │         │ ContainerId (FK) │
        │         │ ScheduleId (FK)  │
        │         │ ScheduledAtUtc   │
        │         │ Status (enum)    │
        │         │ DispensedAtUtc   │
        │         │ ConfirmedAtUtc   │
        │         │ MissedMarkedAtUtc│
        │         │ DelayedAtUtc     │
        │         │ CreatedAtUtc     │
        │         └──────────────────┘
        │
        ├──1:N──▶ ┌──────────────────┐
        │         │  Notifications    │
        │         ├──────────────────┤
        │         │ Id (PK)          │
        │         │ UserId (FK)      │
        │         │ Type (enum)      │
        │         │ Title            │
        │         │ Body             │
        │         │ IsRead           │
        │         │ CreatedAtUtc     │
        │         │ RelatedEntityId  │
        │         └──────────────────┘
        │
        └──1:N──▶ ┌──────────────────┐
                  │ WebhookEndpoints  │
                  ├──────────────────┤
                  │ Id (PK)          │
                  │ UserId (FK)      │
                  │ Url              │
                  │ Secret           │
                  │ IsActive         │
                  │ Description      │
                  │ LastTriggeredAtUtc │
                  │ LastStatus       │
                  │ CreatedAtUtc     │
                  └──────────────────┘

┌──────────────────────────┐
│    TravelSessions         │
├──────────────────────────┤
│ Id (PK)                  │
│ UserId (FK → Users)      │
│ MainDeviceId (FK)        │
│ PortableDeviceId (FK)    │
│ StartedAtUtc             │
│ EndedAtUtc               │
│ PlannedEndDateUtc        │
│ CreatedAtUtc             │
└──────────────────────────┘
```

---

## 3. Table Definitions

### 3.1 Users

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Unique user identifier |
| `Email` | VARCHAR(256) | Unique, Not Null | Login email |
| `PasswordHash` | TEXT | Not Null | BCrypt hash |
| `FullName` | VARCHAR(200) | Not Null | Display name |
| `Role` | INT (enum) | Not Null | 0=Patient, 1=Caregiver, 2=Admin |
| `CaregiverUserId` | GUID? | FK → Users.Id | Assigned caregiver (self-ref) |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Account creation time |
| `UpdatedAtUtc` | TIMESTAMP? | — | Last update time |

**Indexes:** Unique index on `Email`

**Relationships:**
- Self-referential: `CaregiverUserId` → `Users.Id` (RESTRICT delete)
- One caregiver → many patients

### 3.2 Devices

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Device identifier |
| `UserId` | GUID | FK → Users.Id, CASCADE | Owner |
| `Name` | VARCHAR(200) | Not Null | Device display name |
| `Type` | INT (enum) | Not Null | 0=Main (SMD-100), 1=Portable (SMD-200) |
| `Status` | INT (enum) | Not Null | 0=Active, 1=Paused |
| `TimeZoneId` | VARCHAR(100) | — | IANA time zone |
| `LastHeartbeatAtUtc` | TIMESTAMP? | — | Last heartbeat received |
| `FirmwareVersion` | VARCHAR(50) | — | Current firmware version |
| `HardwareVersion` | VARCHAR(50) | — | Hardware revision |
| `MacAddress` | VARCHAR(20) | — | WiFi MAC address |
| `BatteryLevel` | INT? | 0-100 | Battery percentage (portable) |
| `WifiSignal` | INT? | dBm | WiFi signal strength |
| `Temperature` | DECIMAL? | — | Ambient temperature (°C) |
| `Humidity` | INT? | 0-100 | Ambient humidity (%) |
| `IsOnline` | BOOLEAN | Not Null | Connection state |
| `LastOnlineAtUtc` | TIMESTAMP? | — | Last online timestamp |
| `LastOfflineAtUtc` | TIMESTAMP? | — | Last offline timestamp |
| `LastErrorCode` | VARCHAR(20) | — | Last error code |
| `LastErrorMessage` | VARCHAR(500) | — | Last error detail |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Device creation time |
| `UpdatedAtUtc` | TIMESTAMP? | — | Last update time |

**Relationships:**
- CASCADE delete from User → Devices
- One device → many containers, dispense events, API keys

### 3.3 Containers

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Container identifier |
| `DeviceId` | GUID | FK → Devices.Id, CASCADE | Parent device |
| `SlotNumber` | INT | Not Null | Physical slot position |
| `MedicationName` | VARCHAR(200) | Not Null | Medication name |
| `MedicationImageUrl` | VARCHAR(500) | — | Image URL |
| `Quantity` | INT | Not Null | Current pill count |
| `PillsPerDose` | INT | Not Null | Pills dispensed per dose |
| `LowStockThreshold` | INT | Not Null | Alert threshold |
| `SourceContainerId` | GUID? | FK → Containers.Id, RESTRICT | Source for travel copies |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Creation time |
| `UpdatedAtUtc` | TIMESTAMP? | — | Last update time |

**Relationships:**
- CASCADE delete from Device → Containers
- Self-referential: `SourceContainerId` for travel container copies
- One container → many schedules, dispense events

### 3.4 Schedules

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Schedule identifier |
| `ContainerId` | GUID | FK → Containers.Id, CASCADE | Parent container |
| `TimeOfDay` | TIME | Not Null | Dose time (e.g., 08:00) |
| `DaysOfWeekBitmask` | INT | Not Null | Active days (bitmask 1-127) |
| `StartDate` | TIMESTAMP | Not Null | Schedule start date |
| `EndDate` | TIMESTAMP? | — | Optional end date |
| `Notes` | VARCHAR(500) | — | Dosing instructions |
| `TimeZoneId` | VARCHAR(100) | — | IANA time zone |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Creation time |
| `UpdatedAtUtc` | TIMESTAMP? | — | Last update time |

**Relationships:**
- CASCADE delete from Container → Schedules
- One schedule → many dispense events

### 3.5 DispenseEvents

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Event identifier |
| `DeviceId` | GUID | FK → Devices.Id, CASCADE | Source device |
| `ContainerId` | GUID | FK → Containers.Id, RESTRICT | Source container |
| `ScheduleId` | GUID | FK → Schedules.Id, RESTRICT | Source schedule |
| `ScheduledAtUtc` | TIMESTAMP | Not Null | When dose was scheduled |
| `Status` | INT (enum) | Not Null | 0=Pending, 1=Dispensed, 2=Confirmed, 3=Missed, 4=Delayed |
| `DispensedAtUtc` | TIMESTAMP? | — | When pills were released |
| `ConfirmedAtUtc` | TIMESTAMP? | — | When user confirmed intake |
| `MissedMarkedAtUtc` | TIMESTAMP? | — | When marked as missed |
| `DelayedAtUtc` | TIMESTAMP? | — | When reminder was delayed |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Record creation time |

**Status Lifecycle:**
```
Pending → Dispensed → Confirmed (user took pills)
                   → Missed (60 min timeout)
                   → Delayed (user snoozed)
```

### 3.6 Notifications

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Notification identifier |
| `UserId` | GUID | FK → Users.Id, CASCADE | Recipient |
| `Type` | INT (enum) | Not Null | Notification category |
| `Title` | VARCHAR(200) | Not Null | Notification title |
| `Body` | VARCHAR(2000) | Not Null | Notification body |
| `IsRead` | BOOLEAN | Not Null | Read status |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Creation time |
| `RelatedEntityId` | GUID? | — | Related dispense event or container |

**NotificationType enum values:**

| Value | Name | Description |
|:------|:-----|:------------|
| 0 | MissedDose | Missed dose alert |
| 1 | LowStock | Low stock warning |
| 2 | TravelStarted | Travel session started |
| 3 | TravelEnded | Travel session ended |
| 4 | General | General notification |
| 5 | DoseDispensed | Dose was dispensed |
| 6 | DoseTaken | Dose was taken |
| 7 | RefillCritical | Refill critically low |
| 8 | DeviceOnline | Device came online |
| 9 | DeviceOffline | Device went offline |
| 10 | DeviceError | Device error |
| 11 | DeviceStatus | Device status update |
| 12 | BatteryLow | Battery low |
| 13 | BatteryCritical | Battery critical |

### 3.7 TravelSessions

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Session identifier |
| `UserId` | GUID | FK → Users.Id, CASCADE | Session owner |
| `MainDeviceId` | GUID | FK → Devices.Id, RESTRICT | Home device |
| `PortableDeviceId` | GUID | FK → Devices.Id, RESTRICT | Travel device |
| `StartedAtUtc` | TIMESTAMP | Not Null | Session start |
| `EndedAtUtc` | TIMESTAMP? | — | Session end (null if active) |
| `PlannedEndDateUtc` | TIMESTAMP | Not Null | Planned return date |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Record creation time |

### 3.8 WebhookEndpoints

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Endpoint identifier |
| `UserId` | GUID | FK → Users.Id, CASCADE | Owner |
| `Url` | VARCHAR(2000) | Not Null | Webhook URL |
| `Secret` | VARCHAR(256) | — | HMAC-SHA256 signing secret |
| `IsActive` | BOOLEAN | Not Null | Active flag |
| `Description` | VARCHAR(200) | — | Description |
| `LastTriggeredAtUtc` | TIMESTAMP? | — | Last delivery time |
| `LastStatus` | VARCHAR(50) | — | Last HTTP status |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Creation time |

### 3.9 DeviceApiKeys

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Key identifier |
| `DeviceId` | GUID | FK → Devices.Id, CASCADE | Associated device |
| `KeyHash` | VARCHAR(64) | Not Null | SHA256 hash of API key |
| `Name` | VARCHAR(100) | — | Descriptive name |
| `CreatedAtUtc` | TIMESTAMP | Not Null | Creation time |
| `LastUsedAtUtc` | TIMESTAMP? | — | Last usage time |

### 3.10 DeviceEventLogs

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Log entry identifier |
| `DeviceId` | GUID | FK → Devices.Id, CASCADE | Source device |
| `EventType` | INT (enum) | Not Null | Event category |
| `EventTimestampUtc` | TIMESTAMP | Not Null | When event occurred on device |
| `ReceivedAtUtc` | TIMESTAMP | Not Null | When API received event |
| `DataJson` | VARCHAR(8000) | — | Raw JSON payload |
| `Processed` | BOOLEAN | Not Null | Processing status |
| `ProcessingError` | VARCHAR(1000) | — | Error message if failed |

**DeviceEventType enum values:**

| Value | Name | Description |
|:------|:-----|:------------|
| 0 | DoseDispensed | Dose was dispensed |
| 1 | DoseTaken | Dose was taken |
| 2 | DoseMissed | Dose was missed |
| 3 | RefillNeeded | Refill needed |
| 4 | RefillCritical | Refill critically low |
| 5 | DeviceOnline | Device came online |
| 6 | DeviceOffline | Device went offline |
| 7 | DeviceError | Device error |
| 8 | BatteryLow | Battery low |
| 9 | BatteryCritical | Battery critical |
| 10 | TravelModeOn | Travel mode enabled |
| 11 | TravelModeOff | Travel mode disabled |
| 12 | Heartbeat | Device heartbeat |

**Indexes:**
- Composite index: `(DeviceId, EventTimestampUtc)`
- Index: `ReceivedAtUtc`

### 3.11 AuditLogs

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `Id` | GUID | PK | Log entry identifier |
| `UserId` | GUID? | Indexed, no FK | User who performed the action (nullable for system/anonymous) |
| `Action` | VARCHAR(500) | Not Null | Action description |
| `EntityType` | VARCHAR(100)? | — | Type of entity affected |
| `EntityId` | GUID? | — | ID of entity affected |
| `IpAddress` | VARCHAR(50)? | — | Client IP address |
| `UserAgent` | VARCHAR(500)? | — | Client user agent |
| `StatusCode` | INT | Not Null | HTTP or result status code |
| `CorrelationId` | VARCHAR(50)? | — | Request correlation ID |
| `CreatedAtUtc` | TIMESTAMP | Not Null, Indexed | When the action occurred |

**Indexes:** Index on `UserId`, Index on `CreatedAtUtc`

---

## 4. Delete Behavior Reference

| Parent | Child | On Delete |
|:-------|:------|:----------|
| User | Device | CASCADE |
| User | Notification | CASCADE |
| User | WebhookEndpoint | CASCADE |
| User (Caregiver) | User (Patient) | RESTRICT |
| User | TravelSession | CASCADE |
| Device | Container | CASCADE |
| Device | DispenseEvent | CASCADE |
| Device | DeviceApiKey | CASCADE |
| Device | DeviceEventLog | CASCADE |
| Device | TravelSession (Main/Portable) | RESTRICT |
| Container | Schedule | CASCADE |
| Container | DispenseEvent | RESTRICT |
| Container | Container (SourceCopy) | RESTRICT |
| Schedule | DispenseEvent | RESTRICT |

---

## 5. Migrations

### 5.1 Migration History

| Migration | Date | Description |
|:----------|:-----|:------------|
| `20260203104220_Initial` | Feb 3, 2026 | Initial schema: Users, Devices, Containers, Schedules, DispenseEvents, TravelSessions, Notifications |
| `20260203143859_AddWebhooksAndApiKeys` | Feb 3, 2026 | Added WebhookEndpoints, DeviceApiKeys, DeviceEventLogs tables |

### 5.2 Migration Commands

```bash
# Apply all pending migrations (PostgreSQL)
cd backend
dotnet ef database update --project src/Infrastructure --startup-project src/Api

# Create a new migration
dotnet ef migrations add MigrationName --project src/Infrastructure --startup-project src/Api

# Revert last migration
dotnet ef database update PreviousMigrationName --project src/Infrastructure --startup-project src/Api

# Generate SQL script (for manual review)
dotnet ef migrations script --project src/Infrastructure --startup-project src/Api
```

### 5.3 Auto-Migration on Startup

The application automatically applies migrations on startup:

```csharp
// Program.cs — runs on every app start
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (useSqlite)
        await db.Database.EnsureCreatedAsync();  // SQLite: create if not exists
    else
        await db.Database.MigrateAsync();        // PostgreSQL: apply migrations
    await SeedData.SeedAsync(db);                // Seed demo data if empty
}
```

---

## 6. Seed Data

When the database is empty (no users), the following demo data is automatically created:

### 6.1 Demo Users

| Email | Password | Role | Notes |
|:------|:---------|:-----|:------|
| patient@demo.com | Demo123! | Patient | Has caregiver assigned |
| caregiver@demo.com | Demo123! | Caregiver | Monitors patient |
| admin@demo.com | Demo123! | Admin | Full access |

### 6.2 Demo Devices

| Name | Type | Status | Owner |
|:-----|:-----|:-------|:------|
| Home Dispenser | Main (SMD-100) | Active | Demo Patient |
| Travel Dispenser | Portable (SMD-200) | Paused | Demo Patient |

### 6.3 Demo Containers

| Slot | Medication | Quantity | Pills/Dose | Low Stock | Device |
|:-----|:-----------|:---------|:-----------|:----------|:-------|
| 1 | Vitamin D | 30 | 1 | 7 | Home Dispenser |
| 2 | Aspirin | 60 | 1 | 14 | Home Dispenser |

### 6.4 Demo Schedules

| Medication | Time | Days | Notes |
|:-----------|:-----|:-----|:------|
| Vitamin D | 08:00 | Every day (127) | With breakfast |
| Aspirin | 20:00 | Every day (127) | After dinner |

---

## 7. DbContext Configuration

### 7.1 DbSet Declarations

```csharp
public class AppDbContext : DbContext
{
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
}
```

### 7.2 Key Configuration Highlights

- **User.Email** — Unique index, max 256 chars
- **Container.SourceContainer** — Self-referential FK for travel copies (RESTRICT delete)
- **DispenseEvent** — References Device (CASCADE), Container (RESTRICT), Schedule (RESTRICT)
- **TravelSession** — References User (CASCADE), MainDevice (RESTRICT), PortableDevice (RESTRICT)
- **DeviceEventLog** — Composite index on `(DeviceId, EventTimestampUtc)` for efficient querying

---

## 8. Repository Pattern

All database access goes through repository interfaces (defined in Application layer) with implementations in Infrastructure:

### 8.1 Repository Methods (Common Pattern)

```csharp
// Example: IDeviceRepository
public interface IDeviceRepository
{
    Task<Device?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<Device>> GetByUserIdAsync(Guid userId, CancellationToken ct);
    Task AddAsync(Device device, CancellationToken ct);
    // ... additional query methods
}
```

### 8.2 Unit of Work

```csharp
// All changes are committed atomically via UnitOfWork
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct);
}
```

The `UnitOfWork` wraps `AppDbContext.SaveChangesAsync()`, ensuring all repository changes within a handler are committed in a single transaction.

---

## 9. Connection Strings

### 9.1 PostgreSQL (Production/Docker)

```
Host=localhost;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret
```

Docker Compose format:
```
Host=db;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret
```

### 9.2 SQLite (Local Development)

```
Data Source=dispenser.db
```

### 9.3 Switching Between Databases

Simply change the connection string in `appsettings.json` or via environment variable. The Infrastructure layer auto-detects the provider:

```csharp
var useSqlite = conn.TrimStart().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase);
if (useSqlite)
    services.AddDbContext<AppDbContext>(o => o.UseSqlite(conn));
else
    services.AddDbContext<AppDbContext>(o => o.UseNpgsql(conn));
```

---

## 10. Performance Considerations

| Concern | Mitigation |
|:--------|:-----------|
| **Large event logs** | Composite index on `(DeviceId, EventTimestampUtc)` |
| **DeviceEventLog queries** | Index on `ReceivedAtUtc` for recent event filtering |
| **Unique email lookup** | Unique index on `Users.Email` |
| **Low stock check** | Background job queries containers where `Quantity < LowStockThreshold` |
| **Missed dose check** | Background job queries dispense events where `Status = Pending/Dispensed` and `ScheduledAtUtc < threshold` |
| **Connection pooling** | EF Core connection pooling via PostgreSQL driver (Npgsql) |

---

## 11. Indexing Strategy

### 11.1 Existing Indexes

| Table | Index | Columns | Type | Purpose |
|:------|:------|:--------|:-----|:--------|
| Users | IX_Users_Email | Email | Unique | Login lookup |
| DeviceEventLogs | IX_DEL_DeviceId_Timestamp | DeviceId, EventTimestampUtc | Composite | Event queries |
| DeviceEventLogs | IX_DEL_ReceivedAt | ReceivedAtUtc | Single | Recent events |

### 11.2 Recommended Additional Indexes

| Table | Index | Columns | Type | Justification |
|:------|:------|:--------|:-----|:-------------|
| DispenseEvents | IX_DE_DeviceId_ScheduledAt | DeviceId, ScheduledAtUtc | Composite | History queries by device and date range |
| DispenseEvents | IX_DE_Status_ScheduledAt | Status, ScheduledAtUtc | Composite | Missed dose detection (background job) |
| DispenseEvents | IX_DE_ContainerId | ContainerId | Single | Adherence calculations per medication |
| Notifications | IX_Notif_UserId_IsRead | UserId, IsRead | Composite | Unread notification queries |
| Notifications | IX_Notif_CreatedAt | CreatedAtUtc | Single | Pagination |
| Devices | IX_Devices_UserId | UserId | Single | User's devices lookup |
| Devices | IX_Devices_IsOnline | IsOnline | Single | Fleet monitoring |
| Containers | IX_Containers_DeviceId | DeviceId | Single | Device's containers lookup |
| Schedules | IX_Schedules_ContainerId | ContainerId | Single | Container's schedules lookup |

### 11.3 Migration for New Indexes

```csharp
// Infrastructure/Migrations/XXXXXX_AddPerformanceIndexes.cs
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateIndex(
        name: "IX_DispenseEvents_DeviceId_ScheduledAtUtc",
        table: "DispenseEvents",
        columns: new[] { "DeviceId", "ScheduledAtUtc" });

    migrationBuilder.CreateIndex(
        name: "IX_DispenseEvents_Status_ScheduledAtUtc",
        table: "DispenseEvents",
        columns: new[] { "Status", "ScheduledAtUtc" });

    migrationBuilder.CreateIndex(
        name: "IX_Notifications_UserId_IsRead",
        table: "Notifications",
        columns: new[] { "UserId", "IsRead" });
}
```

---

## 12. Backup & Recovery Strategy

### 12.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage |
|:------------|:----------|:----------|:--------|
| **Full backup** | Daily at 02:00 UTC | 30 days | Azure Blob (Switzerland North) |
| **Incremental WAL** | Continuous | 7 days | Azure Blob |
| **Point-in-time** | Continuous (Azure managed) | 35 days | Azure managed |
| **Monthly archive** | 1st of month | 7 years | Azure Cool storage |

### 12.2 Recovery Time Objectives

| Scenario | RTO | RPO | Method |
|:---------|:----|:----|:-------|
| **Data corruption** | 1 hour | 5 minutes | Point-in-time restore |
| **Complete DB failure** | 2 hours | 5 minutes | Restore from backup |
| **Region failure** | 4 hours | 1 hour | Geo-redundant restore |
| **Accidental deletion** | 30 minutes | 0 (soft delete) | Soft delete recovery |

### 12.3 Backup Verification

```bash
# Weekly backup verification (automated)
1. Restore latest backup to test database
2. Run schema validation (compare table count, column count)
3. Run data integrity checks (FK constraints, count comparison)
4. Run sample queries (recent events, user lookup)
5. Delete test database
6. Log verification result
```

### 12.4 Soft Delete Pattern

Critical data uses soft delete before hard delete:
- User accounts: 30-day soft delete period
- Devices: Immediate soft delete, 90-day retention
- Dispense events: Never deleted (regulatory: 7-year retention)
- Audit logs: Immutable (never deleted)

---

## 13. Data Retention Policy

### 13.1 Retention Schedule

| Data Type | Active Retention | Archive Retention | Total | Regulatory Basis |
|:----------|:----------------|:-----------------|:------|:----------------|
| User accounts | Lifetime + 30 days after deletion | — | Lifetime + 30d | GDPR Art. 17 |
| Dispense events | 2 years | 5 years (cold storage) | 7 years | IEC 62304, ISO 13485 |
| Device event logs | 90 days | — | 90 days | Operational |
| Heartbeat data | 30 days | — | 30 days | Operational |
| Notifications | 1 year | — | 1 year | Operational |
| Audit logs | 7 years | — | 7 years (immutable) | GDPR, nDSG |
| Schedules | Active + 1 year | — | Active + 1 year | Operational |
| Backup files | 30 days (daily) | 7 years (monthly) | 7 years | Regulatory |

### 13.2 Automated Retention Enforcement

```csharp
// Infrastructure/Background/DataRetentionHostedService.cs
public class DataRetentionHostedService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            // Run daily at 03:00 UTC
            await PurgeDeviceEventLogs(olderThan: TimeSpan.FromDays(90), ct);
            await PurgeHeartbeatData(olderThan: TimeSpan.FromDays(30), ct);
            await ArchiveDispenseEvents(olderThan: TimeSpan.FromDays(730), ct);
            await PurgeNotifications(olderThan: TimeSpan.FromDays(365), ct);
            await PurgeSoftDeletedUsers(olderThan: TimeSpan.FromDays(30), ct);
            
            await Task.Delay(TimeSpan.FromHours(24), ct);
        }
    }
}
```

---

## 14. Database Monitoring

### 14.1 Key Metrics

| Metric | Warning Threshold | Critical Threshold | Query |
|:-------|:-----------------|:-------------------|:------|
| Active connections | > 80% max | > 95% max | `SELECT count(*) FROM pg_stat_activity` |
| Query duration (p95) | > 100ms | > 500ms | `pg_stat_statements` |
| Cache hit ratio | < 95% | < 90% | `pg_stat_user_tables` |
| Table bloat | > 20% | > 40% | Custom query |
| Replication lag | > 1s | > 10s | `pg_stat_replication` |
| Dead tuples ratio | > 10% | > 20% | `pg_stat_user_tables` |
| Disk usage growth | > 5% / week | > 10% / week | `pg_database_size()` |

### 14.2 Slow Query Logging

```sql
-- PostgreSQL configuration
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
ALTER SYSTEM SET log_statement = 'ddl';              -- Log all DDL
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
SELECT pg_reload_conf();
```

### 14.3 EF Core Query Logging

```csharp
// Infrastructure/DependencyInjection.cs (Development only)
services.AddDbContext<AppDbContext>(o => o
    .UseNpgsql(conn)
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableSensitiveDataLogging()  // DEV ONLY
    .EnableDetailedErrors());      // DEV ONLY
```
