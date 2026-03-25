# Testing Strategy

**Smart Medication Dispenser — Comprehensive Testing Strategy**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Title** | Testing Strategy |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Author** | Development Team |
| **Status** | Draft |
| **Classification** | Internal |
| **Related Documents** | Software Architecture (01), Backend API (02), Database (03) |
| **Review Cycle** | Quarterly |

---

## 1. Testing Overview

### 1.1 Testing Pyramid

The Smart Medication Dispenser follows a **testing pyramid** approach, prioritizing fast, isolated tests at the base and fewer, slower end-to-end tests at the top:

```
                    ┌─────────────────┐
                    │   Manual Tests  │
                    │   (Exploratory) │
                    └─────────────────┘
                           ▲
                    ┌─────────────────┐
                    │   E2E Tests     │
                    │   (Playwright)  │
                    └─────────────────┘
                           ▲
                ┌──────────────────────┐
                │   Integration Tests   │
                │   (API + Database)    │
                └──────────────────────┘
                           ▲
            ┌──────────────────────────────┐
            │      Unit Tests              │
            │  (xUnit, Vitest, Jest)      │
            └──────────────────────────────┘
```

**Testing Layers:**

1. **Unit Tests** (70% of tests)
   - Fast execution (< 100ms per test)
   - Isolated business logic validation
   - Mock external dependencies
   - Run on every commit

2. **Integration Tests** (20% of tests)
   - Test API endpoints with in-memory database
   - Validate database interactions
   - Test authentication/authorization flows
   - Run on pull requests

3. **E2E Tests** (8% of tests)
   - Full user workflows
   - Cross-browser testing
   - Critical path validation
   - Run on staging deployments

4. **Manual Tests** (2% of tests)
   - Exploratory testing
   - Usability validation
   - Edge case discovery
   - Performed before releases

### 1.2 Test Coverage Targets

| Layer | Target Coverage | Measurement Tool | Critical Threshold |
|:------|:---------------|:----------------|:-------------------|
| **Domain Layer** | 90%+ | Coverlet | 85% minimum |
| **Application Layer** | 85%+ | Coverlet | 80% minimum |
| **API Controllers** | 80%+ | Coverlet | 75% minimum |
| **Infrastructure Layer** | 70%+ | Coverlet | 65% minimum |
| **Web Portal** | 75%+ | Vitest + @vitest/coverage | 70% minimum |
| **Mobile App** | 70%+ | Jest + coverage | 65% minimum |

**Note:** Coverlet is currently only in IntegrationTests.csproj; Application.Tests does not include Coverlet.

**Coverage Metrics:**
- **Line Coverage**: Percentage of executable lines covered
- **Branch Coverage**: Percentage of decision branches covered
- **Function Coverage**: Percentage of functions called

**Critical Paths Requiring 100% Coverage:**
- Authentication flows (login, registration, JWT validation)
- Dispense confirmation logic
- Missed dose detection
- Low stock notifications
- Travel mode activation/deactivation

### 1.3 Regulatory Compliance

**IEC 62304 Class B Requirements:**

- **Documented Verification**: All software verification activities must be documented
- **Traceability**: Requirements → Test Cases → Test Results
- **Test Documentation**: Test plan, test cases, test results, anomaly reports
- **Risk-Based Testing**: Critical functions (dispensing, notifications) require comprehensive testing
- **Change Control**: All test changes must be reviewed and approved

**Compliance Checklist:**

| Requirement | Status | Evidence |
|:------------|:-------|:---------|
| Test plan documented | ✅ | This document |
| Test cases traceable to requirements | ✅ | Traceability matrix (Section 10.1) |
| Test results recorded | ✅ | CI/CD reports |
| Anomaly tracking | ✅ | GitHub Issues |
| Test coverage measured | ✅ | Codecov integration |

---

## 2. Backend Testing (ASP.NET Core 8)

### 2.1 Unit Tests (xUnit)

#### 2.1.1 Test Project Structure

```
backend/
├── tests/
│   ├── Application.Tests/
│   │   ├── ConfirmDispenseCommandHandlerTests.cs
│   │   ├── DeviceApi/
│   │   │   ├── ProcessDeviceHeartbeatCommandHandlerTests.cs
│   │   │   └── RegisterDeviceCommandHandlerTests.cs
│   │   ├── DeviceApiTests.cs
│   │   ├── MissedDoseLogicTests.cs
│   │   └── TravelModeLogicTests.cs
│   ├── Domain.Tests/
│   │   └── DomainTests.cs
│   └── IntegrationTests/
│       ├── AuthEndpointTests.cs
│       ├── HealthEndpointTests.cs
│       └── NotificationEndpointTests.cs
```

**Note:** Unit tests use two projects—**Application.Tests** and **Domain.Tests**—with **flat** test files (no Application/Auth/, Devices/, etc. subfolders). Only the three integration test files above exist; DevicesControllerTests, ContainersControllerTests, SchedulesControllerTests, DispensingControllerTests, TravelControllerTests, and IntegrationsControllerTests are **Planned**. **Infrastructure** unit tests are planned (no Infrastructure test project exists). **Coverlet** is only in IntegrationTests.csproj; Application.Tests does not include Coverlet.

#### 2.1.2 Mocking Strategy

**Primary Mocking Framework:** Moq (with NSubstitute as alternative)

**Mocking Guidelines:**

| Dependency Type | Mocking Approach | Example |
|:----------------|:-----------------|:--------|
| **Repository Interfaces** | Mock with `Mock<IRepository<T>>` | `Mock<IDeviceRepository>` |
| **Unit of Work** | Mock with `Mock<IUnitOfWork>` | `Mock<IUnitOfWork>` |
| **External Services** | Mock with `Mock<IService>` | `Mock<IWebhookDeliveryService>` |
| **DateTime Provider** | Mock with `Mock<IDateTimeProvider>` | `Mock<IDateTimeProvider>` |
| **Database Context** | Use in-memory database | `UseInMemoryDatabase()` |

**Example Mock Setup:**

```csharp
public class ConfirmDispenseCommandHandlerTests
{
    private readonly Mock<IDispenseEventRepository> _mockRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDateTimeProvider> _mockDateTime;
    private readonly Mock<INotificationService> _mockNotification;

    public ConfirmDispenseCommandHandlerTests()
    {
        _mockRepo = new Mock<IDispenseEventRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDateTime = new Mock<IDateTimeProvider>();
        _mockNotification = new Mock<INotificationService>();
    }
}
```

#### 2.1.3 Test Naming Convention

**Format:** `[MethodName]_[Scenario]_[ExpectedResult]`

**Examples:**
- `ConfirmDispense_ValidEvent_SetsConfirmedStatus`
- `LoginCommand_InvalidPassword_ReturnsUnauthorized`
- `CreateScheduleCommand_InvalidBitmask_ThrowsValidationException`

**Test Method Structure (AAA Pattern):**

```csharp
[Fact]
public async Task ConfirmDispense_ValidEvent_SetsConfirmedStatus()
{
    // Arrange
    var handler = new ConfirmDispenseCommandHandler(
        _mockRepo.Object, 
        _mockUnitOfWork.Object,
        _mockDateTime.Object
    );
    var userId = Guid.NewGuid();
    var eventId = Guid.NewGuid();
    var command = new ConfirmDispenseCommand(userId, eventId);
    
    var existingEvent = new DispenseEvent
    {
        Id = eventId,
        UserId = userId,
        Status = DispenseEventStatus.Pending,
        ScheduledAtUtc = DateTime.UtcNow.AddMinutes(-5)
    };
    
    _mockRepo.Setup(r => r.GetByIdAsync(eventId, CancellationToken.None))
        .ReturnsAsync(existingEvent);
    _mockDateTime.Setup(d => d.UtcNow)
        .Returns(DateTime.UtcNow);
    
    // Act
    var result = await handler.Handle(command, CancellationToken.None);
    
    // Assert
    Assert.Equal(DispenseEventStatus.Confirmed, result.Status);
    Assert.NotNull(result.ConfirmedAtUtc);
    _mockRepo.Verify(r => r.Update(existingEvent), Times.Once);
    _mockUnitOfWork.Verify(u => u.SaveChangesAsync(CancellationToken.None), Times.Once);
}
```

### 2.2 Test ID Catalog

#### 2.2.1 Application Layer Tests (APP-001 to APP-035)

| Test ID | Test Name | Description | Expected Result |
|:--------|:----------|:------------|:----------------|
| **APP-001** | RegisterCommand creates user with hashed password | RegisterCommandHandler creates new user with BCrypt hashed password | User created with hashed password, password not stored in plain text |
| **APP-002** | LoginCommand returns JWT for valid credentials | LoginCommandHandler validates credentials and returns JWT token | Returns 200 with JWT token in response |
| **APP-003** | LoginCommand returns 401 for invalid password | LoginCommandHandler rejects invalid password | Returns 401 Unauthorized |
| **APP-004** | CreateDeviceCommand creates device for user | CreateDeviceCommandHandler creates device linked to user | Device created with correct UserId |
| **APP-005** | HeartbeatCommand updates device status | HeartbeatCommandHandler updates LastHeartbeatUtc | Device LastHeartbeatUtc updated to current time |
| **APP-006** | CreateContainerCommand creates container in slot | CreateContainerCommandHandler creates container in specified slot | Container created with correct SlotNumber and DeviceId |
| **APP-007** | CreateScheduleCommand creates schedule with bitmask | CreateScheduleCommandHandler creates schedule with day bitmask | Schedule created with BitmaskDays (1-127) |
| **APP-008** | DispenseCommand creates pending event | DispenseCommandHandler creates DispenseEvent with Pending status | DispenseEvent created with Status = Pending |
| **APP-009** | ConfirmDispenseCommand updates status and decrements quantity | ConfirmDispenseCommandHandler confirms event and reduces container quantity | Event Status = Confirmed, Container Quantity decremented |
| **APP-010** | ConfirmDispenseCommand fails for wrong user | ConfirmDispenseCommandHandler validates user ownership | Throws UnauthorizedException for wrong user |
| **APP-011** | DelayDispenseCommand sets delayed status | DelayDispenseCommandHandler sets Status = Delayed | DispenseEvent Status = Delayed, ScheduledAtUtc updated |
| **APP-012** | MissedDoseLogic marks events after 60 minutes | MissedDoseLogic identifies events older than 60 minutes | Events with Status = Pending and >60min old marked as Missed |
| **APP-013** | MissedDoseLogic creates patient notification | MissedDoseLogic creates notification for patient | Notification created with Type = MissedDose, UserId = patient |
| **APP-014** | MissedDoseLogic creates caregiver notification | MissedDoseLogic creates notification for caregiver | Notification created for caregiver user |
| **APP-015** | MissedDoseLogic sends webhook | MissedDoseLogic triggers webhook delivery | WebhookDeliveryService.SendAsync called with missed dose payload |
| **APP-016** | LowStockLogic creates notification below threshold | LowStockLogic detects quantity < threshold | Notification created when Container.Quantity < Threshold |
| **APP-017** | LowStockLogic doesn't duplicate existing notification | LowStockLogic checks for existing unread notification | No duplicate notification created |
| **APP-018** | StartTravelCommand copies containers to portable device | StartTravelCommandHandler copies containers to travel device | Containers copied to PortableDeviceId |
| **APP-019** | StartTravelCommand pauses main device | StartTravelCommandHandler sets main device to paused | Main device Status = Paused |
| **APP-020** | EndTravelCommand activates main device | EndTravelCommandHandler reactivates main device | Main device Status = Active |
| **APP-021** | GetTodayScheduleQuery returns only today's doses | GetTodayScheduleQueryHandler filters by current date | Returns only schedules matching today's day of week |
| **APP-022** | GetTodayScheduleQuery respects timezone | GetTodayScheduleQueryHandler uses user timezone | Schedules filtered by user's timezone, not UTC |
| **APP-023** | GetAdherenceQuery calculates correct percentage | GetAdherenceQueryHandler calculates adherence | Returns (Confirmed / Total) * 100 |
| **APP-024** | CreateWebhookEndpointCommand validates URL | CreateWebhookEndpointCommandHandler validates URL format | Throws ValidationException for invalid URL |
| **APP-025** | WebhookDeliveryService sends HMAC signature | WebhookDeliveryService includes HMAC-SHA256 signature | Request includes X-Webhook-Signature header |
| **APP-026** | DeviceApiKeyResolver resolves device from hashed key | DeviceApiKeyResolver validates API key hash | Returns Device entity for valid hashed key |
| **APP-027** | ProcessIncomingWebhookCommand handles heartbeat | ProcessIncomingWebhookCommandHandler processes heartbeat webhook | Updates device LastHeartbeatUtc |
| **APP-028** | ProcessIncomingWebhookCommand handles dispense_completed | ProcessIncomingWebhookCommandHandler processes dispense_completed | Updates DispenseEvent Status = Confirmed |
| **APP-029** | SyncFromCloudCommand updates device status | SyncFromCloudCommandHandler syncs device status | Device status updated from cloud payload |
| **APP-030** | SyncFromCloudCommand creates dispense events | SyncFromCloudCommandHandler creates events from sync | DispenseEvents created for completed dispensations |
| **APP-031** | GetDevicesQuery returns only user's devices | GetDevicesQueryHandler filters by UserId | Returns only devices owned by requesting user |
| **APP-032** | UpdateContainerCommand validates quantity | UpdateContainerCommandHandler validates quantity >= 0 | Throws ValidationException for negative quantity |
| **APP-033** | DeleteScheduleCommand checks for pending events | DeleteScheduleCommandHandler prevents deletion with pending events | Throws InvalidOperationException if pending events exist |
| **APP-034** | MarkNotificationReadCommand marks as read | MarkNotificationReadCommandHandler sets IsRead = true | Notification IsRead = true (entity has no ReadAtUtc property) |
| **APP-035** | GetNotificationsQuery returns sorted by date | GetNotificationsQueryHandler orders by CreatedAtUtc desc | Notifications returned newest first |

#### 2.2.2 Domain Layer Tests (DOM-001 to DOM-006)

| Test ID | Test Name | Description | Expected Result |
|:--------|:----------|:------------|:----------------|
| **DOM-001** | User entity requires email | User constructor validates email is not null/empty | Throws ArgumentException for null/empty email |
| **DOM-002** | Device entity validates type enum | Device constructor validates DeviceType enum | Throws ArgumentException for invalid DeviceType |
| **DOM-003** | DispenseEvent status transitions are valid | DispenseEvent validates status transitions | Pending → Confirmed/Delayed/Missed allowed, Confirmed → other not allowed |
| **DOM-004** | Container quantity cannot be negative | Container.SetQuantity validates quantity >= 0 | Throws ArgumentException for negative quantity |
| **DOM-005** | Schedule bitmask range 1-127 | Schedule validates BitmaskDays in range | Throws ArgumentException for bitmask < 1 or > 127 |
| **DOM-006** | TravelSession max 14 days | TravelSession validates EndDateUtc within 14 days | Throws ArgumentException if duration > 14 days |

#### 2.2.3 API Integration Tests (API-001 to API-066)

**Authentication Endpoints (API-001 to API-010):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-001** | `/api/auth/register` | POST | Register new user | 201 Created, returns user ID |
| **API-002** | `/api/auth/register` | POST | Register with duplicate email | 400 Bad Request |
| **API-003** | `/api/auth/register` | POST | Register with invalid email | 400 Bad Request |
| **API-004** | `/api/auth/login` | POST | Login with valid credentials | 200 OK, returns JWT token |
| **API-005** | `/api/auth/login` | POST | Login with invalid password | 401 Unauthorized |
| **API-006** | `/api/auth/login` | POST | Login with non-existent email | 401 Unauthorized |
| **API-007** | `/api/auth/me` | GET | Get current user with valid JWT | 200 OK, returns user data |
| **API-008** | `/api/auth/me` | GET | Get current user without JWT | 401 Unauthorized |
| **API-009** | `/api/auth/me` | GET | Get current user with expired JWT | 401 Unauthorized |
| **API-010** | `/api/auth/me/profile` | GET | Get profile with devices | 200 OK, returns profile + devices |

**Devices Endpoints (API-011 to API-020):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-011** | `/api/devices` | GET | List user's devices | 200 OK, returns device list |
| **API-012** | `/api/devices` | GET | List devices without auth | 401 Unauthorized |
| **API-013** | `/api/devices` | POST | Create new device | 201 Created, returns device ID |
| **API-014** | `/api/devices/{id}` | GET | Get device by ID | 200 OK, returns device |
| **API-015** | `/api/devices/{id}` | GET | Get other user's device | 404 Not Found |
| **API-016** | `/api/devices/{id}` | PUT | Update device | 200 OK, device updated |
| **API-017** | `/api/devices/{id}` | DELETE | Delete device | 204 No Content |
| **API-018** | `/api/devices/{id}` | DELETE | Delete device with containers | 400 Bad Request |
| **API-019** | `/api/devices/{id}/heartbeat` | POST | Send heartbeat | 200 OK, LastHeartbeatUtc updated |
| **API-020** | `/api/devices/{id}/heartbeat` | POST | Heartbeat without auth | 401 Unauthorized |

**Containers Endpoints (API-021 to API-030):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-021** | `/api/devices/{deviceId}/containers` | GET | List containers for device | 200 OK, returns container list |
| **API-022** | `/api/devices/{deviceId}/containers` | POST | Create container | 201 Created, returns container ID |
| **API-023** | `/api/devices/{deviceId}/containers` | POST | Create container in occupied slot | 400 Bad Request |
| **API-024** | `/api/devices/{deviceId}/containers/{id}` | GET | Get container by ID | 200 OK, returns container |
| **API-025** | `/api/devices/{deviceId}/containers/{id}` | PUT | Update container | 200 OK, container updated |
| **API-026** | `/api/devices/{deviceId}/containers/{id}` | PUT | Update with negative quantity | 400 Bad Request |
| **API-027** | `/api/devices/{deviceId}/containers/{id}` | DELETE | Delete container | 204 No Content |
| **API-028** | `/api/devices/{deviceId}/containers/{id}` | DELETE | Delete container with schedule | 400 Bad Request |
| **API-029** | `/api/devices/{deviceId}/containers` | GET | List containers for other user's device | 404 Not Found |
| **API-030** | `/api/devices/{deviceId}/containers` | POST | Create container without auth | 401 Unauthorized |

**Schedules Endpoints (API-031 to API-040):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-031** | `/api/containers/{containerId}/schedules` | GET | List schedules for container | 200 OK, returns schedule list |
| **API-032** | `/api/containers/{containerId}/schedules` | POST | Create schedule | 201 Created, returns schedule ID |
| **API-033** | `/api/containers/{containerId}/schedules` | POST | Create schedule with invalid bitmask | 400 Bad Request |
| **API-034** | `/api/containers/{containerId}/schedules/{id}` | GET | Get schedule by ID | 200 OK, returns schedule |
| **API-035** | `/api/containers/{containerId}/schedules/{id}` | PUT | Update schedule | 200 OK, schedule updated |
| **API-036** | `/api/containers/{containerId}/schedules/{id}` | DELETE | Delete schedule | 204 No Content |
| **API-037** | `/api/containers/{containerId}/schedules/{id}` | DELETE | Delete schedule with pending events | 400 Bad Request |
| **API-038** | `/api/schedules/today` | GET | Get today's schedule | 200 OK, returns today's doses |
| **API-039** | `/api/schedules/today` | GET | Get today's schedule respects timezone | 200 OK, filtered by user timezone |
| **API-040** | `/api/containers/{containerId}/schedules` | GET | List schedules without auth | 401 Unauthorized |

**Dispensing Endpoints (API-041 to API-048):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-041** | `/api/dispensing/dispense` | POST | Create dispense event | 201 Created, returns event ID |
| **API-042** | `/api/dispensing/dispense` | POST | Dispense without container | 400 Bad Request |
| **API-043** | `/api/dispensing/{eventId}/confirm` | POST | Confirm dispense | 200 OK, event confirmed |
| **API-044** | `/api/dispensing/{eventId}/confirm` | POST | Confirm other user's event | 403 Forbidden |
| **API-045** | `/api/dispensing/{eventId}/delay` | POST | Delay dispense | 200 OK, event delayed |
| **API-046** | `/api/dispensing/events` | GET | List dispense events | 200 OK, returns event list |
| **API-047** | `/api/dispensing/events` | GET | Filter events by date range | 200 OK, filtered results |
| **API-048** | `/api/dispensing/dispense` | POST | Dispense without auth | 401 Unauthorized |

**Notifications Endpoints (API-049 to API-054):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-049** | `/api/notifications` | GET | List notifications | 200 OK, returns notification list |
| **API-050** | `/api/notifications` | GET | Filter unread notifications | 200 OK, only unread returned |
| **API-051** | `/api/notifications/{id}/read` | POST | Mark notification as read | 204 No Content, IsRead = true |
| **API-052** | `/api/notifications/unread-count` | GET | Get unread count | 200 OK, returns count |
| **API-053** | `/api/notifications` | GET | Notifications sorted by date | 200 OK, newest first |
| **API-054** | `/api/notifications` | GET | List without auth | 401 Unauthorized |

**Travel Endpoints (API-055 to API-060):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-055** | `/api/travel/start` | POST | Start travel session | 201 Created, travel session started |
| **API-056** | `/api/travel/start` | POST | Start travel without portable device | 400 Bad Request |
| **API-057** | `/api/travel/end` | POST | End travel session | 200 OK, travel session ended |
| **API-058** | `/api/travel/active` | GET | Get active travel session | 200 OK, returns active session |
| **API-059** | `/api/travel/active` | GET | No active travel session | 404 Not Found |
| **API-060** | `/api/travel/start` | POST | Start travel without auth | 401 Unauthorized |

**Integrations Endpoints (API-061 to API-066):**

| Test ID | Endpoint | Method | Description | Expected Result |
|:--------|:---------|:-------|:------------|:----------------|
| **API-061** | `/api/integrations/webhooks` | GET | List webhook endpoints | 200 OK, returns webhook list |
| **API-062** | `/api/integrations/webhooks` | POST | Create webhook endpoint | 201 Created, returns webhook ID |
| **API-063** | `/api/integrations/webhooks` | POST | Create webhook with invalid URL | 400 Bad Request |
| **API-064** | `/api/integrations/api-keys` | POST | Generate API key | 201 Created, returns API key (shown once) |
| **API-065** | `/api/integrations/api-keys` | POST | Generate second API key | 400 Bad Request (one key per device) |
| **API-066** | `/api/integrations/webhooks` | GET | List without auth | 401 Unauthorized |

### 2.3 Integration Tests

#### 2.3.1 In-Memory Database Testing

**Setup:**

```csharp
public class IntegrationTestBase : IClassFixture<WebApplicationFactory<Program>>
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext DbContext;

    public IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
        Factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove real database
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
                });
            });
        });

        Client = Factory.CreateClient();
        var scope = Factory.Services.CreateScope();
        DbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    protected async Task<User> CreateTestUserAsync(string email = "test@example.com")
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
            FullName = "Test User",
            Role = UserRole.Patient
        };
        DbContext.Users.Add(user);
        await DbContext.SaveChangesAsync();
        return user;
    }

    protected async Task<string> GetJwtTokenAsync(string email = "test@example.com", string password = "Test123!")
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });
        var content = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return content.Token;
    }
}
```

#### 2.3.2 WebApplicationFactory Setup

**Program.cs Configuration:**

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

**Test Factory:**

```csharp
public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup>
    where TStartup : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace services for testing
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        });
    }
}
```

#### 2.3.3 Authentication Helper

```csharp
public static class AuthenticationHelper
{
    public static void SetJwtToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }

    public static async Task<string> GetJwtTokenAsync(
        HttpClient client, 
        string email, 
        string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });
        
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return content.Token;
    }
}
```

### 2.4 Code Examples

#### Example 1: Unit Test - Confirm Dispense Command

```csharp
public class ConfirmDispenseCommandHandlerTests
{
    private readonly Mock<IDispenseEventRepository> _mockRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDateTimeProvider> _mockDateTime;
    private readonly Mock<IContainerRepository> _mockContainerRepo;

    public ConfirmDispenseCommandHandlerTests()
    {
        _mockRepo = new Mock<IDispenseEventRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDateTime = new Mock<IDateTimeProvider>();
        _mockContainerRepo = new Mock<IContainerRepository>();
    }

    [Fact]
    public async Task ConfirmDispense_ValidEvent_SetsConfirmedStatus()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var containerId = Guid.NewGuid();
        var command = new ConfirmDispenseCommand(userId, eventId);

        var existingEvent = new DispenseEvent
        {
            Id = eventId,
            UserId = userId,
            ContainerId = containerId,
            Status = DispenseEventStatus.Pending,
            ScheduledAtUtc = DateTime.UtcNow.AddMinutes(-5)
        };

        var container = new Container
        {
            Id = containerId,
            Quantity = 10
        };

        _mockRepo.Setup(r => r.GetByIdAsync(eventId, CancellationToken.None))
            .ReturnsAsync(existingEvent);
        _mockContainerRepo.Setup(r => r.GetByIdAsync(containerId, CancellationToken.None))
            .ReturnsAsync(container);
        _mockDateTime.Setup(d => d.UtcNow)
            .Returns(DateTime.UtcNow);

        var handler = new ConfirmDispenseCommandHandler(
            _mockRepo.Object,
            _mockContainerRepo.Object,
            _mockUnitOfWork.Object,
            _mockDateTime.Object
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(DispenseEventStatus.Confirmed, result.Status);
        Assert.NotNull(result.ConfirmedAtUtc);
        Assert.Equal(9, container.Quantity); // Decremented
        _mockRepo.Verify(r => r.Update(existingEvent), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task ConfirmDispense_WrongUser_ThrowsUnauthorizedException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var command = new ConfirmDispenseCommand(userId, eventId);

        var existingEvent = new DispenseEvent
        {
            Id = eventId,
            UserId = otherUserId, // Different user
            Status = DispenseEventStatus.Pending
        };

        _mockRepo.Setup(r => r.GetByIdAsync(eventId, CancellationToken.None))
            .ReturnsAsync(existingEvent);

        var handler = new ConfirmDispenseCommandHandler(
            _mockRepo.Object,
            _mockContainerRepo.Object,
            _mockUnitOfWork.Object,
            _mockDateTime.Object
        );

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(
            () => handler.Handle(command, CancellationToken.None)
        );
    }
}
```

#### Example 2: Integration Test - Devices Controller

```csharp
public class DevicesControllerTests : IntegrationTestBase
{
    public DevicesControllerTests(WebApplicationFactory<Program> factory) 
        : base(factory) { }

    [Fact]
    public async Task GetDevices_AuthenticatedUser_ReturnsUserDevices()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = await GetJwtTokenAsync(user.Email, "Test123!");
        AuthenticationHelper.SetJwtToken(Client, token);

        var device1 = new Device
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = "Main Device",
            Type = DeviceType.Main
        };
        var device2 = new Device
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = "Travel Device",
            Type = DeviceType.Portable
        };
        DbContext.Devices.AddRange(device1, device2);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/devices");

        // Assert
        response.EnsureSuccessStatusCode();
        var devices = await response.Content.ReadFromJsonAsync<List<DeviceDto>>();
        Assert.Equal(2, devices.Count);
        Assert.Contains(devices, d => d.Name == "Main Device");
        Assert.Contains(devices, d => d.Name == "Travel Device");
    }

    [Fact]
    public async Task CreateDevice_ValidRequest_CreatesDevice()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = await GetJwtTokenAsync(user.Email, "Test123!");
        AuthenticationHelper.SetJwtToken(Client, token);

        var request = new CreateDeviceRequest
        {
            Name = "New Device",
            Type = DeviceType.Main,
            SerialNumber = "SN123456"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/devices", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var device = await response.Content.ReadFromJsonAsync<DeviceDto>();
        Assert.NotNull(device);
        Assert.Equal("New Device", device.Name);
        Assert.Equal(user.Id, device.UserId);
    }
}
```

---

## 3. Web Portal Testing (React + Vitest)

### 3.1 Test IDs (WEB-001 to WEB-023)

| Test ID | Component/Feature | Description | Expected Result |
|:--------|:------------------|:------------|:----------------|
| **WEB-001** | Login page | Login page renders form with email and password fields | Form renders with email input, password input, submit button |
| **WEB-002** | Login page | Login submits credentials to API | POST request to `/api/auth/login` with credentials |
| **WEB-003** | Login page | Login shows error on invalid credentials | Error message displayed, token not stored |
| **WEB-004** | Register page | Register validates email format | Shows validation error for invalid email format |
| **WEB-005** | Dashboard | Dashboard shows adherence percentage | Adherence percentage displayed from API |
| **WEB-006** | Dashboard | Dashboard shows today's schedule | Today's schedule list rendered with times and medications |
| **WEB-007** | Devices page | Devices page lists user devices | Device list rendered with device names and status |
| **WEB-008** | Device detail | Device detail shows hardware status | Hardware status (online/offline) displayed |
| **WEB-009** | Containers page | Containers page shows medication slots | Container list rendered with slot numbers and medications |
| **WEB-010** | Container form | Container form validates required fields | Validation errors shown for missing name, quantity, threshold |
| **WEB-011** | Schedules page | Schedules page shows time picker | Time picker component rendered for schedule creation |
| **WEB-012** | Schedule form | Schedule form validates bitmask | Validation error for bitmask outside 1-127 range |
| **WEB-013** | History page | History page shows filtered events | Dispense events list rendered with filters |
| **WEB-014** | History page | History page filters by date range | Events filtered by selected date range |
| **WEB-015** | Travel page | Travel page starts travel session | POST request to `/api/travel/start`, success message shown |
| **WEB-016** | Travel page | Travel page shows active session | Active travel session details displayed |
| **WEB-017** | Notifications page | Notifications page shows unread count | Unread notification count badge displayed |
| **WEB-018** | Notifications page | Notifications marks as read | POST request to `/api/notifications/{id}/read` (204 No Content), IsRead updated |
| **WEB-019** | Integrations page | Integrations creates webhook | POST request to `/api/integrations/webhooks`, webhook added to list |
| **WEB-020** | Integrations page | Integrations creates API key (shows once) | API key displayed once, then hidden, stored securely |
| **WEB-021** | ProtectedRoute | ProtectedRoute redirects to login | Unauthenticated user redirected to `/login` |
| **WEB-022** | AuthContext | AuthContext stores and clears token | Token stored in localStorage on login, cleared on logout |
| **WEB-023** | API client | API client handles 401 redirect | On 401 response, redirects to login page |

### 3.2 MSW (Mock Service Worker) Setup

**Setup File (`src/mocks/handlers.ts`):**

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User'
        }
      });
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'Patient'
      });
    }
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // Devices handlers
  http.get('/api/devices', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return HttpResponse.json([
      {
        id: 'device-1',
        name: 'Main Device',
        type: 'Main',
        status: 'Active',
        lastHeartbeatUtc: new Date().toISOString()
      }
    ]);
  }),

  http.post('/api/devices', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 'device-new',
        ...body,
        userId: 'user-123'
      },
      { status: 201 }
    );
  }),

  // Containers handlers
  http.get('/api/devices/:deviceId/containers', () => {
    return HttpResponse.json([
      {
        id: 'container-1',
        deviceId: 'device-1',
        slotNumber: 1,
        medicationName: 'Aspirin',
        quantity: 30,
        threshold: 10
      }
    ]);
  }),

  // Schedules handlers
  http.get('/api/schedules/today', () => {
    return HttpResponse.json([
      {
        id: 'schedule-1',
        containerId: 'container-1',
        time: '08:00',
        medicationName: 'Aspirin',
        quantity: 1
      }
    ]);
  }),

  // Notifications handlers
  http.get('/api/notifications', () => {
    return HttpResponse.json([
      {
        id: 'notif-1',
        type: 'MissedDose',
        message: 'Missed dose at 08:00',
        isRead: false,
        createdAtUtc: new Date().toISOString()
      }
    ]);
  }),

  http.get('/api/notifications/unread-count', () => {
    return HttpResponse.json({ count: 1 });
  }),

  http.post('/api/notifications/:id/read', () => {
    return HttpResponse.json({ success: true });
  })
];

export const server = setupServer(...handlers);
```

**Test Setup (`src/setupTests.ts`):**

```typescript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/handlers';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### 3.3 Component Test Examples

#### Example 1: Login Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

describe('LoginPage', () => {
  it('WEB-001: Login page renders form', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('WEB-002: Login submits credentials', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('WEB-003: Login shows error on invalid credentials', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

#### Example 2: Dashboard Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';
import { AuthProvider } from '../contexts/AuthContext';

describe('Dashboard', () => {
  it('WEB-005: Dashboard shows adherence percentage', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/adherence/i)).toBeInTheDocument();
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });
  });

  it('WEB-006: Dashboard shows today\'s schedule', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/today's schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/aspirin/i)).toBeInTheDocument();
    });
  });
});
```

#### Example 3: Protected Route Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

describe('ProtectedRoute', () => {
  it('WEB-021: ProtectedRoute redirects to login', () => {
    // Mock localStorage to simulate no token
    Storage.prototype.getItem = vi.fn(() => null);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });
});
```

---

## 4. Mobile App Testing (React Native + Jest)

### 4.1 Test IDs (MOB-001 to MOB-024)

| Test ID | Component/Feature | Description | Expected Result |
|:--------|:------------------|:------------|:----------------|
| **MOB-001** | LoginScreen | Login screen renders form | Email and password inputs rendered |
| **MOB-002** | LoginScreen | Login submits credentials | API call to login endpoint |
| **MOB-003** | LoginScreen | Login shows error on failure | Error message displayed |
| **MOB-004** | DashboardScreen | Dashboard shows adherence chart | Adherence percentage displayed |
| **MOB-005** | DashboardScreen | Dashboard shows next dose | Next scheduled dose displayed |
| **MOB-006** | ScheduleScreen | Schedule list renders | Today's schedule list displayed |
| **MOB-007** | ScheduleScreen | Schedule item shows time | Time formatted correctly (e.g., "08:00 AM") |
| **MOB-008** | DispenseScreen | Dispense button triggers action | POST request to dispense endpoint |
| **MOB-009** | DispenseScreen | Confirm dispense updates UI | Status updated to "Confirmed" |
| **MOB-010** | NotificationsScreen | Notifications list renders | Notification list displayed |
| **MOB-011** | NotificationsScreen | Unread badge shows count | Badge displays unread count |
| **MOB-012** | NotificationsScreen | Mark as read updates UI | Notification marked as read |
| **MOB-013** | DeviceStatusCard | Device status shows online | Online indicator displayed |
| **MOB-014** | DeviceStatusCard | Device status shows offline | Offline indicator displayed |
| **MOB-015** | TravelModeScreen | Travel mode activates | Travel session started |
| **MOB-016** | TravelModeScreen | Travel mode shows active session | Active session details displayed |
| **MOB-017** | ContainerCard | Container shows quantity | Quantity displayed correctly |
| **MOB-018** | ContainerCard | Container shows low stock warning | Warning displayed when quantity < threshold |
| **MOB-019** | AdherenceChart | Adherence chart renders | Chart component rendered |
| **MOB-020** | API client | API client handles network error | Error message displayed |
| **MOB-021** | API client | API client handles 401 | User logged out, redirected to login |
| **MOB-022** | Push notifications | Push notification received | Notification displayed |
| **MOB-023** | Push notifications | Push notification tapped | App navigates to relevant screen |
| **MOB-024** | Offline mode | Offline mode caches data | Data cached, synced when online |

### 4.2 Detox E2E Tests

**Detox Configuration (`.detoxrc.js`):**

```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/SmartDispenser.app',
      build: 'xcodebuild -workspace ios/SmartDispenser.xcworkspace -scheme SmartDispenser -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_31'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

**Example Detox Test (`e2e/login.e2e.js`):**

```javascript
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('MOB-E2E-001: User can login successfully', async () => {
    await expect(element(by.id('email-input'))).toBeVisible();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('dashboard')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('MOB-E2E-002: User sees error on invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('error-message'))).toBeVisible();
  });
});
```

**Jest Configuration (`e2e/jest.config.js`):**

```javascript
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true
};
```

---

## 5. E2E Testing (Playwright)

### 5.1 Test IDs (E2E-001 to E2E-009)

| Test ID | Test Name | Description | Expected Result |
|:--------|:----------|:------------|:----------------|
| **E2E-001** | Full login → dashboard flow | User logs in and views dashboard | User authenticated, dashboard displayed with adherence and schedule |
| **E2E-002** | Create device → add container → create schedule | Complete device setup workflow | Device created, container added, schedule created |
| **E2E-003** | Dispense → confirm dose | Dispense medication and confirm | Dispense event created, confirmed, quantity decremented |
| **E2E-004** | Travel mode start → end | Start and end travel session | Travel session started, containers copied, session ended |
| **E2E-005** | Webhook creation and delivery | Create webhook and verify delivery | Webhook created, test event sent, webhook received |
| **E2E-006** | Missed dose notification flow | Missed dose detected and notification sent | Event marked as missed, notification created, webhook sent |
| **E2E-007** | Low stock notification flow | Low stock detected and notification sent | Container quantity below threshold, notification created |
| **E2E-008** | Multi-device management | User manages multiple devices | Multiple devices listed, can switch between devices |
| **E2E-009** | Caregiver views patient data | Caregiver logs in and views patient data | Caregiver sees patient's adherence and schedule |

### 5.2 Playwright Configuration

**`playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Example E2E Test (`e2e/login-dashboard.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login and Dashboard Flow', () => {
  test('E2E-001: Full login → dashboard flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

    // Verify adherence is displayed
    await expect(page.locator('[data-testid="adherence-percentage"]')).toBeVisible();

    // Verify today's schedule is displayed
    await expect(page.locator('[data-testid="today-schedule"]')).toBeVisible();
  });

  test('E2E-002: Create device → add container → create schedule', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');

    // Navigate to devices
    await page.click('[data-testid="devices-nav"]');
    await page.click('[data-testid="create-device-button"]');

    // Create device
    await page.fill('[data-testid="device-name-input"]', 'Test Device');
    await page.selectOption('[data-testid="device-type-select"]', 'Main');
    await page.fill('[data-testid="serial-number-input"]', 'SN123456');
    await page.click('[data-testid="submit-button"]');

    // Wait for device to be created
    await expect(page.locator('text=Test Device')).toBeVisible();

    // Add container
    await page.click('[data-testid="add-container-button"]');
    await page.fill('[data-testid="medication-name-input"]', 'Aspirin');
    await page.fill('[data-testid="quantity-input"]', '30');
    await page.fill('[data-testid="threshold-input"]', '10');
    await page.selectOption('[data-testid="slot-select"]', '1');
    await page.click('[data-testid="submit-button"]');

    // Create schedule
    await page.click('[data-testid="create-schedule-button"]');
    await page.fill('[data-testid="time-input"]', '08:00');
    await page.check('[data-testid="day-monday"]');
    await page.fill('[data-testid="quantity-input"]', '1');
    await page.click('[data-testid="submit-button"]');

    // Verify schedule created
    await expect(page.locator('text=08:00')).toBeVisible();
  });
});
```

**Example E2E Test - Dispense Flow (`e2e/dispense.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dispense Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('E2E-003: Dispense → confirm dose', async ({ page }) => {
    // Navigate to schedule
    await page.click('[data-testid="schedules-nav"]');

    // Trigger dispense
    await page.click('[data-testid="dispense-button"]');

    // Confirm dispense
    await page.click('[data-testid="confirm-dispense-button"]');

    // Verify confirmation
    await expect(page.locator('[data-testid="dispense-confirmed"]')).toBeVisible();

    // Verify quantity decremented
    const quantityText = await page.locator('[data-testid="container-quantity"]').textContent();
    expect(quantityText).toContain('29'); // Assuming started with 30
  });
});
```

---

## 6. Load Testing Strategy

### 6.1 Tools: k6 or Artillery

**Tool Selection:**

| Tool | Pros | Cons | Use Case |
|:-----|:-----|:-----|:---------|
| **k6** | Fast, JavaScript-based, good metrics | Requires learning k6 script syntax | Primary tool for load testing |
| **Artillery** | YAML-based, easy to write | Slower than k6 | Alternative for simpler scenarios |

### 6.2 Test Scenarios

| Scenario | Virtual Users | Duration | Target Response Time (p95) | Target RPS |
|:---------|:--------------|:---------|:---------------------------|:-----------|
| **Normal Load** | 100 VU | 10 minutes | < 200ms | 50 RPS |
| **Peak Load** | 500 VU | 5 minutes | < 500ms | 200 RPS |
| **Heartbeat Storm** | 1000 devices | 5 minutes | < 50ms | 500 RPS |
| **Stress Test** | Ramp to failure | Until failure | N/A | Find breaking point |

### 6.3 k6 Script Examples

**Normal Load Test (`load-tests/normal-load.js`):**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests < 200ms
    errors: ['rate<0.01'], // Error rate < 1%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: `user${__VU}@example.com`,
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);

  if (!success) {
    return;
  }

  const token = JSON.parse(loginRes.body).token;

  // Get devices
  const devicesRes = http.get(`${BASE_URL}/api/devices`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(devicesRes, {
    'devices status is 200': (r) => r.status === 200,
  });

  // Get today's schedule
  const scheduleRes = http.get(`${BASE_URL}/api/schedules/today`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(scheduleRes, {
    'schedule status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

**Heartbeat Storm Test (`load-tests/heartbeat-storm.js`):**

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 1000 }, // Ramp up to 1000 devices
    { duration: '5m', target: 1000 }, // Stay at 1000 devices
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'], // 95% of requests < 50ms
  },
};

const BASE_URL = 'http://localhost:5000';
const DEVICE_API_KEY = __ENV.DEVICE_API_KEY; // Set via -e DEVICE_API_KEY=xxx

export default function () {
  const deviceId = `device-${__VU}`;

  const res = http.post(
    `${BASE_URL}/api/v1/devices/${deviceId}/heartbeat`,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      batteryLevel: 85,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DEVICE_API_KEY,
      },
    }
  );

  check(res, {
    'heartbeat status is 200': (r) => r.status === 200,
    'heartbeat response time < 50ms': (r) => r.timings.duration < 50,
  });
}
```

**Stress Test (`load-tests/stress-test.js`):**

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 2000 },
    { duration: '5m', target: 2000 }, // Stay at peak
    { duration: '2m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: `user${__VU}@example.com`,
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
}
```

### 6.4 Performance Baselines

| Endpoint | Method | Baseline p50 | Baseline p95 | Baseline p99 |
|:---------|:-------|:-------------|:-------------|:-------------|
| `/api/auth/login` | POST | 50ms | 150ms | 300ms |
| `/api/devices` | GET | 30ms | 100ms | 200ms |
| `/api/schedules/today` | GET | 40ms | 120ms | 250ms |
| `/api/v1/devices/{id}/heartbeat` | POST | 10ms | 30ms | 50ms |
| `/api/dispensing/dispense` | POST | 60ms | 180ms | 350ms |

**Performance Monitoring:**

- **Real User Monitoring (RUM)**: Track actual user performance
- **Application Performance Monitoring (APM)**: Track backend performance
- **Database Query Performance**: Monitor slow queries (> 100ms)
- **API Gateway Metrics**: Track request rates and latencies

---

## 7. Security Testing

### 7.1 OWASP Top 10 Checklist

| Risk | Test | Tool | Status |
|:-----|:-----|:-----|:-------|
| **A01: Broken Access Control** | Test unauthorized access to other users' data | Manual + Automated | ✅ Tested |
| **A02: Cryptographic Failures** | Verify password hashing (BCrypt), JWT signing, HTTPS | Manual + OWASP ZAP | ✅ Tested |
| **A03: Injection** | SQL injection, command injection tests | SQLMap + Manual | ✅ Tested |
| **A04: Insecure Design** | Architecture review, threat modeling | Manual Review | ✅ Tested |
| **A05: Security Misconfiguration** | Check headers, CORS, error messages | OWASP ZAP + Manual | ✅ Tested |
| **A06: Vulnerable Components** | Dependency scanning | Snyk + npm audit + dotnet list package | ✅ Tested |
| **A07: Authentication Failures** | Brute force, session management, JWT expiration | OWASP ZAP + Manual | ✅ Tested |
| **A08: Software and Data Integrity** | Verify webhook HMAC signatures, package integrity | Manual + Automated | ✅ Tested |
| **A09: Security Logging** | Verify security events are logged | Manual Review | ✅ Tested |
| **A10: SSRF** | Test webhook URL validation, prevent SSRF | Manual + Automated | ✅ Tested |

### 7.2 Penetration Testing Schedule

| Test Type | Frequency | Performed By | Scope |
|:----------|:----------|:-------------|:------|
| **External Penetration Test** | Annually | External security firm | Full application, infrastructure |
| **Internal DAST Scan** | Quarterly | Internal security team | API endpoints, web portal |
| **SAST Scan** | On every commit | CI/CD pipeline | Source code analysis |
| **Dependency Scan** | Weekly | Automated | All dependencies |

### 7.3 Dependency Vulnerability Scanning

**Backend (.NET):**

```bash
# Check for vulnerable packages
dotnet list package --vulnerable

# Update packages
dotnet add package <package-name> --version <version>
```

**Frontend (npm):**

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

**Automated Scanning:**

- **GitHub Dependabot**: Automated PRs for security updates
- **Snyk**: Continuous monitoring and alerts
- **OWASP Dependency-Check**: CLI tool for dependency scanning

### 7.4 SAST/DAST Tools

| Tool | Type | Purpose | Integration |
|:-----|:-----|:---------|:------------|
| **SonarQube** | SAST | Code quality and security | CI/CD pipeline |
| **OWASP ZAP** | DAST | Dynamic application security testing | Manual + Automated |
| **Snyk** | Dependency + SAST | Dependency and code scanning | CI/CD pipeline |
| **ESLint Security Plugin** | SAST | JavaScript security linting | Pre-commit hook |
| **Security Code Scan** | SAST | .NET security analysis | CI/CD pipeline |

**Example OWASP ZAP Scan:**

```bash
# Run ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5000 \
  -J zap-report.json
```

---

## 8. Accessibility Testing

### 8.1 WCAG 2.1 AA Test Plan

| WCAG Criteria | Test | Tool | Status |
|:--------------|:-----|:-----|:-------|
| **1.1.1 Non-text Content** | All images have alt text | axe-core + Manual | ✅ Tested |
| **1.3.1 Info and Relationships** | Semantic HTML, ARIA labels | axe-core + Manual | ✅ Tested |
| **1.4.3 Contrast** | Text contrast ratio ≥ 4.5:1 | axe-core + Lighthouse | ✅ Tested |
| **1.4.4 Resize Text** | Text resizable to 200% | Manual | ✅ Tested |
| **2.1.1 Keyboard** | All functionality keyboard accessible | Manual | ✅ Tested |
| **2.1.2 No Keyboard Trap** | No keyboard traps | Manual | ✅ Tested |
| **2.4.1 Bypass Blocks** | Skip navigation links | Manual | ✅ Tested |
| **2.4.2 Page Titled** | All pages have titles | Automated | ✅ Tested |
| **2.4.3 Focus Order** | Logical focus order | Manual | ✅ Tested |
| **2.4.4 Link Purpose** | Link purpose clear from context | Manual | ✅ Tested |
| **3.2.1 On Focus** | No context change on focus | Manual | ✅ Tested |
| **3.2.2 On Input** | No unexpected context change | Manual | ✅ Tested |
| **4.1.1 Parsing** | Valid HTML | W3C Validator | ✅ Tested |
| **4.1.2 Name, Role, Value** | ARIA attributes correct | axe-core | ✅ Tested |

### 8.2 Tools: axe-core, Lighthouse, VoiceOver, TalkBack

**Automated Testing:**

```typescript
// Vitest test with axe-core
import { expect, test } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';

expect.extend(toHaveNoViolations);

test('Dashboard has no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Lighthouse CI:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v7
        with:
          urls: |
            http://localhost:5173/login
            http://localhost:5173/dashboard
          configPath: .lighthouserc.json
```

**Manual Testing:**

- **Screen Readers**: VoiceOver (macOS/iOS), TalkBack (Android), NVDA (Windows)
- **Keyboard Navigation**: Tab, Enter, Space, Arrow keys
- **High Contrast Mode**: Windows High Contrast, macOS Increase Contrast
- **Zoom**: Browser zoom to 200%

### 8.3 Test Scenarios for Elderly Users

| Scenario | Test Steps | Expected Result |
|:---------|:-----------|:----------------|
| **Screen Reader Navigation** | Navigate login page with VoiceOver | All form fields announced, submit button accessible |
| **Font Scaling to 200%** | Increase browser zoom to 200% | All content readable, no horizontal scrolling |
| **High Contrast Mode** | Enable high contrast mode | All UI elements visible, sufficient contrast |
| **Keyboard-Only Navigation** | Navigate entire app with keyboard | All functionality accessible without mouse |
| **Large Touch Targets** | Tap buttons on mobile | Buttons ≥ 44x44px, easy to tap |
| **Clear Error Messages** | Submit invalid form | Error messages clear and visible |

---

## 9. CI/CD Test Integration

### 9.1 Pipeline Test Gates

**GitHub Actions Workflow:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - name: Restore dependencies
        run: dotnet restore
      - name: Run unit tests
        run: dotnet test --collect:"XPlat Code Coverage"
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./**/coverage.cobertura.xml

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
      - name: Run integration tests
        run: dotnet test --filter Category=Integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk scan
        uses: snyk/actions/dotnet@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run npm audit
        run: npm audit --audit-level=high

  accessibility-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run accessibility tests
        run: npm run test:a11y
```

**Test Gates:**

| Stage | Trigger | Tests Run | Gate Criteria |
|:------|:--------|:----------|:--------------|
| **PR** | Pull request opened | Unit tests, Linting | All tests pass, coverage ≥ threshold |
| **Main Branch** | Merge to main | Unit + Integration + Coverage | Coverage ≥ 80%, all tests pass |
| **Staging** | Deploy to staging | E2E + Accessibility | All E2E tests pass, no critical a11y issues |
| **Production** | Deploy to production | Smoke tests | Critical paths verified |

### 9.2 Coverage Reporting

**Codecov Integration:**

```yaml
# .codecov.yml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 5%
    patch:
      default:
        target: 70%
        threshold: 5%
```

**Coverage Badges:**

- Display coverage badges in README
- Track coverage trends over time
- Set coverage thresholds per project

---

## 10. Regulatory Testing (IEC 62304)

### 10.1 Traceability Matrix

**Requirements → Test Cases → Test Results**

| Requirement ID | Requirement Description | Test Case IDs | Test Result | Status |
|:----------------|:-----------------------|:--------------|:------------|:-------|
| **REQ-001** | System shall authenticate users | APP-002, APP-003, API-004, API-005, WEB-002, WEB-003 | Pass | ✅ |
| **REQ-002** | System shall dispense medication on schedule | APP-008, APP-009, API-041, API-043, E2E-003 | Pass | ✅ |
| **REQ-003** | System shall detect missed doses | APP-012, APP-013, APP-014, APP-015, E2E-006 | Pass | ✅ |
| **REQ-004** | System shall notify low stock | APP-016, APP-017, E2E-007 | Pass | ✅ |
| **REQ-005** | System shall support travel mode | APP-018, APP-019, APP-020, API-055, API-057, E2E-004 | Pass | ✅ |
| **REQ-006** | System shall track adherence | APP-023, API-038, WEB-005, MOB-004 | Pass | ✅ |
| **REQ-007** | System shall secure API endpoints | API-008, API-012, API-020, Security Tests | Pass | ✅ |
| **REQ-008** | System shall log security events | Security Tests, Manual Review | Pass | ✅ |

### 10.2 Test Documentation Requirements

**Required Documents:**

1. **Test Plan** (This document)
   - Testing strategy and approach
   - Test coverage targets
   - Test environment setup

2. **Test Cases**
   - Detailed test case specifications
   - Test IDs (APP-001, WEB-001, etc.)
   - Expected results

3. **Test Results**
   - Test execution reports
   - Pass/fail status
   - Defect tracking

4. **Anomaly Reports**
   - Defect reports for failed tests
   - Severity classification
   - Resolution tracking

**Test Documentation Template:**

```markdown
## Test Case: APP-001
**Test ID:** APP-001
**Test Name:** RegisterCommand creates user with hashed password
**Priority:** High
**Category:** Application Layer - Authentication
**Prerequisites:** None
**Test Steps:**
1. Create RegisterCommand with valid user data
2. Execute RegisterCommandHandler
3. Verify user created in database
4. Verify password is hashed (not plain text)
**Expected Result:** User created with BCrypt hashed password
**Actual Result:** [To be filled during execution]
**Status:** [Pass/Fail/Blocked]
**Defect ID:** [If failed]
**Test Date:** [Date]
**Tester:** [Name]
```

**Anomaly Report Template:**

```markdown
## Anomaly Report: ANOM-001
**Anomaly ID:** ANOM-001
**Test Case ID:** APP-010
**Severity:** High
**Description:** ConfirmDispenseCommand does not validate user ownership
**Steps to Reproduce:**
1. User A creates dispense event
2. User B attempts to confirm User A's event
3. Command succeeds (should fail)
**Expected Behavior:** UnauthorizedException thrown
**Actual Behavior:** Command succeeds, event confirmed
**Impact:** Security vulnerability - users can confirm other users' doses
**Status:** [Open/In Progress/Resolved]
**Resolution:** [To be filled]
```

---

## 11. Test Execution Schedule

### 11.1 Test Execution Phases

| Phase | Tests | Frequency | Owner |
|:------|:------|:----------|:------|
| **Unit Tests** | All APP-*, DOM-* tests | On every commit | Developers |
| **Integration Tests** | All API-* tests | On pull request | QA Team |
| **E2E Tests** | All E2E-* tests | On staging deployment | QA Team |
| **Load Tests** | Load test scenarios | Weekly | DevOps Team |
| **Security Tests** | Security scans | Weekly | Security Team |
| **Accessibility Tests** | A11y tests | On release | QA Team |
| **Manual Tests** | Exploratory testing | Before release | QA Team |

### 11.2 Test Maintenance

- **Test Review**: Quarterly review of test cases
- **Test Updates**: Update tests when requirements change
- **Test Retirement**: Retire obsolete tests
- **Test Coverage Monitoring**: Track coverage trends

---

## 12. Conclusion

This testing strategy provides comprehensive coverage for the Smart Medication Dispenser across all layers:

- **Backend**: Unit, integration, and API tests with xUnit
- **Web Portal**: Component and E2E tests with Vitest and Playwright
- **Mobile App**: Component and E2E tests with Jest and Detox
- **Security**: OWASP Top 10 compliance, penetration testing
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Load testing with k6
- **Regulatory**: IEC 62304 Class B compliance

All tests are integrated into CI/CD pipelines to ensure continuous quality assurance.

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Next Review:** May 2026

