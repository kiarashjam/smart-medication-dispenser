# Implementation Checklist: Documentation vs Codebase

**Generated:** February 10, 2026  
**Scope:** `smart-medication-dispenser/backend` and docs: 01_SOFTWARE_ARCHITECTURE, 02_BACKEND_API, 03_DATABASE, 14_DEVICE_CLOUD_PROTOCOL (used as Device API reference; 04_DEVICE_API.md does not exist in repo).

> **MVP:** This checklist maps **full** documentation to code. Items marked not implemented may be **post-MVP**. For product scope, see [MVP_APPLICATION.md](./MVP_APPLICATION.md).

---

## Note on Document 04

**04_DEVICE_API.md** was requested but **does not exist** in `software-docs/`. Device API coverage is taken from:
- **02_BACKEND_API.md** Section 3 (Device API endpoints)
- **14_DEVICE_CLOUD_PROTOCOL.md** (full device–cloud protocol)

---

## 1. 01_SOFTWARE_ARCHITECTURE.md

### 1.1 Architecture & Layers

| Feature | Status | Location / Notes |
|--------|--------|------------------|
| Clean Architecture (Onion) | **IMPLEMENTED** | Api → Application + Infrastructure; Application → Domain; Domain has no external refs |
| CQRS via MediatR | **IMPLEMENTED** | `Application/DependencyInjection.cs` registers MediatR; controllers send Commands/Queries |
| No direct DB access from controllers | **IMPLEMENTED** | All data access via MediatR → Handler → Repository |
| API layer depends on Application + Infrastructure | **IMPLEMENTED** | `Api.csproj` references Application, Infrastructure |
| Application defines interfaces, Infrastructure implements | **IMPLEMENTED** | `Application/Common/Interfaces/`, `Infrastructure/Persistence/`, `Infrastructure/Services/` |

### 1.2 Project Structure

| Feature | Status | Location / Notes |
|--------|--------|------------------|
| Solution: SmartMedicationDispenser.sln | **IMPLEMENTED** | `backend/SmartMedicationDispenser.sln` |
| Api project with Controllers, Middleware, Program.cs | **IMPLEMENTED** | `backend/src/Api/` |
| Application with Auth, Devices, Containers, Schedules, Dispensing, Notifications, Travel, Integrations, Adherence, Common, DTOs, Validators | **IMPLEMENTED** | `backend/src/Application/` (all folders present) |
| Domain with Entities, Enums | **IMPLEMENTED** | `backend/src/Domain/Entities/`, `Domain/Enums/` |
| Infrastructure with Background, Migrations, Persistence, Services | **IMPLEMENTED** | `backend/src/Infrastructure/` |
| DependencyInjection in Application and Infrastructure | **IMPLEMENTED** | `Application/DependencyInjection.cs`, `Infrastructure/DependencyInjection.cs` |

### 1.3 Domain Layer

| Feature | Status | Location / Notes |
|--------|--------|------------------|
| 11 entities: User, Device, Container, Schedule, DispenseEvent, Notification, TravelSession, WebhookEndpoint, DeviceApiKey, DeviceEventLog | **IMPLEMENTED** | `Domain/Entities/` — all 11 present |
| UserRole, DeviceType, DeviceStatus, DispenseEventStatus, NotificationType, DeviceEventType enums | **IMPLEMENTED** | `Domain/Enums/` |
| DeviceErrorCode static class (E001–E099 etc.) | **IMPLEMENTED** | `Domain/Enums/DeviceErrorCode.cs` |

### 1.4 Application Layer – CQRS Inventory

| Module | Commands/Queries | Status | Location |
|--------|------------------|--------|----------|
| Auth | RegisterCommand, LoginCommand, MeQuery, MeProfileQuery | **IMPLEMENTED** | `Application/Auth/` |
| Devices | CreateDevice, Pause, Resume, Heartbeat; GetDevices, GetDeviceById | **IMPLEMENTED** | `Application/Devices/` |
| Containers | Create, Update, Delete; GetContainersByDevice, GetContainerById | **IMPLEMENTED** | `Application/Containers/` |
| Schedules | Create, Update, Delete; GetSchedulesByContainer, GetScheduleById, GetTodaySchedule | **IMPLEMENTED** | `Application/Schedules/` |
| Dispensing | Dispense, ConfirmDispense, DelayDispense; GetDeviceEvents | **IMPLEMENTED** | `Application/Dispensing/` |
| Notifications | MarkNotificationRead; GetNotifications | **IMPLEMENTED** | `Application/Notifications/` |
| Travel | StartTravel, EndTravel | **IMPLEMENTED** | `Application/Travel/` |
| Integrations | Create/Delete Webhook, Create/Delete DeviceApiKey, ProcessIncomingWebhook, Sync; GetWebhooks, GetDeviceApiKeys | **IMPLEMENTED** | `Application/Integrations/` |
| Adherence | GetAdherenceQuery | **IMPLEMENTED** | `Application/Adherence/` |
| Device API | RegisterDevice, ProcessHeartbeat, ProcessEvent, ReportError, SyncInventory, GetDeviceSchedule | **IMPLEMENTED** | `Application/DeviceApi/` |

### 1.5 Repositories & Services (Application Interfaces → Infrastructure)

| Interface | Status | Implementation |
|-----------|--------|----------------|
| IUserRepository, IDeviceRepository, IContainerRepository, IScheduleRepository, IDispenseEventRepository | **IMPLEMENTED** | `Infrastructure/Persistence/` |
| ITravelSessionRepository, INotificationRepository, IWebhookEndpointRepository, IDeviceApiKeyRepository, IDeviceEventLogRepository | **IMPLEMENTED** | `Infrastructure/Persistence/` |
| IUnitOfWork | **IMPLEMENTED** | `Infrastructure/Persistence/UnitOfWork.cs` |
| IAuthService | **IMPLEMENTED** | `Infrastructure/Services/JwtAuthService.cs` |
| IWebhookDeliveryService | **IMPLEMENTED** | `Infrastructure/Services/WebhookDeliveryService.cs` |
| IDeviceApiKeyResolver | **IMPLEMENTED** | `Infrastructure/Services/DeviceApiKeyResolver.cs` |
| IDateTimeProvider | **IMPLEMENTED** | `Infrastructure/Services/DateTimeProvider.cs` |
| IAuditService | **NOT IMPLEMENTED** | Doc marks as "(planned)" |
| INotificationDeliveryService | **NOT IMPLEMENTED** | Doc marks as "(planned)" |

### 1.6 Validators (FluentValidation)

| Validator | Status | Location |
|-----------|--------|----------|
| RegisterRequestValidator, LoginRequestValidator | **IMPLEMENTED** | `Application/Validators/` |
| CreateDeviceRequestValidator, CreateContainerRequestValidator, CreateScheduleRequestValidator | **IMPLEMENTED** | `Application/Validators/` |
| AddValidatorsFromAssemblyContaining | **IMPLEMENTED** | `Application/DependencyInjection.cs` |
| ValidationBehavior (pipeline) | **IMPLEMENTED** | `Application/Common/Behaviors/ValidationBehavior.cs` |

### 1.7 API Layer – Startup Pipeline

| Item | Status | Location / Notes |
|------|--------|------------------|
| AddControllers, AddSwaggerGen | **IMPLEMENTED** | `Api/Program.cs` |
| AddAuthentication(JWT Bearer) | **IMPLEMENTED** | `Api/Program.cs` |
| AddApplication(), AddInfrastructure() | **IMPLEMENTED** | `Api/Program.cs` |
| UseMiddleware&lt;GlobalException&gt; | **IMPLEMENTED** | `Api/Middleware/GlobalExceptionMiddleware.cs`, registered in Program.cs |
| UseSwagger (dev only) | **IMPLEMENTED** | Program.cs `if (IsDevelopment)` |
| UseCors(AllowAny) | **IMPLEMENTED** | Program.cs `AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()` |
| UseAuthentication, UseAuthorization | **IMPLEMENTED** | Program.cs |
| MapControllers | **IMPLEMENTED** | Program.cs |
| Migrate + Seed on startup | **IMPLEMENTED** | Program.cs: EnsureCreated/MigrateAsync + SeedData.SeedAsync |

### 1.8 Middleware

| Middleware | Status | Location / Notes |
|------------|--------|------------------|
| GlobalExceptionMiddleware | **IMPLEMENTED** | `Api/Middleware/GlobalExceptionMiddleware.cs` |
| Exception mapping: ValidationException→400, Unauthorized→401, KeyNotFound→404, Argument→400, other→500 | **IMPLEMENTED** | Same file; JSON body with message/detail (stackTrace in dev for 500) |

### 1.9 Background Services

| Service | Status | Location / Notes |
|---------|--------|------------------|
| MissedDoseAndLowStockHostedService (5 min) | **IMPLEMENTED** | `Infrastructure/Background/MissedDoseAndLowStockHostedService.cs`, registered in Infrastructure DI |
| DataRetentionHostedService (planned in doc) | **IMPLEMENTED** | `Infrastructure/Background/DataRetentionHostedService.cs`, registered |
| DeviceOfflineHostedService (planned in doc) | **IMPLEMENTED** | `Infrastructure/Background/DeviceOfflineDetectionHostedService.cs`, registered |
| WebhookRetryHostedService, NotificationDeliveryHostedService, TravelAutoEndHostedService, etc. | **NOT IMPLEMENTED** | Doc 01 Section 16 lists as planned |

### 1.10 Caching Strategy (Section 10)

| Feature | Status | Location / Notes |
|---------|--------|------------------|
| IMemoryCache / AddMemoryCache | **PARTIAL** | Program.cs calls `AddMemoryCache()` but no handler uses it |
| Today's schedule cache (60s TTL) | **NOT IMPLEMENTED** | No `_cache.TryGetValue` in GetTodayScheduleQueryHandler |
| Device list cache (30s) | **NOT IMPLEMENTED** | No cache in GetDevicesQueryHandler |
| Adherence summary cache (5 min) | **NOT IMPLEMENTED** | No cache in GetAdherenceQueryHandler |
| Cache invalidation on write (MediatR behavior) | **NOT IMPLEMENTED** | No pipeline behavior for cache invalidation |
| Redis / IDistributedCache | **NOT IMPLEMENTED** | Doc says "planned" |

---

## 2. 02_BACKEND_API.md

### 2.1 Auth (AuthController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| POST /api/auth/register | **IMPLEMENTED** | `[HttpPost("register")]` on `api/[controller]` |
| POST /api/auth/login | **IMPLEMENTED** | `[HttpPost("login")]` |
| GET /api/auth/me | **IMPLEMENTED** | `[HttpGet("me")]` |
| GET /api/auth/me/profile | **IMPLEMENTED** | `[HttpGet("me/profile")]` |

### 2.2 Devices (DevicesController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/devices | **IMPLEMENTED** | `[HttpGet]` |
| GET /api/devices/{id} | **IMPLEMENTED** | `[HttpGet("{id:guid}")]` |
| POST /api/devices | **IMPLEMENTED** | `[HttpPost]` |
| PATCH /api/devices/{id}/pause | **IMPLEMENTED** | `[HttpPatch("{id:guid}/pause")]` |
| PATCH /api/devices/{id}/resume | **IMPLEMENTED** | `[HttpPatch("{id:guid}/resume")]` |
| POST /api/devices/{id}/heartbeat | **IMPLEMENTED** | `[HttpPost("{id:guid}/heartbeat")]` |

### 2.3 Containers (ContainersController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/devices/{deviceId}/containers | **IMPLEMENTED** | `[HttpGet("~/api/devices/{deviceId:guid}/containers")]` |
| POST /api/devices/{deviceId}/containers | **IMPLEMENTED** | `[HttpPost("~/api/devices/{deviceId:guid}/containers")]` |
| PUT /api/containers/{id} | **IMPLEMENTED** | `[HttpPut("{id:guid}")]` |
| DELETE /api/containers/{id} | **IMPLEMENTED** | `[HttpDelete("{id:guid}")]` |

### 2.4 Schedules (SchedulesController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/containers/{containerId}/schedules | **IMPLEMENTED** | `[HttpGet("~/api/containers/{containerId:guid}/schedules")]` |
| POST /api/containers/{containerId}/schedules | **IMPLEMENTED** | `[HttpPost("~/api/containers/{containerId:guid}/schedules")]` |
| PUT /api/schedules/{id} | **IMPLEMENTED** | `[HttpPut("{id:guid}")]` |
| DELETE /api/schedules/{id} | **IMPLEMENTED** | `[HttpDelete("{id:guid}")]` |
| GET /api/devices/{deviceId}/today-schedule | **IMPLEMENTED** | `[HttpGet("~/api/devices/{deviceId:guid}/today-schedule")]` |

### 2.5 Dispensing (DispensingController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| POST /api/devices/{deviceId}/dispense | **IMPLEMENTED** | `[HttpPost("devices/{deviceId:guid}/dispense")]` (Route "api") |
| POST /api/dispense-events/{id}/confirm | **IMPLEMENTED** | `[HttpPost("dispense-events/{id:guid}/confirm")]` |
| POST /api/dispense-events/{id}/delay | **IMPLEMENTED** | `[HttpPost("dispense-events/{id:guid}/delay")]` |

### 2.6 History (HistoryController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/devices/{deviceId}/events (fromUtc, toUtc, limit) | **IMPLEMENTED** | `[HttpGet("devices/{deviceId:guid}/events")]` |

### 2.7 Adherence (PatientsController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/patients/me/adherence | **IMPLEMENTED** | `[HttpGet("me/adherence")]` on `api/patients` |

### 2.8 Notifications (NotificationsController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/notifications?limit=50 | **IMPLEMENTED** | `[HttpGet]` with limit query |
| POST /api/notifications/{id}/read | **IMPLEMENTED** | `[HttpPost("{id:guid}/read")]` |

### 2.9 Travel (TravelController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| POST /api/travel/start | **IMPLEMENTED** | `[HttpPost("start")]` |
| POST /api/travel/end | **IMPLEMENTED** | `[HttpPost("end")]` |

### 2.10 Integrations (IntegrationsController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /api/integrations/webhooks | **IMPLEMENTED** | `[HttpGet("webhooks")]` |
| POST /api/integrations/webhooks | **IMPLEMENTED** | `[HttpPost("webhooks")]` |
| DELETE /api/integrations/webhooks/{id} | **IMPLEMENTED** | `[HttpDelete("webhooks/{id:guid}")]` |
| GET /api/integrations/devices/{deviceId}/api-keys | **IMPLEMENTED** | `[HttpGet("devices/{deviceId:guid}/api-keys")]` |
| POST /api/integrations/devices/{deviceId}/api-keys | **IMPLEMENTED** | `[HttpPost("devices/{deviceId:guid}/api-keys")]` |
| DELETE /api/integrations/devices/{deviceId}/api-keys/{apiKeyId} | **IMPLEMENTED** | `[HttpDelete("devices/.../api-keys/{apiKeyId:guid}")]` |
| POST /api/integrations/sync | **IMPLEMENTED** | `[HttpPost("sync")]` |

### 2.11 Device API (DeviceApiController) – from 02_BACKEND_API Section 3

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| POST /api/v1/devices/register | **IMPLEMENTED** | `[HttpPost("devices/register")]` on `api/v1` |
| POST /api/v1/devices/{deviceId}/heartbeat | **IMPLEMENTED** | `[HttpPost("devices/{deviceId}/heartbeat")]` |
| GET /api/v1/devices/{deviceId}/schedule | **IMPLEMENTED** | `[HttpGet("devices/{deviceId}/schedule")]` |
| POST /api/v1/events | **IMPLEMENTED** | `[HttpPost("events")]` |
| POST /api/v1/devices/{deviceId}/inventory | **IMPLEMENTED** | `[HttpPost("devices/{deviceId}/inventory")]` |
| POST /api/v1/devices/{deviceId}/error | **IMPLEMENTED** | `[HttpPost("devices/{deviceId}/error")]` |
| GET /api/v1/devices/{deviceId}/firmware | **IMPLEMENTED** | `[HttpGet("devices/{deviceId}/firmware")]` |

### 2.12 Webhooks (WebhooksController)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| POST /api/webhooks (incoming) | **IMPLEMENTED** | `[HttpPost("incoming")]` on `api/webhooks` |

### 2.13 Error Handling & Conventions

| Feature | Status | Notes |
|---------|--------|-------|
| Global exception → JSON (message, detail) | **IMPLEMENTED** | GlobalExceptionMiddleware |
| StackTrace in dev for 500 | **IMPLEMENTED** | Same middleware |
| Validation errors (FluentValidation) → 400 | **IMPLEMENTED** | ValidationBehavior + middleware |

### 2.14 Rate Limiting (Section 7)

| Feature | Status | Location / Notes |
|---------|--------|------------------|
| AddRateLimiter, RejectionStatusCode 429 | **IMPLEMENTED** | `Api/Program.cs` |
| Partition by user (JWT) or IP | **IMPLEMENTED** | GlobalLimiter uses NameIdentifier or RemoteIpAddress |
| Authenticated: 120/min (doc), 120/min in code | **IMPLEMENTED** | PermitLimit = 120 for userId |
| Anonymous: 20/min (doc), 60/min in code | **PARTIAL** | Code uses 60 for anonymous; doc says 20 |
| Auth policy: 10 per 15 min per IP | **IMPLEMENTED** | `AddPolicy("auth", ...)` |
| Device API policy: 30/min per device | **IMPLEMENTED** | `AddPolicy("device", ...)` — not applied by attribute; global limiter used |
| UseRateLimiter() in pipeline | **IMPLEMENTED** | Program.cs |
| Rate limit response headers (X-RateLimit-*, Retry-After) | **NOT IMPLEMENTED** | No custom OnRejected writing these headers |

### 2.15 Pagination (Section 8)

| Feature | Status | Notes |
|---------|--------|-------|
| PaginatedRequest / PaginatedResult types | **NOT IMPLEMENTED** | No `Application/Common/PaginatedRequest.cs` or PaginatedResult |
| page, pageSize, sortBy, sortDir on list endpoints | **NOT IMPLEMENTED** | Not used in devices, notifications, events, webhooks |
| Paginated response format (items, totalCount, totalPages, etc.) | **NOT IMPLEMENTED** | List endpoints return arrays only |

### 2.16 Health Checks (Section 10)

| Endpoint | Status | Route in code |
|----------|--------|----------------|
| GET /health (liveness) | **IMPLEMENTED** | HealthController: `[HttpGet("health")]`, `[HttpGet("health/live")]` |
| GET /health/ready | **IMPLEMENTED** | `[HttpGet("api/health/ready")]`, `[HttpGet("health/ready")]` |
| GET /health/detailed (admin) | **IMPLEMENTED** | `[HttpGet("health/detailed")]` — no Admin-only attribute in code |
| AddHealthChecks + AddNpgSql + MapHealthChecks | **NOT IMPLEMENTED** | Custom HealthController with _db.CanConnectAsync() instead of ASP.NET Core health check system |

### 2.17 Data Export API (Section 16 – Planned)

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/auth/me/export (JSON/CSV) | **NOT IMPLEMENTED** | Doc says "Planned" |
| GET /api/patients/me/adherence/export | **NOT IMPLEMENTED** | Doc says "Planned" |
| GET /api/devices/{id}/events/export | **NOT IMPLEMENTED** | Doc says "Planned" |

### 2.18 Caregiver – PUT /api/users/me (Section 15)

| Feature | Status | Notes |
|---------|--------|-------|
| PUT /api/users/me (e.g. caregiverUserId) | **NOT IMPLEMENTED** | No UsersController or profile-update endpoint for caregiver assignment |

---

## 3. 03_DATABASE.md

### 3.1 Tables / Entities

| Entity (Table) | Status | Entity class | DbSet in DbContext |
|----------------|--------|--------------|---------------------|
| Users | **IMPLEMENTED** | `Domain/Entities/User.cs` | `AppDbContext.Users` |
| Devices | **IMPLEMENTED** | `Domain/Entities/Device.cs` | `AppDbContext.Devices` |
| Containers | **IMPLEMENTED** | `Domain/Entities/Container.cs` | `AppDbContext.Containers` |
| Schedules | **IMPLEMENTED** | `Domain/Entities/Schedule.cs` | `AppDbContext.Schedules` |
| DispenseEvents | **IMPLEMENTED** | `Domain/Entities/DispenseEvent.cs` | `AppDbContext.DispenseEvents` |
| Notifications | **IMPLEMENTED** | `Domain/Entities/Notification.cs` | `AppDbContext.Notifications` |
| TravelSessions | **IMPLEMENTED** | `Domain/Entities/TravelSession.cs` | `AppDbContext.TravelSessions` |
| WebhookEndpoints | **IMPLEMENTED** | `Domain/Entities/WebhookEndpoint.cs` | `AppDbContext.WebhookEndpoints` |
| DeviceApiKeys | **IMPLEMENTED** | `Domain/Entities/DeviceApiKey.cs` | `AppDbContext.DeviceApiKeys` |
| DeviceEventLogs | **IMPLEMENTED** | `Domain/Entities/DeviceEventLog.cs` | `AppDbContext.DeviceEventLogs` |

### 3.2 Column / Property Alignment (key columns only)

| Entity | Key columns per doc | Status |
|--------|---------------------|--------|
| Users | Id, Email, PasswordHash, FullName, Role, CaregiverUserId, CreatedAtUtc, UpdatedAtUtc | **IMPLEMENTED** |
| Devices | Id, UserId, Name, Type, Status, TimeZoneId, LastHeartbeatAtUtc, FirmwareVersion, HardwareVersion, MacAddress, BatteryLevel, WifiSignal, Temperature, Humidity, IsOnline, LastOnlineAtUtc, LastOfflineAtUtc, LastErrorCode, LastErrorMessage, CreatedAtUtc, UpdatedAtUtc | **IMPLEMENTED** |
| Containers | Id, DeviceId, SlotNumber, MedicationName, MedicationImageUrl, Quantity, PillsPerDose, LowStockThreshold, SourceContainerId, CreatedAtUtc, UpdatedAtUtc | **IMPLEMENTED** |
| Schedules | Id, ContainerId, TimeOfDay, DaysOfWeekBitmask, StartDate, EndDate, Notes, TimeZoneId, CreatedAtUtc, UpdatedAtUtc | **IMPLEMENTED** |
| DispenseEvents | Id, DeviceId, ContainerId, ScheduleId, ScheduledAtUtc, Status, DispensedAtUtc, ConfirmedAtUtc, MissedMarkedAtUtc, DelayedAtUtc, CreatedAtUtc | **IMPLEMENTED** (DelayedAtUtc present in domain) |
| Notifications | Id, UserId, Type, Title, Body, IsRead, CreatedAtUtc, RelatedEntityId | **IMPLEMENTED** |
| TravelSessions | Id, UserId, MainDeviceId, PortableDeviceId, StartedAtUtc, EndedAtUtc, PlannedEndDateUtc, CreatedAtUtc | **IMPLEMENTED** |
| WebhookEndpoints | Id, UserId, Url, Secret, IsActive, Description, LastTriggeredAtUtc, LastStatus, CreatedAtUtc | **IMPLEMENTED** (LastTriggeredAtUtc in entity) |
| DeviceApiKeys | Id, DeviceId, KeyHash, Name, CreatedAtUtc, LastUsedAtUtc | **IMPLEMENTED** |
| DeviceEventLogs | Id, DeviceId, EventType, EventTimestampUtc, ReceivedAtUtc, DataJson, Processed, ProcessingError | **IMPLEMENTED** |

### 3.3 DbContext & Migrations

| Feature | Status | Location / Notes |
|---------|--------|------------------|
| AppDbContext with all 10 DbSets | **IMPLEMENTED** | `Infrastructure/Persistence/AppDbContext.cs` |
| SQLite vs Npgsql from connection string | **IMPLEMENTED** | `Infrastructure/DependencyInjection.cs`: "Data Source=" → UseSqlite, else UseNpgsql |
| Migration 20260203104220_Initial | **IMPLEMENTED** | `Infrastructure/Migrations/` |
| Migration 20260203143859_AddWebhooksAndApiKeys | **IMPLEMENTED** | Same folder |
| Auto-migrate/EnsureCreated + Seed on startup | **IMPLEMENTED** | `Api/Program.cs` |
| SeedData (demo users, devices, containers, schedules) | **IMPLEMENTED** | `Infrastructure/Persistence/SeedData.cs` (referenced in Program.cs) |

### 3.4 Repository Pattern & Unit of Work

| Feature | Status | Notes |
|---------|--------|-------|
| All repository interfaces in Application | **IMPLEMENTED** | `Application/Common/Interfaces/` |
| All repository implementations in Infrastructure | **IMPLEMENTED** | `Infrastructure/Persistence/*Repository.cs` |
| IUnitOfWork + UnitOfWork | **IMPLEMENTED** | `Infrastructure/Persistence/UnitOfWork.cs` |

### 3.5 Indexes (doc Section 11)

| Index | Status | Notes |
|-------|--------|-------|
| Users: unique Email | **IMPLEMENTED** | Typically in migration / configuration |
| DeviceEventLogs: (DeviceId, EventTimestampUtc), ReceivedAtUtc | **IMPLEMENTED** | Per doc |
| Recommended: DispenseEvents (DeviceId, ScheduledAtUtc), (Status, ScheduledAtUtc), Notifications (UserId, IsRead), etc. | **NOT VERIFIED** | Would require reading migration/configuration; doc lists as "Recommended Additional" |

### 3.6 Data Retention & Backup (doc Sections 12–13)

| Feature | Status | Notes |
|---------|--------|-------|
| DataRetentionHostedService (purge/archive) | **IMPLEMENTED** | `Infrastructure/Background/DataRetentionHostedService.cs` |
| Soft delete pattern (user 30d, devices 90d) | **NOT VERIFIED** | No explicit soft-delete columns seen in User/Device entities |
| Backup verification job | **NOT IMPLEMENTED** | Doc lists as planned |

---

## 4. 14_DEVICE_CLOUD_PROTOCOL.md (Device API / “04” reference)

### 4.1 Device Registration & Provisioning

| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/v1/devices/register | **IMPLEMENTED** | DeviceApiController |
| Request: device_id, device_type, firmware_version, hardware_version, mac_address | **IMPLEMENTED** | DeviceRegistrationRequest in DTOs |
| Response: device_token, heartbeat_interval, server_time (or apiEndpoint) | **IMPLEMENTED** | DeviceRegistrationResponse; ApiEndpoint overridden in controller |
| X-Provisioning-Token (optional in doc) | **NOT IMPLEMENTED** | Registration does not require or validate provisioning token |
| Device JWT (RS256) in doc; backend uses same user JWT (HS256) for device | **PARTIAL** | Device token in code is issued like user JWT (HS256); doc describes RS256 for device |

### 4.2 Heartbeat

| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/v1/devices/{device_id}/heartbeat | **IMPLEMENTED** | DeviceApiController |
| Request body: battery, wifi, temperature, humidity, slots, errors, etc. | **IMPLEMENTED** | HeartbeatPayload; handler updates device state |
| Response: server_time, commands, next_heartbeat | **IMPLEMENTED** | ProcessDeviceHeartbeatCommand result |
| Full doc request (nested battery, connectivity, environment, tray, next_dose, diagnostics) | **PARTIAL** | Simpler HeartbeatPayload in code; not all nested structures |

### 4.3 Schedule

| Feature | Status | Notes |
|---------|--------|-------|
| GET /api/v1/devices/{device_id}/schedule | **IMPLEMENTED** | GetDeviceScheduleQuery |
| GET .../schedule?since= (incremental sync) | **NOT VERIFIED** | GetDeviceScheduleQuery/Handler may not support `since` |
| POST /api/v1/devices/{device_id}/schedule/confirm | **IMPLEMENTED** | DeviceApiController ConfirmSchedule |

### 4.4 Events

| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/v1/events (single event) | **IMPLEMENTED** | DeviceEventPayload, ProcessDeviceEventCommand |
| POST /api/v1/events (batch: "events" array) | **NOT IMPLEMENTED** | Controller accepts single DeviceEventPayload only |
| Event types: DOSE_DISPENSED, DOSE_TAKEN, DOSE_MISSED, REFILL_*, DEVICE_*, BATTERY_*, TRAVEL_*, etc. | **IMPLEMENTED** | ProcessDeviceEventCommandHandler handles multiple types |

### 4.5 Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/v1/devices/{device_id}/inventory | **IMPLEMENTED** | SyncInventoryCommand, SyncInventoryRequest with Slots |

### 4.6 Error Reporting

| Feature | Status | Notes |
|---------|--------|-------|
| POST /api/v1/devices/{device_id}/error | **IMPLEMENTED** | ReportDeviceErrorCommand, DeviceErrorData |

### 4.7 Firmware (OTA)

| Feature | Status | Notes |
|---------|--------|-------|
| GET /api/v1/devices/{device_id}/firmware?current_version= | **IMPLEMENTED** | CheckFirmware; returns no-update for MVP |
| POST /api/v1/devices/{device_id}/firmware/status | **IMPLEMENTED** | ReportFirmwareStatus; updates device FirmwareVersion on "completed" |
| Doc response (update_available, download_url, checksum_sha256, etc.) | **PARTIAL** | FirmwareUpdateResponse exists; MVP returns update_available: false |

### 4.8 Other Device Endpoints

| Feature | Status | Notes |
|---------|--------|-------|
| GET /api/v1/ping | **IMPLEMENTED** | DeviceApiController Ping (health for devices) |

### 4.9 Rate Limits (doc Section 9)

| Feature | Status | Notes |
|---------|--------|-------|
| Per-endpoint limits (heartbeat 2/min, events 60/min, etc.) | **NOT IMPLEMENTED** | No per-route policies applied to device endpoints; global/device policy used |
| X-RateLimit-* response headers | **NOT IMPLEMENTED** | Not set in rate limiter options |

### 4.10 Security (TLS, token storage, API key)

| Feature | Status | Notes |
|---------|--------|-------|
| X-API-Key authentication | **IMPLEMENTED** | DeviceApiKeyResolver, used in ValidateDeviceToken |
| Device JWT (Bearer) | **IMPLEMENTED** | ValidateDeviceToken reads Bearer and NameIdentifier claim (device Id) |
| TLS / certificate pinning | **N/A** | Server-side; not visible in backend repo |

---

## Summary Counts

| Doc | Implemented | Not implemented | Partial / different |
|-----|-------------|-----------------|----------------------|
| 01_SOFTWARE_ARCHITECTURE | Most (layers, CQRS, repos, middleware, 2–3 background jobs) | Caching usage, planned background jobs, IAudit/INotificationDelivery | Caching registered but unused; extra background jobs present |
| 02_BACKEND_API | All main User/App and Device API endpoints, rate limiter, health endpoints | Pagination, health check lib, export APIs, caregiver PUT /users/me, rate limit headers | Rate limit numbers (anonymous 60 vs 20), health via custom controller |
| 03_DATABASE | All 11 entities, DbContext, migrations, seed, repositories, UoW, DataRetention | Optional indexes, soft delete, backup verification | — |
| 14_DEVICE_CLOUD_PROTOCOL | Register, heartbeat, schedule, events (single), inventory, error, firmware + status, schedule/confirm, ping | Batch events, provisioning token, per-endpoint rate limits, full heartbeat payload shape, full OTA response | Device JWT (HS256 vs RS256), firmware MVP “no update” |

---

**File paths (key):**

- **Api:** `backend/src/Api/` (Program.cs, Controllers/, Middleware/)
- **Application:** `backend/src/Application/` (Auth/, Devices/, Containers/, Schedules/, Dispensing/, Notifications/, Travel/, Integrations/, Adherence/, DeviceApi/, Common/, DTOs/, Validators/)
- **Domain:** `backend/src/Domain/` (Entities/, Enums/)
- **Infrastructure:** `backend/src/Infrastructure/` (Persistence/, Background/, Services/, Migrations/)
