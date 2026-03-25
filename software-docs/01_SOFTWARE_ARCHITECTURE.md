# Software Architecture

**Smart Medication Dispenser — Clean Architecture & CQRS Reference**

**Version 2.1 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.1 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | All Engineers |
| **Related Documents** | [02_BACKEND_API.md](./02_BACKEND_API.md), [03_DATABASE.md](./03_DATABASE.md), [04_CLOUD_DEPLOYMENT.md](./04_CLOUD_DEPLOYMENT.md), [05_WEB_PORTAL.md](./05_WEB_PORTAL.md), [06_MOBILE_APP.md](./06_MOBILE_APP.md), [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) |

---

## 1. Architecture Overview

The backend follows **Clean Architecture** (also known as Onion Architecture) with the **CQRS** (Command Query Responsibility Segregation) pattern implemented via **MediatR**. This ensures:

- **Separation of concerns** — each layer has a single responsibility
- **Testability** — business logic is isolated from infrastructure
- **Maintainability** — changes in one layer don't cascade through others
- **Flexibility** — database, UI, and external services can be swapped independently

### 1.1 Layer Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPENDENCY DIRECTION                         │
│                     (outer depends on inner)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  API Layer (Presentation)                                │   │
│   │  Controllers • Middleware • Program.cs                   │   │
│   │  Depends on: Application, Infrastructure                 │   │
│   │                                                          │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │  Infrastructure Layer                            │   │   │
│   │   │  EF Core • Repositories • JWT • Background Jobs │   │   │
│   │   │  Depends on: Application, Domain                 │   │   │
│   │   │                                                  │   │   │
│   │   │   ┌─────────────────────────────────────────┐   │   │   │
│   │   │   │  Application Layer                       │   │   │   │
│   │   │   │  Commands • Queries • Handlers • DTOs    │   │   │   │
│   │   │   │  Depends on: Domain                      │   │   │   │
│   │   │   │                                          │   │   │   │
│   │   │   │   ┌─────────────────────────────────┐   │   │   │   │
│   │   │   │   │  Domain Layer (Core)             │   │   │   │   │
│   │   │   │   │  Entities • Enums                │   │   │   │   │
│   │   │   │   │  NO external dependencies        │   │   │   │   │
│   │   │   │   └─────────────────────────────────┘   │   │   │   │
│   │   │   │                                          │   │   │   │
│   │   │   └─────────────────────────────────────────┘   │   │   │
│   │   │                                                  │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Rules

| Rule | Description |
|:-----|:------------|
| **Domain has no dependencies** | Entities and enums depend on nothing external |
| **Application defines interfaces** | Repository interfaces live in Application, implementations in Infrastructure |
| **Infrastructure implements** | EF Core, JWT, webhooks, background jobs |
| **API orchestrates** | Configures DI container, middleware pipeline, routes requests to MediatR |
| **No direct DB access from controllers** | All data access goes through MediatR → Handler → Repository |

---

## 2. Project Structure

### 2.1 Solution Layout

```
backend/
├── SmartMedicationDispenser.sln          # Visual Studio solution
└── src/
    ├── Api/                               # ASP.NET Core Web API
    │   ├── Api.csproj                     # References: Application, Infrastructure
    │   ├── Program.cs                     # Application bootstrap & DI configuration
    │   ├── Dockerfile                     # Container image definition
    │   ├── appsettings.json               # Configuration (DB, JWT)
    │   ├── appsettings.Development.json   # Dev overrides
    │   ├── Controllers/                   # 13 REST API controllers
    │   ├── Middleware/                     # Global exception handler
    │   └── Properties/
    │       └── launchSettings.json        # Dev server settings
    │
    ├── Application/                       # Business logic (CQRS)
    │   ├── Application.csproj             # References: Domain
    │   ├── DependencyInjection.cs         # MediatR + FluentValidation registration
    │   ├── Auth/                          # Register, Login, Me commands/queries
    │   ├── Devices/                       # Device CRUD + heartbeat
    │   ├── Containers/                    # Container CRUD
    │   ├── Schedules/                     # Schedule CRUD + today's schedule
    │   ├── Dispensing/                    # Dispense, confirm, delay
    │   ├── Notifications/                 # Notification list + mark read
    │   ├── Travel/                        # Start/end travel session
    │   ├── Integrations/                  # Webhooks, API keys, sync
    │   ├── Adherence/                     # Adherence statistics
    │   ├── Common/                        # Shared interfaces (repositories, services)
    │   ├── DTOs/                          # Data Transfer Objects
    │   └── Validators/                    # FluentValidation request validators
    │
    ├── Domain/                            # Core domain model
    │   ├── Domain.csproj                  # No project references
    │   ├── Entities/                      # 11 entity classes
    │   └── Enums/                         # 6 enums + 1 static constants class
    │
    └── Infrastructure/                    # External concerns
        ├── Infrastructure.csproj          # References: Application, Domain
        ├── DependencyInjection.cs         # Repository + service registration
        ├── Background/                    # Hosted services (missed dose checker)
        ├── Migrations/                    # EF Core migrations
        ├── Persistence/                   # DbContext, repositories, seed data
        └── Services/                      # JWT auth, webhook delivery, etc.
```

### 2.2 Project References

```
Api.csproj
 ├── Application.csproj
 │    └── Domain.csproj
 └── Infrastructure.csproj
      ├── Application.csproj
      │    └── Domain.csproj
      └── Domain.csproj
```

### 2.3 NuGet Package Versions

| Package | Version | Project | Purpose |
|:--------|:--------|:--------|:--------|
| **Microsoft.EntityFrameworkCore** | 8.0.10 | Api, Infrastructure | ORM framework |
| **Microsoft.EntityFrameworkCore.Design** | 8.0.10 | Api, Infrastructure | EF CLI tooling |
| **Microsoft.EntityFrameworkCore.Sqlite** | 8.0.10 | Infrastructure | SQLite provider (dev) |
| **Npgsql.EntityFrameworkCore.PostgreSQL** | 8.0.10 | Infrastructure | PostgreSQL provider (prod) |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | 8.0.10 | Infrastructure | JWT auth middleware |
| **BCrypt.Net-Next** | 4.0.3 | Infrastructure | Password hashing |
| **MediatR** | 12.2.0 | Api, Application | CQRS mediator |
| **FluentValidation** | 11.9.0 | Api, Application | Request validation |
| **FluentValidation.DependencyInjectionExtensions** | 11.9.0 | Application | Auto-register validators |
| **Swashbuckle.AspNetCore** | 6.6.2 | Api | Swagger/OpenAPI |
| **Microsoft.AspNetCore.OpenApi** | 8.0.10 | Api | OpenAPI metadata |

---

## 3. Domain Layer

The Domain layer is the **innermost** layer with **zero external dependencies**. It contains only pure C# classes and enums.

### 3.1 Entities (11 total)

| Entity | Description | Key Properties |
|:-------|:------------|:---------------|
| **User** | Application user | Id, Email, PasswordHash, FullName, Role, CaregiverUserId |
| **Device** | Physical dispenser | Id, UserId, Name, Type, Status, LastHeartbeatAtUtc, BatteryLevel |
| **Container** | Medication slot | Id, DeviceId, SlotNumber, MedicationName, Quantity, PillsPerDose |
| **Schedule** | Recurring dose time | Id, ContainerId, TimeOfDay, DaysOfWeekBitmask, StartDate, EndDate |
| **DispenseEvent** | Dose lifecycle | Id, DeviceId, ContainerId, ScheduleId, Status, ScheduledAtUtc |
| **Notification** | In-app alert | Id, UserId, Type, Title, Body, IsRead |
| **TravelSession** | Travel mode link | Id, UserId, MainDeviceId, PortableDeviceId, PlannedEndDateUtc |
| **WebhookEndpoint** | Outgoing webhook | Id, UserId, Url, Secret, IsActive |
| **DeviceApiKey** | Machine auth key | Id, DeviceId, KeyHash, Name |
| **DeviceEventLog** | Raw device telemetry | Id, DeviceId, EventType, DataJson, Processed |

### 3.2 Enums & Constants (6 enums + 1 static class)

| Type | Kind | Values | Usage |
|:-----|:-----|:-------|:------|
| **UserRole** | Enum | Patient (0), Caregiver (1), Admin (2) | User access level |
| **DeviceType** | Enum | Main (0), Portable (1) | SMD-100 vs SMD-200 |
| **DeviceStatus** | Enum | Active (0), Paused (1) | Dispensing state |
| **DispenseEventStatus** | Enum | Pending (0), Dispensed (1), Confirmed (2), Missed (3), Delayed (4) | Dose lifecycle |
| **NotificationType** | Enum | MissedDose, LowStock, TravelStarted, TravelEnded, General, DoseDispensed, DoseTaken, RefillCritical, DeviceOnline, DeviceOffline, DeviceError, DeviceStatus, BatteryLow, BatteryCritical | Notification category |
| **DeviceEventType** | Enum | DoseDispensed, DoseTaken, DoseMissed, RefillNeeded, RefillCritical, DeviceOnline, DeviceOffline, DeviceError, BatteryLow, BatteryCritical, TravelModeOn, TravelModeOff, Heartbeat | Device telemetry |
| **DeviceErrorCode** | Static class | E001-E099 (Network), E101-E199 (Hardware), E201-E299 (Power), E301-E399 (Storage) | Error code constants (not an enum — uses string constants like `"E101"`) |

### 3.3 Entity Relationships

```
User ──┬── 1:N ──▶ Device ──┬── 1:N ──▶ Container ──┬── 1:N ──▶ Schedule
       │                     │                        │            │
       │                     │                        │            └── 1:N ──▶ DispenseEvent
       │                     │                        │
       │                     │                        └── 1:N ──▶ DispenseEvent
       │                     │
       │                     ├── 1:N ──▶ DispenseEvent
       │                     │
       │                     ├── 1:N ──▶ DeviceApiKey
       │                     │
       │                     └── 1:N ──▶ DeviceEventLog
       │
       ├── 1:N ──▶ Notification
       │
       ├── 1:N ──▶ WebhookEndpoint
       │
       └── Self-referential (CaregiverUserId → User)
              Caregiver ── 1:N ──▶ Patients

TravelSession links:
  User ──▶ TravelSession ◀── MainDevice
                          ◀── PortableDevice

Container self-referential:
  SourceContainer ── 1:N ──▶ PortableCopies
```

---

## 4. Application Layer

The Application layer contains all **business logic** organized as CQRS commands and queries dispatched via MediatR.

### 4.1 CQRS Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                      CQRS FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Controller                                                      │
│     │                                                            │
│     ▼                                                            │
│  MediatR.Send(Command/Query)                                     │
│     │                                                            │
│     ├──▶ Command → CommandHandler → Repository → DB (write)      │
│     │       Returns: DTO or void                                 │
│     │                                                            │
│     └──▶ Query → QueryHandler → Repository → DB (read)          │
│             Returns: DTO or list of DTOs                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Command/Query Inventory

| Module | Commands | Queries | Total Handlers |
|:-------|:---------|:--------|:---------------|
| **Auth** | RegisterCommand, LoginCommand | MeQuery, MeProfileQuery | 4 |
| **Devices** | CreateDeviceCommand, PauseDeviceCommand, ResumeDeviceCommand, HeartbeatCommand | GetDevicesQuery, GetDeviceByIdQuery | 6 |
| **Containers** | CreateContainerCommand, UpdateContainerCommand, DeleteContainerCommand | GetContainersByDeviceQuery | 4 |
| **Schedules** | CreateScheduleCommand, UpdateScheduleCommand, DeleteScheduleCommand | GetSchedulesByContainerQuery, GetTodayScheduleQuery | 5 |
| **Dispensing** | DispenseCommand, ConfirmDispenseCommand, DelayDispenseCommand | GetDeviceEventsQuery | 4 |
| **Notifications** | MarkNotificationReadCommand | GetNotificationsQuery | 2 |
| **Travel** | StartTravelCommand, EndTravelCommand | — | 2 |
| **Integrations** | CreateWebhookEndpointCommand, DeleteWebhookEndpointCommand, CreateDeviceApiKeyCommand, DeleteDeviceApiKeyCommand, ProcessIncomingWebhookCommand, SyncFromCloudCommand | GetWebhookEndpointsQuery, GetDeviceApiKeysQuery | 8 |
| **Adherence** | — | GetAdherenceQuery | 1 |
| **Total** | **18 Commands** | **10 Queries** | **36 Handlers** |

### 4.3 Dependency Injection Registration

```csharp
// Application/DependencyInjection.cs
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    // Auto-register all MediatR handlers from this assembly
    services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
    
    // Auto-register all FluentValidation validators
    services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
    
    return services;
}
```

### 4.4 Common Interfaces

The Application layer defines **interfaces** for all external dependencies. These are implemented in the Infrastructure layer:

| Interface | Purpose | Implementation |
|:----------|:--------|:---------------|
| `IUserRepository` | User CRUD + caregiver lookup | `UserRepository` |
| `IDeviceRepository` | Device CRUD + heartbeat + online status | `DeviceRepository` |
| `IContainerRepository` | Container CRUD + low stock check | `ContainerRepository` |
| `IScheduleRepository` | Schedule CRUD + today's schedule | `ScheduleRepository` |
| `IDispenseEventRepository` | Dispense event lifecycle + history queries | `DispenseEventRepository` |
| `ITravelSessionRepository` | Travel session management + active check | `TravelSessionRepository` |
| `INotificationRepository` | Notification CRUD + unread count | `NotificationRepository` |
| `IWebhookEndpointRepository` | Webhook endpoint CRUD + delivery status | `WebhookEndpointRepository` |
| `IDeviceApiKeyRepository` | API key management + hash lookup | `DeviceApiKeyRepository` |
| `IDeviceEventLogRepository` | Raw device telemetry storage + queries | `DeviceEventLogRepository` |
| `IUnitOfWork` | Transaction management | `UnitOfWork` |
| `IAuthService` | JWT generation + password hashing | `JwtAuthService` |
| `IWebhookDeliveryService` | HTTP POST to webhook URLs + HMAC signing | `WebhookDeliveryService` |
| `IDeviceApiKeyResolver` | Resolve device from X-API-Key header | `DeviceApiKeyResolver` |
| `IDateTimeProvider` | Mockable UTC clock for testing | `DateTimeProvider` |
| `IAuditService` | Audit trail logging (planned) | `AuditService` |
| `INotificationDeliveryService` | Push/email notification delivery (planned) | `NotificationDeliveryService` |

### 4.5 Validators

FluentValidation validators ensure request data integrity before handlers execute:

| Validator | Rules |
|:----------|:------|
| `RegisterRequestValidator` | Email required & valid format, password min length, fullName required, role valid |
| `LoginRequestValidator` | Email required, password required |
| `CreateDeviceRequestValidator` | Name required & max length, type valid (Main/Portable) |
| `CreateContainerRequestValidator` | SlotNumber > 0, MedicationName required, Quantity ≥ 0, PillsPerDose > 0 |
| `CreateScheduleRequestValidator` | TimeOfDay valid, DaysOfWeekBitmask 1-127, StartDate required |

### 4.6 DTOs (Data Transfer Objects)

DTOs are defined in `Application/DTOs/` and serve as the **API contract** between frontend and backend:

| DTO File | Types Defined |
|:---------|:-------------|
| `AuthDtos.cs` | RegisterRequest, LoginRequest, AuthResponse, MeResponse, MeProfileResponse, UserDeviceSummaryDto |
| `DeviceDtos.cs` | DeviceDto, DeviceDetailDto, ContainerSlotDto, CreateDeviceRequest, UpdateDeviceRequest, DeviceHealthDto |
| `ContainerDtos.cs` | CreateContainerRequest, UpdateContainerRequest, ContainerDto |
| `ScheduleDtos.cs` | CreateScheduleRequest, UpdateScheduleRequest, ScheduleDto, TodayScheduleItemDto |
| `DispenseDtos.cs` | DispenseRequest, ConfirmDispenseRequest, DelayDispenseRequest, DispenseEventDto |
| `NotificationDtos.cs` | NotificationDto |
| `AdherenceDtos.cs` | AdherenceSummaryDto |
| `TravelDtos.cs` | StartTravelRequest, TravelSessionDto |
| `WebhookDtos.cs` | CreateWebhookEndpointRequest, UpdateWebhookEndpointRequest, WebhookEndpointDto, IncomingWebhookPayload, SyncRequest, SyncDeviceStatus, SyncDispenseEventDto, SyncContainerDto |
| `DeviceApiKeyDtos.cs` | DeviceApiKeyDto |
| `DeviceEventDtos.cs` | DeviceEventPayload, DoseDispensedData, DoseTakenData, DoseMissedData, RefillNeededData, DeviceOnlineData, DeviceOfflineData, DeviceErrorData, BatteryLowData, TravelModeOnData, TravelModeOffData, HeartbeatPayload, HeartbeatSlot, DeviceRegistrationRequest/Response, ScheduleItem, DeviceScheduleResponse, FirmwareUpdateResponse |

---

## 5. Infrastructure Layer

The Infrastructure layer implements all external concerns: database access, authentication, background jobs, and webhook delivery.

### 5.1 Dependency Injection Registration

```csharp
// Infrastructure/DependencyInjection.cs
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
{
    // Database: auto-detect PostgreSQL vs SQLite from connection string
    var conn = configuration.GetConnectionString("DefaultConnection");
    if (conn.StartsWith("Data Source="))
        services.AddDbContext<AppDbContext>(o => o.UseSqlite(conn));
    else
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(conn));
    
    // Repositories
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IDeviceRepository, DeviceRepository>();
    // ... (9 repository registrations)
    
    // Services
    services.AddScoped<IAuthService, JwtAuthService>();
    services.AddScoped<IWebhookDeliveryService, WebhookDeliveryService>();
    services.AddScoped<IDeviceApiKeyResolver, DeviceApiKeyResolver>();
    services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
    
    // Background jobs
    services.AddHostedService<MissedDoseAndLowStockHostedService>();
    
    return services;
}
```

### 5.2 Background Services

| Service | Interval | Purpose |
|:--------|:---------|:--------|
| `MissedDoseAndLowStockHostedService` | Every 5 minutes | Marks overdue dispense events as Missed (60 min threshold), creates LowStock notifications, sends webhooks to patient and caregiver |

### 5.3 External Service Implementations

| Service | Description |
|:--------|:------------|
| `JwtAuthService` | Generates HS256 JWT tokens (7-day expiry), hashes passwords with BCrypt |
| `WebhookDeliveryService` | POSTs JSON payloads to webhook URLs with optional HMAC-SHA256 signature |
| `DeviceApiKeyResolver` | Resolves device ID from X-API-Key header by SHA256 hash lookup |
| `DateTimeProvider` | Wraps `DateTime.UtcNow` for testability |

---

## 6. API Layer (Presentation)

The API layer is the entry point. It configures the ASP.NET Core pipeline and routes HTTP requests to MediatR handlers.

### 6.1 Startup Pipeline (Program.cs)

```
1. AddControllers()              — Register MVC controllers
2. AddSwaggerGen()               — OpenAPI documentation
3. AddAuthentication(JWT Bearer) — Validate JWT tokens
4. AddApplication()              — MediatR + FluentValidation
5. AddInfrastructure()           — EF Core, repositories, services
6. UseMiddleware<GlobalException> — Catch unhandled exceptions → JSON
7. UseSwagger() (dev only)       — Swagger UI
8. UseCors(AllowAny)             — Cross-origin requests (MVP)
9. UseAuthentication()           — JWT validation middleware
10. UseAuthorization()           — Role-based access
11. MapControllers()             — Route to controllers
12. Migrate + Seed               — Auto-apply migrations and seed data
```

### 6.2 Controller Summary (13 Controllers)

| Controller | Route | Auth | Endpoints |
|:-----------|:------|:-----|:----------|
| `AuthController` | `/api/auth` | None / JWT | Register, Login, Me, Me/Profile |
| `DevicesController` | `/api/devices` | JWT | List, Get, Create, Pause, Resume, Heartbeat |
| `ContainersController` | `/api/containers` | JWT | List by device, Create, Update, Delete |
| `SchedulesController` | `/api/schedules` | JWT | List by container, Create, Update, Delete, Today |
| `DispensingController` | `/api` | JWT | Dispense, Confirm, Delay |
| `HistoryController` | `/api` | JWT | Get device events (date filter) |
| `PatientsController` | `/api/patients` | JWT | Adherence summary |
| `NotificationsController` | `/api/notifications` | JWT | List, Mark as read |
| `TravelController` | `/api/travel` | JWT | Start, End |
| `IntegrationsController` | `/api/integrations` | JWT / X-API-Key | Webhooks CRUD, API keys CRUD, Sync |
| `DeviceApiController` | `/api/v1` | Device Token / X-API-Key | Register, Heartbeat, Schedule, Events, Inventory, Error, Firmware |
| `WebhooksController` | `/api/webhooks` | X-API-Key | Incoming webhook |
| `HealthController` | `/api/health` | None / JWT | Health check, detailed (admin) |

### 6.3 Middleware

| Middleware | Purpose |
|:-----------|:--------|
| `GlobalExceptionMiddleware` | Catches all unhandled exceptions; maps to appropriate HTTP status codes; returns consistent JSON error body |

**Exception mapping:**

| Exception Type | HTTP Status | Response |
|:---------------|:------------|:---------|
| `ValidationException` | 400 Bad Request | Validation error messages |
| `UnauthorizedAccessException` | 401 Unauthorized | "Unauthorized." |
| `KeyNotFoundException` | 404 Not Found | Exception message |
| `ArgumentException` | 400 Bad Request | Exception message |
| All others | 500 Internal Server Error | Generic message (or detail in dev) |

### 6.4 Rate Limiting

Rate limiting is configured in Program.cs using AddRateLimiter with an 'auth' policy to protect authentication endpoints.

### 6.5 Web Frontend

The web portal is built with Vite + React 18 with TypeScript, Tailwind CSS, shadcn/ui components, Recharts for data visualization, React Router v6 for routing, and Axios for API calls.

### 6.6 Mobile App

The mobile app uses Expo SDK 52 with React Native 0.76, TypeScript, Expo Router for file-based navigation, expo-notifications for push, and AsyncStorage for local state.

---

## 7. Request Flow Example

### Example: Confirming a Dose Intake

```
1. Mobile App: POST /api/dispense-events/{id}/confirm
   Headers: Authorization: Bearer <jwt>
   
2. ASP.NET Core Pipeline:
   → GlobalExceptionMiddleware (wraps entire request)
   → JWT Bearer Authentication (validates token, sets ClaimsPrincipal)
   → Authorization (checks [Authorize] attribute)
   → Routing → DispensingController.Confirm()

3. Controller:
   → Extracts userId from JWT claims
   → Sends ConfirmDispenseCommand(userId, eventId) via MediatR

4. ConfirmDispenseCommandHandler:
   → Loads DispenseEvent from IDispenseEventRepository
   → Validates: event exists, belongs to user, status is Dispensed/Pending
   → Updates: Status = Confirmed, ConfirmedAtUtc = now
   → Decrements Container.Quantity by PillsPerDose
   → Triggers outgoing webhooks (dispense.confirmed)
   → Saves via IUnitOfWork.SaveChangesAsync()
   → Returns DispenseEventDto

5. Response: 200 OK with DispenseEventDto JSON
```

---

## 8. Testing Architecture

### 8.1 Test Projects

| Project | Type | Framework | Covers |
|:--------|:-----|:----------|:-------|
| `Application.Tests` | Unit | xUnit | Command/query handlers, business logic |
| `Domain.Tests` | Unit | xUnit | Entity behavior, enum validation |

### 8.2 Test Categories

| Category | Example Tests |
|:---------|:-------------|
| **Handler tests** | ConfirmDispenseCommandHandlerTests — verifies dose confirmation flow |
| **Missed dose logic** | MissedDoseLogicTests — verifies 60-minute timeout marking |
| **Travel mode** | TravelModeLogicTests — verifies container copying and session management |
| **Domain** | DomainTests — entity creation, property validation |

### 8.3 Running Tests

```bash
cd backend
dotnet test                              # Run all tests
dotnet test --filter "Category=Unit"     # Run unit tests only
dotnet test --verbosity detailed         # Verbose output
```

---

## 9. Design Patterns Used

| Pattern | Where Used | Purpose |
|:--------|:-----------|:--------|
| **Clean Architecture** | Entire backend | Layer separation, dependency inversion |
| **CQRS** | Application layer | Separate read/write models |
| **Mediator** | MediatR dispatch | Decouple controllers from handlers |
| **Repository** | Infrastructure layer | Abstract database access |
| **Unit of Work** | `UnitOfWork` class | Transactional consistency |
| **DTO** | Application/DTOs | API contract separation from domain |
| **Strategy** | `GlobalExceptionMiddleware` | Exception-to-HTTP-status mapping |
| **Observer** | Webhooks | External event notification |
| **Background Service** | `MissedDoseAndLowStockHostedService` | Async processing |
| **Factory** | `JwtAuthService.GenerateJwt()` | Token creation |

---

## 10. Caching Strategy

### 10.1 Caching Layers
| Layer | Technology | Scope | TTL |
|:------|:-----------|:------|:----|
| **In-Memory** | `IMemoryCache` | Single instance | 5 min |
| **Distributed** | Redis (planned) | Across instances | Configurable |
| **Browser** | HTTP Cache-Control | Per client | Varies |

### 10.2 Cacheable Data
| Data | Cache Type | TTL | Invalidation |
|:-----|:-----------|:----|:-------------|
| Today's schedule | In-memory | 60s | On schedule CRUD |
| Device list | In-memory | 30s | On device status change |
| Adherence summary | In-memory | 5 min | On dispense event |
| Static config | In-memory | 30 min | App restart |
| User profile | In-memory | 5 min | On profile update |

### 10.3 Cache Implementation Pattern
```csharp
// Example: Caching today's schedule
public class GetTodayScheduleQueryHandler : IRequestHandler<GetTodayScheduleQuery, List<TodayScheduleItemDto>>
{
    private readonly IMemoryCache _cache;
    
    public async Task<List<TodayScheduleItemDto>> Handle(GetTodayScheduleQuery request, CancellationToken ct)
    {
        var cacheKey = $"today-schedule:{request.DeviceId}:{DateTime.UtcNow:yyyy-MM-dd}";
        
        if (_cache.TryGetValue(cacheKey, out List<TodayScheduleItemDto> cached))
            return cached;
        
        var result = await _scheduleRepository.GetTodayScheduleAsync(request.DeviceId, ct);
        
        _cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
        return result;
    }
}
```

### 10.4 Cache Invalidation
- Use MediatR pipeline behaviors to invalidate cache on write operations
- Example: CreateScheduleCommand invalidates `today-schedule:{deviceId}:*`
- Use `IDistributedCache` when scaling to multiple instances

---

## 11. Performance Requirements

### 11.1 API Performance Targets
| Metric | Target | Measurement |
|:-------|:-------|:------------|
| API response time (p50) | < 100ms | Application Insights |
| API response time (p95) | < 200ms | Application Insights |
| API response time (p99) | < 500ms | Application Insights |
| Heartbeat processing | < 50ms | Custom metric |
| Event processing | < 100ms | Custom metric |
| Database query time | < 50ms | EF Core logging |

### 11.2 Throughput Targets
| Phase | Active Devices | API Requests/sec | DB Connections |
|:------|:--------------|:-----------------|:---------------|
| Year 1 | 400 | ~10 | 20 |
| Year 3 | 15,000 | ~500 | 50 |
| Year 5 | 97,000 | ~3,000 | 100+ |

### 11.3 Performance Optimization Patterns
- **Async/await throughout**: All I/O operations are async
- **Projection queries**: Use `Select()` to return only needed fields
- **No tracking queries**: Use `AsNoTracking()` for read-only queries
- **Batch operations**: Group related DB writes in single `SaveChangesAsync()`
- **Connection pooling**: Npgsql connection pool (default 100 connections)

---

## 12. Multi-Tenancy Architecture

### 12.1 B2B Multi-Tenancy Model (Planned)
The platform supports B2B partnerships where healthcare organizations (pharmacies, care homes) manage patients.

```
┌───────────────────────────────────────────┐
│           MULTI-TENANCY MODEL              │
├───────────────────────────────────────────┤
│                                            │
│  Tenant A (Pharmacy Chain)                 │
│  ├── Organization Admin                    │
│  ├── Care Team Members                     │
│  └── Patients (50-200)                     │
│       └── Devices (1-2 per patient)        │
│                                            │
│  Tenant B (Care Home)                      │
│  ├── Organization Admin                    │
│  ├── Nurses/Caregivers                     │
│  └── Residents (20-100)                    │
│       └── Devices (1 per resident)         │
│                                            │
│  Direct Users (B2C)                        │
│  └── Individual patients                   │
│       └── Devices (1-2)                    │
│                                            │
└───────────────────────────────────────────┘
```

### 12.2 Data Isolation Strategy
| Approach | Description | Status |
|:---------|:-----------|:-------|
| **Row-level filtering** | All queries filtered by UserId/TenantId | Current (UserId) |
| **Shared database** | Single DB, tenant column on key tables | Planned |
| **Separate schemas** | Per-tenant PostgreSQL schemas | Future option |

### 12.3 Tenant Context
```csharp
// Planned: TenantContext middleware
public class TenantMiddleware
{
    public async Task InvokeAsync(HttpContext context, ITenantResolver resolver)
    {
        var tenantId = await resolver.ResolveAsync(context);
        context.Items["TenantId"] = tenantId;
        // EF Core global query filter will apply tenant filtering
        await _next(context);
    }
}
```

---

## 13. Event-Driven Architecture

### 13.1 Domain Events (Planned)
| Event | Trigger | Handlers |
|:------|:--------|:---------|
| `DoseDispensedEvent` | Dose physically released | Update inventory, notify caregiver, send webhook |
| `DoseMissedEvent` | 60-min timeout | Create notification, alert caregiver, send webhook |
| `DeviceOfflineEvent` | 3x heartbeat missed | Create alert, notify caregiver |
| `LowStockEvent` | Quantity < threshold | Create notification, send email |
| `ContainerRefillEvent` | Quantity updated | Clear low-stock alerts |

### 13.2 MediatR Notification Pattern
```csharp
// Domain event
public record DoseMissedEvent(Guid DispenseEventId, Guid PatientId, Guid DeviceId) : INotification;

// Multiple handlers
public class CreateMissedDoseNotificationHandler : INotificationHandler<DoseMissedEvent> { }
public class NotifyCaregiverHandler : INotificationHandler<DoseMissedEvent> { }
public class SendWebhookHandler : INotificationHandler<DoseMissedEvent> { }
```

---

## 14. Error Handling Strategy

### 14.1 Error Categories
| Category | HTTP Code | Logging | Alert |
|:---------|:----------|:--------|:------|
| Validation | 400 | Debug | No |
| Authentication | 401 | Info | Rate-based |
| Authorization | 403 | Warning | Yes (repeated) |
| Not Found | 404 | Debug | No |
| Business Rule | 400/409 | Info | No |
| External Service | 502/503 | Error | Yes |
| Internal Error | 500 | Error | Yes |

### 14.2 Result Pattern (Planned Enhancement)
```csharp
// Replace exceptions with Result<T> for business logic
public class Result<T>
{
    public bool IsSuccess { get; }
    public T Value { get; }
    public string Error { get; }
    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}
```

---

## 15. Domain Event Schemas

### 15.1 Complete Event Type Inventory

| Event Type | Priority | Source | Triggers |
|:-----------|:---------|:------|:---------|
| `DOSE_DISPENSED` | High | Device sensor | Update inventory, notify patient |
| `DOSE_TAKEN` | High | Weight sensor / app | Update event status, notify caregiver |
| `DOSE_PARTIAL` | Medium | Weight sensor | Alert patient, flag for review |
| `DOSE_MISSED` | Critical | Background job (60 min) | Notify patient + caregiver, webhook |
| `REFILL_NEEDED` | Medium | Inventory check | Notify patient, webhook |
| `REFILL_CRITICAL` | High | Inventory check | Notify patient + caregiver, email |
| `REFILL_EMPTY` | Critical | Inventory check | Alert all, suspend slot |
| `DEVICE_ONLINE` | Low | Heartbeat received | Update device status |
| `DEVICE_OFFLINE` | Medium | 3× missed heartbeat | Notify after 5 min, caregiver after 30 min |
| `DEVICE_ERROR` | High | Device self-check | See error code reference (doc 13) |
| `DEVICE_RECOVERY` | Low | Error resolved | Clear active alerts |
| `BATTERY_LOW` | Medium | Battery < 20% | Push notification |
| `BATTERY_CRITICAL` | High | Battery < 5% | Push + email to patient + caregiver |
| `BATTERY_CHARGING` | Info | Charger connected | Update device status |
| `BATTERY_FULL` | Info | Charging complete | Update device status |
| `TRAVEL_MODE_ON` | Medium | User initiated | Sync to portable device |
| `TRAVEL_MODE_OFF` | Medium | User initiated | Reconcile inventory |
| `TRAY_OPENED` | Info | Sensor | Start dose-taken detection |
| `TRAY_CLOSED` | Info | Sensor | Finalize dose event |
| `SLOT_LOADED` | Info | Sensor + user | Update inventory count |
| `FIRMWARE_UPDATED` | Info | OTA complete | Log version change |
| `CONFIG_CHANGED` | Info | Settings update | Log configuration change |

### 15.2 Event Processing Pipeline

```
Device Event
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ DeviceApi     │────▶│ Event        │────▶│ Event        │
│ Controller    │     │ Logger       │     │ Processor    │
│ (validate)    │     │ (store raw)  │     │ (business)   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                   │
                              ┌─────────────────────┼──────────────────────┐
                              │                     │                      │
                              ▼                     ▼                      ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │ Notification  │     │ Webhook      │     │ Device       │
                     │ Service       │     │ Delivery     │     │ Status       │
                     │ (push/email)  │     │ Service      │     │ Update       │
                     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 16. Background Jobs Inventory

### 16.1 Complete Job Catalog

| Job | Class | Interval | Description |
|:----|:------|:---------|:------------|
| Missed Dose Detector | `MissedDoseAndLowStockHostedService` | 5 min | Marks overdue events (>60 min) as Missed |
| Low Stock Checker | `MissedDoseAndLowStockHostedService` | 5 min | Creates LowStock notifications below threshold |
| Data Retention Purge | `DataRetentionHostedService` (planned) | Daily 03:00 UTC | Purges expired data per retention policy |
| Device Offline Detector | `DeviceOfflineHostedService` (planned) | 1 min | Marks devices with 3× missed heartbeats as offline |
| Notification Delivery | `NotificationDeliveryHostedService` (planned) | 30 sec | Processes push/email notification queue |
| Webhook Retry | `WebhookRetryHostedService` (planned) | 1 min | Retries failed webhook deliveries |
| Travel Auto-End | `TravelAutoEndHostedService` (planned) | 1 hour | Ends overdue travel sessions (planned end + 1 day) |
| Adherence Report | `AdherenceReportHostedService` (planned) | Weekly | Generates weekly adherence summary emails |
| Backup Verification | `BackupVerificationHostedService` (planned) | Weekly | Validates latest database backup |

### 16.2 Job Error Handling

| Scenario | Behavior |
|:---------|:---------|
| Job throws exception | Log error, continue to next iteration |
| Database unavailable | Retry after interval, log warning |
| External service down | Queue for retry, use circuit breaker |
| Job runs longer than interval | Skip next iteration, log warning |

---

## 17. Feature Roadmap

### 17.1 Software Development Phases

| Phase | Timeline | Key Features |
|:------|:---------|:-------------|
| **MVP** | Q4 2025 (done) | Core dispensing, web portal, mobile app, device API |
| **Phase 1** | Q2 2026 | OTA updates, device firmware completion, production testing |
| **Phase 2** | Q3-Q4 2026 | Push notifications, EHR/FHIR integration, analytics dashboard, voice assistant, i18n |
| **Phase 3** | 2027 | AI adherence prediction, smart home integration, advanced analytics, DACH expansion |

### 17.2 Regulatory Timeline Impact

| Milestone | Date | Software Impact |
|:----------|:-----|:---------------|
| ISO 13485 certification | Q2 2026 | Software lifecycle processes certified |
| IEC 62304 compliance | Q2-Q3 2026 | All software documentation complete |
| CE MDR submission | Q3 2026 | Technical file including software docs |
| CE marking received | Q4 2026 | Software meets all CE requirements |
| Commercial launch | Q4 2026 | Production-ready, all features |
| Swissmedic complete | Q1 2027 | Swiss-specific reporting |
| Germany soft launch | Q2 2027 | German localization complete |
