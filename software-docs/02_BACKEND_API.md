# Backend API Reference

**Smart Medication Dispenser — ASP.NET Core 8 Web API**

**Version 2.1 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.1 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | Backend Engineers |
| **Related Documents** | [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md), [03_DATABASE.md](./03_DATABASE.md), [07_AUTHENTICATION.md](./07_AUTHENTICATION.md), [08_INTEGRATIONS_WEBHOOKS.md](./08_INTEGRATIONS_WEBHOOKS.md), [14_DEVICE_CLOUD_PROTOCOL.md](./14_DEVICE_CLOUD_PROTOCOL.md) |

---

## 1. Overview

The backend is an **ASP.NET Core 8 Web API** built with Clean Architecture. It exposes two API layers:

| API Layer | Base Path | Auth Method | Consumers |
|:----------|:----------|:------------|:----------|
| **User/App API** | `/api/*` | JWT Bearer (email/password login) | Web portal, Mobile app |
| **Device API** | `/api/v1/*` | Device JWT or X-API-Key header | ESP32 firmware |

### Base URLs

| Environment | URL |
|:------------|:----|
| Development | `http://localhost:5000` |
| Docker | `http://localhost:5000` |
| Swagger UI | `http://localhost:5000/swagger` |

---

## 2. User/App API — Complete Endpoint Reference

### 2.1 Authentication (`AuthController`)

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login with email/password |
| GET | `/api/auth/me` | JWT | Get current user (id, email, name, role) |
| PUT | `/api/auth/me` | JWT | Update profile (name, caregiver) |
| GET | `/api/auth/me/profile` | JWT | Get profile with owned device list |
| GET | `/api/auth/me/export` | JWT | GDPR user data export |

#### POST `/api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "Patient"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "Patient",
  "userId": "a1b2c3d4-..."
}
```

**Errors:** `400` — Email already exists or validation failed.

#### POST `/api/auth/login`

**Request:**
```json
{
  "email": "patient@demo.com",
  "password": "Demo123!"
}
```

**Response (200):** Same as register response (AuthResponse).

**Errors:** `401` — Invalid email or password.

#### GET `/api/auth/me`

**Headers:** `Authorization: Bearer <jwt>`

**Response (200):**
```json
{
  "id": "a1b2c3d4-...",
  "email": "patient@demo.com",
  "fullName": "Demo Patient",
  "role": "Patient"
}
```

#### GET `/api/auth/me/profile`

**Headers:** `Authorization: Bearer <jwt>`

**Response (200):**
```json
{
  "userId": "a1b2c3d4-...",
  "email": "patient@demo.com",
  "fullName": "Demo Patient",
  "role": "Patient",
  "devices": [
    { "deviceId": "d1e2f3...", "name": "Home Dispenser", "type": "Main", "status": "Active" },
    { "deviceId": "d4e5f6...", "name": "Travel Dispenser", "type": "Portable", "status": "Paused" }
  ]
}
```

#### PUT `/api/auth/me`

**Headers:** `Authorization: Bearer <jwt>`

**Request:** Update profile (name, caregiver).
```json
{
  "fullName": "John Doe",
  "caregiverUserId": "b2c3d4e5-..." 
}
```

**Response (200):** Updated user/profile representation.

#### GET `/api/auth/me/export`

**Headers:** `Authorization: Bearer <jwt>`

**Response (200):** GDPR user data export (Profile, Devices, DispenseEvents, Notifications, ExportedAtUtc). See §16 Data Export API.

---

### 2.2 Devices (`DevicesController`)

All endpoints require JWT Bearer authentication. User can only access their own devices.

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/devices` | List all user's devices |
| GET | `/api/devices/{id}` | Get single device |
| POST | `/api/devices` | Create a new device |
| PATCH | `/api/devices/{id}/pause` | Pause dispensing |
| PATCH | `/api/devices/{id}/resume` | Resume dispensing |
| POST | `/api/devices/{id}/heartbeat` | Record device heartbeat |

#### POST `/api/devices`

**Request:**
```json
{
  "name": "Home Dispenser",
  "type": "Main",
  "timeZoneId": "Europe/Zurich"
}
```

**Response (201) — DeviceDto:**
```json
{
  "id": "d1e2f3...",
  "userId": "a1b2c3...",
  "name": "Home Dispenser",
  "type": "Main",
  "status": "Active",
  "timeZoneId": "Europe/Zurich",
  "lastHeartbeatAtUtc": null,
  "firmwareVersion": null,
  "isOnline": false,
  "batteryLevel": null,
  "wifiSignal": null,
  "temperature": null,
  "humidity": null
}
```

#### GET `/api/devices/{id}`

**Response (200) — DeviceDto:** Same shape as list; returns device summary (no containers).
```json
{
  "id": "d1e2f3...",
  "userId": "a1b2c3...",
  "name": "Home Dispenser",
  "type": "Main",
  "status": "Active",
  "timeZoneId": "Europe/Zurich",
  "lastHeartbeatAtUtc": "2026-02-10T08:30:00Z",
  "firmwareVersion": "2.1.0",
  "isOnline": true,
  "batteryLevel": 85,
  "wifiSignal": -45,
  "temperature": null,
  "humidity": null
}
```

#### PATCH `/api/devices/{id}/pause`

**Response (200):** DeviceDto with `status: "Paused"`

#### PATCH `/api/devices/{id}/resume`

**Response (200):** DeviceDto with `status: "Active"`

#### POST `/api/devices/{id}/heartbeat`

**Response:** `204 No Content`

---

### 2.3 Containers (`ContainersController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/devices/{deviceId}/containers` | List containers for device |
| GET | `/api/containers/{id}` | Get single container |
| POST | `/api/devices/{deviceId}/containers` | Create a container |
| PUT | `/api/containers/{id}` | Update a container |
| DELETE | `/api/containers/{id}` | Delete a container |

#### POST `/api/devices/{deviceId}/containers`

**Request:**
```json
{
  "slotNumber": 1,
  "medicationName": "Metformin 500mg",
  "medicationImageUrl": null,
  "quantity": 90,
  "pillsPerDose": 2,
  "lowStockThreshold": 14,
  "sourceContainerId": null
}
```

**Response (201):**
```json
{
  "id": "c1d2e3...",
  "deviceId": "d1e2f3...",
  "slotNumber": 1,
  "medicationName": "Metformin 500mg",
  "medicationImageUrl": null,
  "quantity": 90,
  "pillsPerDose": 2,
  "lowStockThreshold": 14,
  "sourceContainerId": null
}
```

#### PUT `/api/containers/{id}`

**Request:**
```json
{
  "slotNumber": 1,
  "medicationName": "Metformin 500mg",
  "medicationImageUrl": null,
  "quantity": 85,
  "pillsPerDose": 2,
  "lowStockThreshold": 14
}
```

---

### 2.4 Schedules (`SchedulesController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/containers/{containerId}/schedules` | List schedules for container |
| GET | `/api/schedules/{id}` | Get single schedule |
| POST | `/api/containers/{containerId}/schedules` | Create a schedule |
| PUT | `/api/schedules/{id}` | Update a schedule |
| DELETE | `/api/schedules/{id}` | Delete a schedule |
| GET | `/api/devices/{deviceId}/today-schedule` | Get today's scheduled doses |

#### POST `/api/containers/{containerId}/schedules`

**Request:**
```json
{
  "timeOfDay": "08:00",
  "daysOfWeekBitmask": 127,
  "startDate": "2026-02-01T00:00:00Z",
  "endDate": null,
  "notes": "Take with breakfast",
  "timeZoneId": "Europe/Zurich"
}
```

**Days of Week Bitmask:**

| Bit | Day | Value |
|:----|:----|:------|
| 0 | Sunday | 1 |
| 1 | Monday | 2 |
| 2 | Tuesday | 4 |
| 3 | Wednesday | 8 |
| 4 | Thursday | 16 |
| 5 | Friday | 32 |
| 6 | Saturday | 64 |
| All | Every day | 127 |
| Weekdays | Mon-Fri | 62 |
| Weekends | Sat-Sun | 65 |

#### GET `/api/devices/{deviceId}/today-schedule?timeZoneId=Europe/Zurich`

**Response (200):**
```json
[
  {
    "scheduleId": "s1a2b3...",
    "containerId": "c1d2e3...",
    "slotNumber": 1,
    "medicationName": "Metformin 500mg",
    "medicationImageUrl": null,
    "pillsPerDose": 2,
    "scheduledAtUtc": "2026-02-10T07:00:00Z",
    "notes": "Take with breakfast"
  }
]
```

---

### 2.5 Dispensing (`DispensingController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/api/devices/{deviceId}/dispense` | Trigger medication dispense |
| POST | `/api/dispense-events/{id}/confirm` | Confirm dose intake (taken) |
| POST | `/api/dispense-events/{id}/delay` | Delay reminder by N minutes |

#### POST `/api/devices/{deviceId}/dispense`

**Request:**
```json
{
  "scheduleId": "s1a2b3..."
}
```

**Response (200):**
```json
{
  "id": "e1f2g3...",
  "deviceId": "d1e2f3...",
  "containerId": "c1d2e3...",
  "scheduleId": "s1a2b3...",
  "scheduledAtUtc": "2026-02-10T07:00:00Z",
  "status": "Dispensed",
  "dispensedAtUtc": "2026-02-10T07:00:05Z",
  "confirmedAtUtc": null,
  "missedMarkedAtUtc": null,
  "medicationName": "Metformin 500mg",
  "pillsPerDose": 2
}
```

#### POST `/api/dispense-events/{id}/confirm`

**Response (200):** DispenseEventDto with `status: "Confirmed"`, `confirmedAtUtc` set.

#### POST `/api/dispense-events/{id}/delay`

**Request:**
```json
{
  "minutes": 15
}
```

**Response (200):** DispenseEventDto with `status: "Delayed"`.

---

### 2.6 History (`HistoryController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/devices/{deviceId}/events` | Get dispense event history |

**Query Parameters:**

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| `fromUtc` | DateTime? | null | Start date filter |
| `toUtc` | DateTime? | null | End date filter |
| `limit` | int | 100 | Max results |

**Response (200):** Array of DispenseEventDto objects.

---

### 2.7 Adherence (`PatientsController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/patients/me/adherence` | Get adherence summary |

**Query Parameters:** `fromUtc`, `toUtc` (optional date range).

**Response (200):**
```json
{
  "totalScheduled": 28,
  "confirmed": 25,
  "missed": 2,
  "pending": 1,
  "adherencePercent": 89.3
}
```

---

### 2.8 Notifications (`NotificationsController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/notifications?limit=50` | List notifications |
| GET | `/api/notifications/preferences` | Get notification preferences |
| PUT | `/api/notifications/preferences` | Update notification preferences |
| POST | `/api/notifications/{id}/read` | Mark notification as read |

**Mark as read:** POST `/api/notifications/{id}/read` returns **204 No Content**.

**List response (200):**
```json
[
  {
    "id": "n1a2b3...",
    "type": "MissedDose",
    "title": "Missed dose",
    "body": "A scheduled dose was not confirmed in time.",
    "isRead": false,
    "createdAtUtc": "2026-02-10T08:05:00Z"
  }
]
```

---

### 2.9 Travel (`TravelController`)

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/api/travel/start` | Start travel session |
| POST | `/api/travel/end` | End travel session |

#### POST `/api/travel/start`

**Request:**
```json
{
  "portableDeviceId": "d4e5f6...",
  "days": 7
}
```

**Response (200):**
```json
{
  "id": "t1a2b3...",
  "mainDeviceId": "d1e2f3...",
  "portableDeviceId": "d4e5f6...",
  "startedAtUtc": "2026-02-10T10:00:00Z",
  "endedAtUtc": null,
  "plannedEndDateUtc": "2026-02-17T10:00:00Z"
}
```

**Business Rules:**
- Max 14 days per travel session
- Copies containers from main device to portable device
- Pauses main device, activates portable device
- Only one active travel session per user

#### POST `/api/travel/end`

Ends the current active travel session. Returns TravelSessionDto with `endedAtUtc` set.

---

### 2.10 Integrations (`IntegrationsController`)

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/api/integrations/webhooks` | JWT | List outgoing webhooks |
| POST | `/api/integrations/webhooks` | JWT | Create webhook endpoint |
| DELETE | `/api/integrations/webhooks/{id}` | JWT | Delete webhook endpoint |
| GET | `/api/integrations/devices/{deviceId}/api-keys` | JWT | List API keys for device |
| POST | `/api/integrations/devices/{deviceId}/api-keys` | JWT | Create API key |
| DELETE | `/api/integrations/devices/{deviceId}/api-keys/{apiKeyId}` | JWT | Revoke API key |
| POST | `/api/integrations/sync` | X-API-Key | Sync data from cloud |
| POST | `/api/webhooks/incoming` | X-API-Key | Incoming webhook (X-API-Key header) |

See [08_INTEGRATIONS_WEBHOOKS.md](./08_INTEGRATIONS_WEBHOOKS.md) for detailed integration documentation.

---

## 3. Device API — Complete Endpoint Reference

The Device API (`/api/v1/*`) is designed for ESP32 firmware communication with the cloud backend. **All Device API request/response JSON uses snake_case** (e.g. `device_id`, `firmware_version`, `api_endpoint`, `heartbeat_interval`, `token_expires_at`, `wifi_signal`) via JsonPropertyName attributes.

### 3.1 Endpoints

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| POST | `/api/v1/devices/register` | None | Register new device |
| POST | `/api/v1/devices/{deviceId}/heartbeat` | Device Token / X-API-Key | Send heartbeat |
| GET | `/api/v1/devices/{deviceId}/schedule` | Device Token / X-API-Key | Get medication schedule |
| POST | `/api/v1/devices/{deviceId}/schedule/confirm` | Device Token / X-API-Key | Confirm schedule received |
| POST | `/api/v1/events` | Device Token / X-API-Key | Send device event |
| POST | `/api/v1/devices/{deviceId}/inventory` | Device Token / X-API-Key | Sync inventory |
| POST | `/api/v1/devices/{deviceId}/error` | Device Token / X-API-Key | Report error |
| GET | `/api/v1/devices/{deviceId}/firmware` | Device Token / X-API-Key | Check firmware update |
| POST | `/api/v1/devices/{deviceId}/firmware/status` | Device Token / X-API-Key | Report firmware update status |
| GET | `/api/v1/ping` | Device Token / X-API-Key | Simple connectivity check |

### 3.2 Device Registration

**POST `/api/v1/devices/register`**

Device API uses **snake_case** JSON (JsonPropertyName attributes). Request:

```json
{
  "device_id": "SMD-100-ABCD1234",
  "device_type": "SMD-100",
  "firmware_version": "1.0.0",
  "hardware_version": "2.0",
  "mac_address": "AA:BB:CC:DD:EE:FF"
}
```

**Response:**
```json
{
  "success": true,
  "device_token": "device_token_...",
  "api_endpoint": "https://api.smartdispenser.ch/api/v1",
  "heartbeat_interval": 60,
  "token_expires_at": "2026-03-10T12:00:00Z"
}
```

### 3.3 Heartbeat

**POST `/api/v1/devices/{deviceId}/heartbeat`**

Slots use `slot`, `medication`, `pills`. Request (snake_case):

```json
{
  "battery": 85,
  "wifi_signal": -45,
  "temperature": 22.5,
  "humidity": 45,
  "slots": [
    { "slot": 1, "medication": "Metformin 500mg", "pills": 87 },
    { "slot": 2, "medication": "Lisinopril 10mg", "pills": 55 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "server_time": "2026-02-10T12:00:00Z",
  "commands": [],
  "next_heartbeat": 60
}
```

### 3.4 Device Events

**POST `/api/v1/events`**

Request (snake_case):

```json
{
  "device_id": "d1e2f3...",
  "event": "DOSE_DISPENSED",
  "timestamp": "2026-02-10T08:00:05Z",
  "data": {
    "slot": 1,
    "pills_dispensed": 2,
    "schedule_id": "s1a2b3..."
  }
}
```

**Supported Event Types:**

| Event | Description | Priority |
|:------|:------------|:---------|
| `DOSE_DISPENSED` | Pills released from slot | High |
| `DOSE_TAKEN` | Pills removed from tray (weight sensor) | High |
| `DOSE_MISSED` | Time window expired | Critical |
| `REFILL_NEEDED` | < 7 days of pills remaining | Medium |
| `REFILL_CRITICAL` | < 3 days of pills remaining | High |
| `DEVICE_ONLINE` | Connection established | Low |
| `DEVICE_OFFLINE` | Heartbeat timeout | Medium |
| `DEVICE_ERROR` | Hardware/software error | High |
| `BATTERY_LOW` | Battery < 20% | Medium |
| `BATTERY_CRITICAL` | Battery < 5% | High |
| `TRAVEL_MODE_ON` | Travel mode activated | Medium |
| `TRAVEL_MODE_OFF` | Travel mode deactivated | Medium |

---

## 4. Error Handling

### 4.1 Global Exception Middleware

All unhandled exceptions are caught by `GlobalExceptionMiddleware` and returned as consistent JSON:

```json
{
  "message": "Error description",
  "detail": "Error description"
}
```

In development mode, `stackTrace` is also included for 500 errors.

### 4.2 HTTP Status Code Reference

| Status | Meaning | When Used |
|:-------|:--------|:----------|
| 200 | OK | Successful read or update |
| 201 | Created | Resource created (with Location header) |
| 202 | Accepted | Webhook/event accepted for processing |
| 204 | No Content | Successful delete or heartbeat |
| 400 | Bad Request | Validation failure or business rule violation |
| 401 | Unauthorized | Missing or invalid JWT / API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found or not owned by user |
| 500 | Internal Server Error | Unhandled exception |

### 4.3 Validation Errors

FluentValidation errors return structured error messages:

```json
{
  "message": "Email is required. Password must be at least 6 characters.",
  "detail": "Email is required. Password must be at least 6 characters."
}
```

---

## 5. Swagger / OpenAPI

Swagger UI is available in development at `http://localhost:5000/swagger`.

### Features:
- **Try it out** — Execute API calls directly from the browser
- **Authorization** — Click "Authorize" and paste a JWT token to test protected endpoints
- **Schemas** — All request/response DTOs are documented
- **Endpoints** — All 40+ endpoints are listed with descriptions

### Getting a JWT for Swagger:

1. Call `POST /api/auth/login` with demo credentials
2. Copy the `token` from the response
3. Click "Authorize" in Swagger UI
4. Enter `Bearer <token>` (include the "Bearer " prefix)
5. All subsequent requests will include the JWT

---

## 6. Configuration

### 6.1 appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dispenser;Username=dispenser;Password=dispenser_secret"
  },
  "Jwt": {
    "SecretKey": "SmartMedicationDispenser_MVP_SecretKey_AtLeast32Characters!",
    "Issuer": "SmartMedicationDispenser",
    "Audience": "SmartMedicationDispenser"
  }
}
```

### 6.2 Environment Variables

All settings can be overridden via environment variables:

| Variable | Description | Default |
|:---------|:------------|:--------|
| `ConnectionStrings__DefaultConnection` | Database connection string | PostgreSQL localhost |
| `Jwt__SecretKey` | JWT signing key (min 32 chars) | Built-in dev key |
| `Jwt__Issuer` | JWT issuer claim | SmartMedicationDispenser |
| `Jwt__Audience` | JWT audience claim | SmartMedicationDispenser |
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | Development |
| `ASPNETCORE_URLS` | Listen URLs | http://localhost:5000 |

### 6.3 Database Auto-Detection

The backend auto-detects the database provider from the connection string:

- **SQLite**: Connection string starts with `Data Source=` → uses `UseSqlite()`
- **PostgreSQL**: Any other format → uses `UseNpgsql()`

This allows seamless switching between local development (SQLite) and production (PostgreSQL).

---

## 7. Rate Limiting

### 7.1 Rate Limiting Strategy

| Client Type | Window | Limit | Scope |
|:------------|:-------|:------|:------|
| **Authenticated user** | 1 minute | 120 requests | Per user (JWT nameid claim) |
| **Device API** | 1 minute | 30 requests | Per device (API key) |
| **Anonymous** | 1 minute | 20 requests | Per IP address |
| **Login/Register** | 15 minutes | 10 attempts | Per IP address |

### 7.2 Implementation (ASP.NET Core Rate Limiting)

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            return RateLimitPartition.GetFixedWindowLimiter(userId, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120, Window = TimeSpan.FromMinutes(1)
            });
        
        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20, Window = TimeSpan.FromMinutes(1)
            });
    });
    
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

app.UseRateLimiter();
```

### 7.3 Rate Limit Response

When rate limit is exceeded:
```
HTTP 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707566400
```

---

## 8. Pagination

### 8.1 Pagination (Planned Enhancement)

Current list endpoints return **plain lists** (no pagination). The following pattern is planned:

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| `page` | int | 1 | Page number (1-based) |
| `pageSize` | int | 20 | Items per page (max 100) |
| `sortBy` | string | `createdAtUtc` | Sort field |
| `sortDir` | string | `desc` | Sort direction (asc/desc) |

### 8.2 Paginated Response Format

```json
{
    "items": [...],
    "page": 1,
    "pageSize": 20,
    "totalCount": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
}
```

### 8.3 Paginated Endpoints (Planned Enhancement)

| Endpoint | Default Page Size | Max Page Size | Default Sort |
|:---------|:-----------------|:-------------|:-------------|
| GET `/api/devices` | 20 | 100 | createdAtUtc desc |
| GET `/api/notifications` | 50 | 100 | createdAtUtc desc |
| GET `/api/devices/{id}/events` | 50 | 200 | scheduledAtUtc desc |
| GET `/api/integrations/webhooks` | 20 | 50 | createdAtUtc desc |

### 8.4 Implementation

```csharp
// Application/Common/PaginatedRequest.cs
public class PaginatedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "createdAtUtc";
    public string SortDir { get; set; } = "desc";
}

// Application/Common/PaginatedResult.cs
public class PaginatedResult<T>
{
    public List<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
```

---

## 9. API Versioning

### 9.1 Versioning Strategy

| API Layer | Current Version | Strategy |
|:----------|:---------------|:---------|
| User/App API | v1 (implicit) | URL path versioning |
| Device API | v1 (explicit) | URL path versioning: `/api/v1/*` |

### 9.2 Version Lifecycle

| Phase | Duration | Description |
|:------|:---------|:------------|
| **Active** | Current | Receives features and bug fixes |
| **Maintenance** | 12 months | Bug fixes only |
| **Deprecated** | 6 months | No changes, deprecation warnings |
| **Retired** | End | Returns 410 Gone |

### 9.3 Deprecation Headers

When an API version enters deprecation:
```
Sunset: Sat, 01 Mar 2027 00:00:00 GMT
Deprecation: true
Link: <https://api.smartdispenser.ch/api/v2/docs>; rel="successor-version"
```

### 9.4 Breaking Change Policy

Changes that are NOT breaking (no version bump):
- Adding new optional fields to responses
- Adding new endpoints
- Adding new optional query parameters
- Adding new webhook event types

Changes that ARE breaking (require new version):
- Removing or renaming fields
- Changing field types
- Changing authentication requirements
- Removing endpoints
- Changing error response format

---

## 10. Health Check Endpoints

### 10.1 Endpoints

| Endpoint | Purpose | Auth |
|:---------|:--------|:-----|
| `GET /health` | Basic liveness check | Anonymous |
| `GET /health/live` | Liveness check (same as /health) | Anonymous |
| `GET /api/health/live` | Liveness check | Anonymous |
| `GET /health/ready` | Readiness check (DB, dependencies) | Anonymous |
| `GET /health/startup` | Startup probe (K8s) | Anonymous |
| `GET /api/health/startup` | Startup probe (K8s) | Anonymous |
| `GET /health/detailed` | Detailed component status | Anonymous |

### 10.2 Health Check Response

```json
{
    "status": "Healthy",
    "duration": "00:00:00.045",
    "checks": {
        "database": { "status": "Healthy", "duration": "12ms" },
        "diskSpace": { "status": "Healthy", "data": { "freeGb": 45.2 } },
        "memory": { "status": "Healthy", "data": { "usedMb": 256 } }
    }
}
```

### 10.3 Implementation

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "database", tags: ["ready"])
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"]);

app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

---

## 11. Request/Response Conventions

### 11.1 Standard Headers

| Header | Direction | Description |
|:-------|:----------|:------------|
| `Authorization` | Request | `Bearer {jwt}` for user auth |
| `X-API-Key` | Request | Device/machine auth |
| `X-Device-ID` | Request | Device identifier (firmware) |
| `X-Request-ID` | Request/Response | Correlation ID for tracing |
| `X-RateLimit-*` | Response | Rate limit information |
| `Content-Type` | Both | `application/json` |

### 11.2 Date/Time Format
- All timestamps in **ISO 8601 UTC**: `2026-02-10T08:00:00Z`
- Suffix `Utc` on all timestamp fields: `createdAtUtc`, `scheduledAtUtc`
- Client responsible for timezone conversion (using device's `timeZoneId`)

### 11.3 ID Format
- All entity IDs are **GUIDs** (UUID v4)
- Device IDs follow format: `SMD-{type}-{hex8}` (e.g., `SMD-100-ABCD1234`)

---

## 12. Device Provisioning Workflow

### 12.1 Complete Device Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                 DEVICE PROVISIONING LIFECYCLE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Factory                                                         │
│  ├── Flash firmware                                              │
│  ├── Write device ID to eFuse (SMD-XXXXXXXX)                   │
│  ├── Store provisioning token                                    │
│  └── Run production test suite                                   │
│                                                                  │
│  First Boot (Device)                                             │
│  ├── POST /api/v1/devices/register                              │
│  │   Body: { device_id, device_type, firmware_version, mac_address } (snake_case) │
│  ├── Receive: { device_token, api_endpoint, heartbeat_interval, token_expires_at } │
│  ├── Store token in NVS (encrypted)                             │
│  └── Begin heartbeat loop (60s)                                  │
│                                                                  │
│  User Onboarding (Mobile App)                                    │
│  ├── Scan QR code on device                                      │
│  ├── POST /api/devices { name, type, serialNumber }             │
│  ├── Backend links device to user account                        │
│  ├── User configures WiFi via BLE/touch                         │
│  └── Device starts normal operation                              │
│                                                                  │
│  Normal Operation                                                │
│  ├── Heartbeat every 60s (status + commands)                    │
│  ├── Dispense on schedule                                        │
│  ├── Report events (dose taken, errors, etc.)                   │
│  └── Check for firmware updates                                  │
│                                                                  │
│  Decommissioning                                                 │
│  ├── User deletes device in app                                 │
│  ├── Backend revokes device token                                │
│  ├── Device receives 401 → enters setup mode                    │
│  └── Factory reset (optional)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 QR Code Format

| Field | Format | Example |
|:------|:-------|:--------|
| Scheme | `smartdispenser://` | `smartdispenser://setup` |
| Device ID | `SMD-XXXXXXXX` | `SMD-00A1B2C3` |
| Type | `100` or `200` | `100` |
| Full URL | `smartdispenser://setup?id=SMD-00A1B2C3&type=100` | — |

---

## 13. OTA Firmware Update Workflow

### 13.1 Firmware Check

**GET `/api/v1/devices/{deviceId}/firmware?current_version=1.2.0`**

**Response (Update Available):**
```json
{
    "update_available": true,
    "current_version": "1.2.0",
    "new_version": "1.3.0",
    "download_url": "https://firmware.smartdispenser.ch/smd100/1.3.0/firmware.bin",
    "checksum": "a1b2c3d4e5f6...",
    "size_bytes": 1048576,
    "release_notes": "Bug fixes and performance improvements",
    "mandatory": false
}
```

**Response (No Update):**
```json
{
    "update_available": false,
    "current_version": "1.3.0",
    "message": "Firmware is up to date"
}
```

### 13.2 Update Status Reporting

**POST `/api/v1/devices/{deviceId}/firmware/status`**

Request (snake_case): uses `progress` (not `progress_percent`).

```json
{
    "version": "1.3.0",
    "status": "downloading",
    "progress": 45,
    "error": null
}
```

**Status Values:**

| Status | Description |
|:-------|:-----------|
| `downloading` | Binary download in progress |
| `verifying` | Checking SHA256 checksum and RSA signature |
| `installing` | Writing to inactive OTA partition |
| `completed` | Successfully updated and running new version |
| `failed` | Update failed (error field contains details) |
| `rolled_back` | Reverted to previous version |

### 13.3 Update Prerequisites

| Condition | Threshold | Enforcement |
|:----------|:----------|:------------|
| Battery level | > 30% | Device-side check |
| No upcoming dose | > 60 minutes | Device-side check |
| WiFi signal | > -70 dBm | Device-side check |
| Free storage | > 2 MB | Device-side check |
| User consent | Required (non-mandatory) | App confirms |

---

## 14. Travel Mode Detailed Workflow

### 14.1 Start Travel Sequence

```
Mobile App                              Backend API                         Devices
    │                                       │                                  │
    │ POST /api/travel/start                │                                  │
    │ { portableDeviceId, days: 7 }         │                                  │
    │──────────────────────────────────────▶│                                  │
    │                                       │                                  │
    │                                       │ 1. Validate: no active session   │
    │                                       │ 2. Validate: days ≤ 14          │
    │                                       │ 3. Validate: portable device     │
    │                                       │    exists and owned by user      │
    │                                       │                                  │
    │                                       │ 4. Copy containers:              │
    │                                       │    For each main device container │
    │                                       │    → Create portable container    │
    │                                       │    → Copy medication, pills/dose │
    │                                       │    → Set quantity for trip days  │
    │                                       │    → Link sourceContainerId     │
    │                                       │                                  │
    │                                       │ 5. Copy schedules:               │
    │                                       │    For each container's schedule  │
    │                                       │    → Create portable schedule    │
    │                                       │    → Set endDate = trip end date │
    │                                       │                                  │
    │                                       │ 6. Pause main device             │
    │                                       │ 7. Activate portable device      │
    │                                       │ 8. Create TravelSession record   │
    │                                       │                                  │
    │ 200 OK (TravelSessionDto)             │                                  │
    │◀──────────────────────────────────────│                                  │
    │                                       │                                  │
    │                                       │ Next heartbeat:                  │
    │                                       │ → Main device gets PAUSE command │
    │                                       │ → Portable gets SYNC_SCHEDULE   │
```

### 14.2 End Travel Sequence

```
1. POST /api/travel/end
2. Backend:
   a. Activate main device
   b. Pause portable device
   c. Reconcile inventory (update main container quantities)
   d. Set TravelSession.EndedAtUtc
   e. Delete portable containers and schedules
3. Next heartbeat: Main device gets RESUME + SYNC_SCHEDULE commands
```

### 14.3 Travel Business Rules

| Rule | Constraint |
|:-----|:----------|
| Max duration | 14 days per session |
| Concurrent sessions | 1 per user |
| Portable device required | Must have SMD-200 type device |
| Container copy | All containers copied with trip-duration quantity |
| Schedule copy | All schedules copied with endDate = trip end |
| Auto-end | Server auto-ends session after planned end date + 1 day |

---

## 15. Caregiver-Patient Management

### 15.1 Establishing Relationship

```
Caregiver Registration:
1. POST /api/auth/register { role: "Caregiver" }
2. Caregiver receives caregiverId

Patient Assignment:
1. Admin/patient sets caregiver: PUT /api/auth/me { caregiverUserId: "<guid>" }
2. Or: Admin assigns via backend

Caregiver Access:
1. GET /api/auth/me/profile → includes assignedPatients list
2. Caregiver can access patient's:
   - Devices (read-only)
   - Dispense events (read-only)
   - Adherence summary
   - Notifications (receives caregiver-type alerts)
```

### 15.2 Caregiver Notification Events

| Event | Patient Notified | Caregiver Notified | Delay |
|:------|:----------------|:-------------------|:------|
| Dose dispensed | In-app | — | — |
| Dose confirmed | In-app | In-app | — |
| Dose missed | Push + in-app | Push + in-app + email | 30 min after scheduled time |
| Low stock | Push + in-app | Push + in-app | — |
| Device offline | Push (after 5 min) | Push + email (after 30 min) | — |
| Battery critical | Push + in-app | Push + in-app + email | — |

---

## 16. Data Export API

### 16.1 GDPR Export

Implemented at **GET `/api/auth/me/export`** (JWT). Returns user data for GDPR compliance.

### 16.2 GDPR Export Response

Response includes: **Profile**, **Devices**, **DispenseEvents**, **Notifications**, **ExportedAtUtc**. (No containers, schedules, travelSessions, or webhookEndpoints.)

```json
{
    "profile": { "id": "...", "email": "...", "fullName": "...", "role": "Patient", "createdAtUtc": "..." },
    "devices": [{ "id": "...", "name": "...", "type": "Main", ... }],
    "dispenseEvents": [...],
    "notifications": [...],
    "exportedAtUtc": "2026-02-10T12:00:00Z"
}
```
