# API Integration Guide

**Complete API Reference — Device Protocol & Application API**

**Version 3.0**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Target Audience | Firmware Engineers, Backend Developers, Mobile/Web Developers |
| API Versions | v1 (Device), User/App API |

---

## 1. Overview

### 1.1 API Layers

The Smart Medication Dispenser platform exposes **two distinct API layers**:

| API Layer | Base Path | Authentication | Consumers |
|:----------|:----------|:---------------|:----------|
| **Device API** | `/api/v1/` | Device token (JWT) or X-API-Key | Device firmware (ESP32) |
| **User/App API** | `/api/` | User JWT (Bearer token) | Mobile app, Web portal, Caregivers |

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMMUNICATION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐                              ┌─────────────────────┐   │
│  │ SMD-100     │                              │   CLOUD API         │   │
│  │ Home Device │──── WiFi ──── /api/v1/ ─────→│   ASP.NET Core 8   │   │
│  │             │                              │   (Swiss/EU)        │   │
│  └─────────────┘                              │                     │   │
│        ↕ BLE                                  │  ┌───────────────┐  │   │
│  ┌─────────────┐                              │  │ Device API    │  │   │
│  │ SMD-200     │                              │  │ /api/v1/*     │  │   │
│  │ Travel      │──── WiFi/LTE ── /api/v1/ ──→│  └───────┬───────┘  │   │
│  │             │                              │          │          │   │
│  └─────────────┘                              │  ┌───────┴───────┐  │   │
│                                               │  │ App Services  │  │   │
│  ┌─────────────┐                              │  │ (MediatR/CQRS)│  │   │
│  │ Mobile App  │                              │  └───────┬───────┘  │   │
│  │ (React      │──── HTTPS ─── /api/* ───────→│          │          │   │
│  │  Native)    │                              │  ┌───────┴───────┐  │   │
│  └─────────────┘                              │  │ User/App API  │  │   │
│                                               │  │ /api/*        │  │   │
│  ┌─────────────┐                              │  └───────┬───────┘  │   │
│  │ Web Portal  │                              │          │          │   │
│  │ (React +    │──── HTTPS ─── /api/* ───────→│  ┌───────┴───────┐  │   │
│  │  Vite)      │                              │  │ PostgreSQL /  │  │   │
│  └─────────────┘                              │  │ SQLite (dev)  │  │   │
│                                               │  └───────────────┘  │   │
│  ┌─────────────┐                              │                     │   │
│  │ External    │                              │  ┌───────────────┐  │   │
│  │ Integrations│──── X-API-Key ──────────────→│  │ Webhooks API  │  │   │
│  └─────────────┘                              │  │ /api/webhooks │  │   │
│                                               │  └───────────────┘  │   │
│                                               └─────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Backend Architecture

The backend is built with **ASP.NET Core 8** using **Clean Architecture** and the **CQRS pattern** (via MediatR):

```
Backend/
├── Api/                    # Controllers, Middleware
│   ├── Controllers/        # REST endpoints
│   │   ├── AuthController          # User registration & login
│   │   ├── DevicesController       # Device CRUD (user-facing)
│   │   ├── DeviceApiController     # Device-to-cloud protocol
│   │   ├── ContainersController    # Medication slots CRUD
│   │   ├── SchedulesController     # Dosing schedules CRUD
│   │   ├── DispensingController    # Dispense & confirm intake
│   │   ├── HistoryController       # Dispense event history
│   │   ├── NotificationsController # In-app notifications
│   │   ├── TravelController        # Travel mode sessions
│   │   ├── IntegrationsController  # Webhooks & API keys
│   │   └── WebhooksController      # Incoming webhooks
│   └── Middleware/
│       └── GlobalExceptionMiddleware
├── Application/            # Business logic (Commands, Queries, Handlers)
├── Domain/                 # Entities, Enums, Value Objects
└── Infrastructure/         # EF Core, Repositories, Services
```

### 1.4 API Endpoints

| Environment | Base URL | Purpose |
|:------------|:---------|:--------|
| Production | `https://api.smartdispenser.ch/v1` | Live system |
| Staging | `https://api-staging.smartdispenser.ch/v1` | Testing |
| Development | `https://api-dev.smartdispenser.ch/v1` | Development |

### 1.5 Protocol Summary

| Aspect | Specification |
|:-------|:--------------|
| Transport | HTTPS (TLS 1.3) |
| Format | JSON |
| Authentication | Bearer token (JWT) |
| Encoding | UTF-8 |
| Compression | gzip (optional) |
| Keep-alive | Supported |

---

## 2. Authentication

### 2.1 Device Registration

**First-time device setup.** Called once per device lifetime (or after factory reset).

**Endpoint:** `POST /devices/register`

**Request:**

```json
{
  "device_id": "SMD-00A1B2C3",
  "device_type": "main",
  "firmware_version": "1.2.0",
  "hardware_version": "1.0",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "manufacturing_date": "2026-01-15"
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `device_id` | string | Yes | Unique device identifier (format: `SMD-XXXXXXXX`) |
| `device_type` | string | Yes | `"main"` or `"portable"` |
| `firmware_version` | string | Yes | Semantic version |
| `hardware_version` | string | No | PCB revision |
| `mac_address` | string | No | WiFi MAC address |
| `manufacturing_date` | string | No | ISO 8601 date |

**Response (Success - 201 Created):**

```json
{
  "success": true,
  "device_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "api_endpoint": "https://api.smartdispenser.ch/v1",
  "heartbeat_interval": 60,
  "token_expires_at": "2026-02-06T12:00:00Z",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `device_token` | string | JWT for API authentication |
| `api_endpoint` | string | Confirmed API base URL |
| `heartbeat_interval` | integer | Seconds between heartbeats |
| `token_expires_at` | string | Token expiration (ISO 8601) |
| `refresh_token` | string | Token for renewal |

**Errors:**

| Code | Message | Cause |
|:-----|:--------|:------|
| 400 | `Invalid device_id format` | Device ID doesn't match pattern |
| 409 | `Device already registered` | Device ID exists in system |
| 422 | `Unknown device_type` | Must be "main" or "portable" |

### 2.2 Token Refresh

**When token is about to expire.** Call 24 hours before `token_expires_at`.

**Endpoint:** `POST /devices/token/refresh`

**Request:**

```json
{
  "device_id": "SMD-00A1B2C3",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response:**

```json
{
  "success": true,
  "device_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expires_at": "2026-03-08T12:00:00Z",
  "refresh_token": "bmV3IHJlZnJlc2ggdG9rZW4..."
}
```

### 2.3 Authentication Headers

All authenticated requests require:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Device-ID: SMD-00A1B2C3
X-Firmware-Version: 1.2.0
```

| Header | Required | Description |
|:-------|:---------|:------------|
| `Authorization` | Yes | Bearer token from registration |
| `Content-Type` | Yes | Always `application/json` |
| `X-Device-ID` | Yes | Device identifier |
| `X-Firmware-Version` | Recommended | Current firmware version |
| `Accept-Encoding` | Optional | `gzip` for compressed responses |

---

## 3. Heartbeat

### 3.1 Regular Heartbeat

**Frequency:** Every 60 seconds (configurable by server)

**Endpoint:** `POST /devices/{device_id}/heartbeat`

**Request:**

```json
{
  "timestamp": "2026-02-06T08:30:00Z",
  "battery_level": 95,
  "wifi_signal": -52,
  "temperature": 22.5,
  "humidity": 45,
  "firmware": "1.2.0",
  "uptime_seconds": 86400,
  "free_memory_kb": 128,
  "slots": [
    {
      "slot": 1,
      "medication": "Metformin 500mg",
      "pills_count": 85,
      "days_remaining": 42
    },
    {
      "slot": 2,
      "medication": "Lisinopril 10mg",
      "pills_count": 28,
      "days_remaining": 28
    }
  ]
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `timestamp` | string | Yes | ISO 8601 UTC timestamp |
| `battery_level` | integer | No | 0-100 (%), null if AC powered |
| `wifi_signal` | integer | No | dBm (-30 to -90) |
| `temperature` | number | No | Celsius |
| `humidity` | integer | No | 0-100 (%) |
| `firmware` | string | Yes | Current firmware version |
| `uptime_seconds` | integer | No | Seconds since boot |
| `free_memory_kb` | integer | No | Available RAM |
| `slots` | array | Yes | Current slot status |

**Slot Object:**

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `slot` | integer | Yes | Slot number (1-10) |
| `medication` | string | No | Medication name |
| `pills_count` | integer | Yes | Pills remaining |
| `days_remaining` | integer | No | Calculated days left |

**Response (200 OK):**

```json
{
  "success": true,
  "server_time": "2026-02-06T08:30:01Z",
  "next_heartbeat": 60,
  "commands": [
    {
      "type": "SYNC_SCHEDULE",
      "priority": "normal"
    }
  ],
  "config_updates": {
    "heartbeat_interval": 60,
    "dispensing_audio_enabled": true,
    "volume_level": 7
  }
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `server_time` | string | Server UTC time for sync |
| `next_heartbeat` | integer | Seconds until next heartbeat |
| `commands` | array | Pending commands for device |
| `config_updates` | object | Configuration changes |

### 3.2 Command Types

| Command | Description | Action |
|:--------|:------------|:-------|
| `SYNC_SCHEDULE` | Schedule has changed | Fetch `/schedule` |
| `FIRMWARE_UPDATE` | New firmware available | Fetch `/firmware` |
| `CONFIG_UPDATE` | Settings changed | Apply `config_updates` |
| `FORCE_DISPENSE` | Manual dispense | Execute dispense |
| `DIAGNOSTIC_MODE` | Enter diagnostics | Run self-test |

---

## 4. Schedule Management

### 4.1 Get Schedule

**Endpoint:** `GET /devices/{device_id}/schedule`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `since` | string | Only changes since timestamp (optional) |

**Response:**

```json
{
  "schedule_version": "v2026020601",
  "last_updated": "2026-02-06T07:00:00Z",
  "timezone": "Europe/Zurich",
  "schedules": [
    {
      "id": "sch_a1b2c3d4",
      "medication": "Metformin 500mg",
      "medication_id": "med_x1y2z3",
      "slot": 1,
      "pills_per_dose": 2,
      "times": ["08:00", "20:00"],
      "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      "active": true,
      "start_date": "2026-01-01",
      "end_date": null,
      "instructions": "Take with food",
      "skip_dates": ["2026-02-14"],
      "window_minutes": 30
    },
    {
      "id": "sch_e5f6g7h8",
      "medication": "Lisinopril 10mg",
      "medication_id": "med_a1b2c3",
      "slot": 2,
      "pills_per_dose": 1,
      "times": ["09:00"],
      "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      "active": true,
      "start_date": "2026-01-15",
      "end_date": null,
      "instructions": null,
      "skip_dates": [],
      "window_minutes": 30
    }
  ],
  "next_dispense": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "time": "2026-02-06T08:00:00+01:00",
    "slot": 1,
    "pills": 2
  }
}
```

**Schedule Object Fields:**

| Field | Type | Description |
|:------|:-----|:------------|
| `id` | string | Unique schedule identifier |
| `medication` | string | Display name |
| `medication_id` | string | Internal medication ID |
| `slot` | integer | Device slot number (1-10) |
| `pills_per_dose` | integer | Pills to dispense |
| `times` | array | Times in HH:MM format (24h) |
| `days` | array | Days: mon, tue, wed, thu, fri, sat, sun |
| `active` | boolean | Schedule is enabled |
| `start_date` | string | Schedule start (ISO date) |
| `end_date` | string | Schedule end (null = ongoing) |
| `instructions` | string | Patient instructions |
| `skip_dates` | array | Dates to skip (ISO dates) |
| `window_minutes` | integer | Minutes before "missed" |

### 4.2 Confirm Schedule Received

**Endpoint:** `POST /devices/{device_id}/schedule/confirm`

**Request:**

```json
{
  "schedule_version": "v2026020601",
  "schedules_count": 2,
  "confirmed_at": "2026-02-06T08:30:05Z"
}
```

---

## 5. Events

### 5.1 Send Event

**Endpoint:** `POST /events`

**General Event Structure:**

```json
{
  "event": "EVENT_TYPE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:00Z",
  "data": {
    // Event-specific data
  }
}
```

### 5.2 Event Types

#### DOSE_DISPENSED

Sent when pills are released from slot.

```json
{
  "event": "DOSE_DISPENSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:00Z",
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "slot": 1,
    "pills_dispensed": 2,
    "pills_remaining": 83,
    "scheduled_time": "2026-02-06T08:00:00+01:00",
    "actual_time": "2026-02-06T08:00:02+01:00",
    "dispensing_duration_ms": 2340
  }
}
```

#### DOSE_TAKEN

Sent when weight sensor confirms pills removed from tray.

```json
{
  "event": "DOSE_TAKEN",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:01:30Z",
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "pills_taken": 2,
    "seconds_to_take": 90,
    "on_time": true,
    "tray_weight_before_g": 4.2,
    "tray_weight_after_g": 0.1
  }
}
```

#### DOSE_MISSED

Sent when `window_minutes` elapsed without confirmation.

```json
{
  "event": "DOSE_MISSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:30:00Z",
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "scheduled_time": "2026-02-06T08:00:00+01:00",
    "pills_not_taken": 2,
    "tray_status": "pills_present",
    "user_acknowledged": false
  }
}
```

#### REFILL_NEEDED

Sent when pills fall below threshold.

```json
{
  "event": "REFILL_NEEDED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:05Z",
  "data": {
    "medication": "Lisinopril 10mg",
    "slot": 2,
    "pills_remaining": 14,
    "days_remaining": 7,
    "daily_usage": 2,
    "urgency": "warning"
  }
}
```

| Urgency | Pills/Days Remaining |
|:--------|:---------------------|
| `warning` | 7-14 days |
| `critical` | <7 days |
| `empty` | 0 pills |

#### DEVICE_ONLINE

Sent after successful connection.

```json
{
  "event": "DEVICE_ONLINE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T06:00:00Z",
  "data": {
    "firmware": "1.2.0",
    "battery_level": 100,
    "wifi_signal": -48,
    "offline_duration_seconds": 0,
    "pending_events_count": 0,
    "boot_reason": "power_on"
  }
}
```

| Boot Reason | Description |
|:------------|:------------|
| `power_on` | Fresh power on |
| `reset` | User or system reset |
| `watchdog` | Watchdog timeout |
| `crash` | Recovered from crash |
| `ota` | After firmware update |

#### DEVICE_OFFLINE

Sent by server when heartbeat times out (not by device).

#### DEVICE_ERROR

Sent when error detected.

```json
{
  "event": "DEVICE_ERROR",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:10Z",
  "data": {
    "error_code": "E101",
    "error_type": "hardware",
    "severity": "warning",
    "slot": 3,
    "message": "Pill jam detected in slot 3",
    "recoverable": true,
    "user_action_required": true,
    "diagnostic_data": {
      "motor_steps": 1024,
      "sensor_reading": 0,
      "expected_pills": 2,
      "detected_pills": 0
    }
  }
}
```

#### BATTERY_LOW

Sent when battery falls below threshold (portable device).

```json
{
  "event": "BATTERY_LOW",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T14:00:00Z",
  "data": {
    "battery_level": 18,
    "estimated_hours": 8,
    "charging": false,
    "threshold": 20
  }
}
```

#### TRAVEL_MODE_ON

Sent when medications transferred to portable device.

```json
{
  "event": "TRAVEL_MODE_ON",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T09:00:00Z",
  "data": {
    "portable_device_id": "SMD-00P1Q2R3",
    "medications_transferred": [
      {
        "medication": "Metformin 500mg",
        "from_slot": 1,
        "to_slot": 1,
        "pills_transferred": 28
      }
    ],
    "days_loaded": 14,
    "expected_return": "2026-02-20"
  }
}
```

#### TRAVEL_MODE_OFF

Sent when returning from travel mode.

```json
{
  "event": "TRAVEL_MODE_OFF",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-20T18:00:00Z",
  "data": {
    "portable_device_id": "SMD-00P1Q2R3",
    "days_away": 14,
    "doses_taken": 28,
    "doses_missed": 0,
    "pills_returned": 0
  }
}
```

### 5.3 Event Response

**Success (202 Accepted):**

```json
{
  "success": true,
  "event_id": "evt_a1b2c3d4e5f6",
  "processed_at": "2026-02-06T08:00:01Z"
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EVENT",
    "message": "Unknown event type: INVALID_TYPE"
  }
}
```

---

## 6. Firmware Updates

### 6.1 Check for Updates

**Endpoint:** `GET /devices/{device_id}/firmware`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `current_version` | string | Current firmware version |

**Response:**

```json
{
  "update_available": true,
  "current_version": "1.2.0",
  "new_version": "1.3.0",
  "release_notes": "Bug fixes and performance improvements",
  "mandatory": false,
  "download_url": "https://firmware.smartdispenser.ch/SMD100/1.3.0/firmware.bin",
  "checksum_sha256": "a1b2c3d4e5f6...",
  "size_bytes": 1048576,
  "min_battery": 30,
  "estimated_install_minutes": 5
}
```

### 6.2 Report Update Status

**Endpoint:** `POST /devices/{device_id}/firmware/status`

**Request:**

```json
{
  "status": "completed",
  "previous_version": "1.2.0",
  "new_version": "1.3.0",
  "duration_seconds": 180,
  "error_message": null
}
```

| Status | Description |
|:-------|:------------|
| `downloading` | Download in progress |
| `verifying` | Checking signature/checksum |
| `installing` | Writing to flash |
| `completed` | Successfully updated |
| `failed` | Update failed |
| `rolled_back` | Reverted to previous |

---

## 7. Error Handling

### 7.1 HTTP Status Codes

| Code | Meaning | Device Action |
|:-----|:--------|:--------------|
| 200 | Success | Process response |
| 201 | Created | Store new resource |
| 202 | Accepted | Event queued |
| 400 | Bad Request | Fix request format |
| 401 | Unauthorized | Refresh token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resolve conflict |
| 422 | Unprocessable | Validation error |
| 429 | Rate Limited | Back off, retry later |
| 500 | Server Error | Retry with backoff |
| 502 | Bad Gateway | Retry with backoff |
| 503 | Unavailable | Retry with backoff |

### 7.2 Retry Strategy

```
Attempt | Wait Time | Total Elapsed
--------|-----------|---------------
   1    |    0s     |      0s
   2    |    5s     |      5s
   3    |   15s     |     20s
   4    |   60s     |     80s
   5    |  300s     |    380s
   6+   |  600s     |    980s+
```

**Retry Rules:**

| Condition | Action |
|:----------|:-------|
| 4xx errors | Don't retry (fix request) |
| 401 error | Refresh token, then retry |
| 5xx errors | Retry with backoff |
| Network timeout | Retry with backoff |
| Max retries reached | Store locally |

### 7.3 Offline Mode

When API is unreachable:

1. **Store events locally** (up to 1000 events, 7 days)
2. **Continue dispensing** per cached schedule
3. **Retry connection** every 60 seconds
4. **When reconnected:**
   - Sync stored events (oldest first)
   - Fetch latest schedule
   - Report current status

**Local Storage Format:**

```json
{
  "pending_events": [
    {
      "id": "local_001",
      "event": "DOSE_TAKEN",
      "timestamp": "2026-02-06T08:01:30Z",
      "data": {...},
      "retry_count": 3,
      "last_retry": "2026-02-06T08:15:00Z"
    }
  ],
  "last_sync": "2026-02-06T07:00:00Z",
  "offline_since": "2026-02-06T08:00:00Z"
}
```

---

## 8. Security Requirements

### 8.1 TLS Configuration

| Parameter | Requirement |
|:----------|:------------|
| Protocol | TLS 1.3 (minimum TLS 1.2) |
| Certificate validation | Required |
| Certificate pinning | Recommended |
| Cipher suites | AES-256-GCM, ChaCha20-Poly1305 |

### 8.2 Token Security

| Requirement | Implementation |
|:------------|:---------------|
| Storage | Encrypted flash partition |
| Transmission | HTTPS only |
| Rotation | Every 30 days |
| Revocation | Check `token_expires_at` |

### 8.3 Device Identity

| Element | Protection |
|:--------|:-----------|
| Device ID | Hardware fuse |
| Private key | Secure element |
| Firmware | Signed, verified |

---

## 9. Rate Limits

| Endpoint | Limit | Window |
|:---------|:------|:-------|
| `/heartbeat` | 2 requests | per minute |
| `/events` | 60 requests | per minute |
| `/schedule` | 10 requests | per minute |
| `/firmware` | 5 requests | per hour |
| All other | 100 requests | per minute |

**Rate limit response (429):**

```json
{
  "error": "rate_limit_exceeded",
  "retry_after": 30,
  "limit": 60,
  "remaining": 0,
  "reset_at": "2026-02-06T08:31:00Z"
}
```

---

## 10. Quick Reference

### 10.1 Endpoint Summary

| Action | Method | Endpoint |
|:-------|:-------|:---------|
| Register device | POST | `/devices/register` |
| Refresh token | POST | `/devices/token/refresh` |
| Send heartbeat | POST | `/devices/{id}/heartbeat` |
| Get schedule | GET | `/devices/{id}/schedule` |
| Confirm schedule | POST | `/devices/{id}/schedule/confirm` |
| Send event | POST | `/events` |
| Check firmware | GET | `/devices/{id}/firmware` |
| Report update | POST | `/devices/{id}/firmware/status` |

### 10.2 Event Summary

| Event | Trigger | Priority |
|:------|:--------|:---------|
| `DOSE_DISPENSED` | Pills released | High |
| `DOSE_TAKEN` | Pills removed | High |
| `DOSE_MISSED` | Window expired | Critical |
| `REFILL_NEEDED` | Low stock | Medium |
| `REFILL_CRITICAL` | Very low stock | High |
| `DEVICE_ONLINE` | Connected | Low |
| `DEVICE_ERROR` | Error detected | High |
| `BATTERY_LOW` | <20% battery | Medium |
| `BATTERY_CRITICAL` | <5% battery | High |
| `TRAVEL_MODE_ON` | Transfer start | Medium |
| `TRAVEL_MODE_OFF` | Transfer end | Medium |

### 10.3 Error Codes

| Code | Category | Description |
|:-----|:---------|:------------|
| E001-E099 | Network | Connectivity issues |
| E101-E199 | Hardware | Physical problems |
| E201-E299 | Power | Battery/power issues |
| E301-E399 | Storage | Memory/storage issues |
| E401-E499 | Sensor | Sensor failures |
| E501-E599 | Software | Firmware issues |

---

# PART 2: User & Application API

> The following sections document the **User/Application API** consumed by the mobile app (React Native/Expo) and web portal (React + Vite). All endpoints require JWT Bearer authentication unless noted otherwise.

---

## 11. User Authentication

### 11.1 Register

**Endpoint:** `POST /api/auth/register`

**Authentication:** None (public)

**Request:**

```json
{
  "email": "patient@example.com",
  "password": "SecureP@ss123",
  "fullName": "Jean Dupont",
  "role": "Patient"
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `email` | string | Yes | User email (unique) |
| `password` | string | Yes | Minimum 8 characters |
| `fullName` | string | Yes | Display name |
| `role` | string | No | `"Patient"`, `"Caregiver"`, or `"Admin"` (default: Patient) |

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "patient@example.com",
    "fullName": "Jean Dupont",
    "role": "Patient"
  }
}
```

**Errors:**

| Code | Message | Cause |
|:-----|:--------|:------|
| 400 | Email already exists | Duplicate registration |
| 400 | Validation failed | Missing/invalid fields |

### 11.2 Login

**Endpoint:** `POST /api/auth/login`

**Authentication:** None (public)

**Request:**

```json
{
  "email": "patient@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "patient@example.com",
    "fullName": "Jean Dupont",
    "role": "Patient"
  }
}
```

**Errors:**

| Code | Cause |
|:-----|:------|
| 401 | Invalid email or password |

### 11.3 Get Current User

**Endpoint:** `GET /api/auth/me`

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "patient@example.com",
  "fullName": "Jean Dupont",
  "role": "Patient"
}
```

### 11.4 Get User Profile with Devices

**Endpoint:** `GET /api/auth/me/profile`

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "patient@example.com",
  "fullName": "Jean Dupont",
  "role": "Patient",
  "deviceIds": [
    "d1e2f3a4-b5c6-7890-abcd-ef1234567890"
  ]
}
```

### 11.5 Authentication Headers (User API)

All authenticated User/App API requests require:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

| Header | Required | Description |
|:-------|:---------|:------------|
| `Authorization` | Yes | `Bearer <JWT>` from login/register |
| `Content-Type` | Yes | `application/json` for POST/PUT requests |

---

## 12. Device Management (User API)

### 12.1 List User's Devices

**Endpoint:** `GET /api/devices`

**Response:**

```json
[
  {
    "id": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
    "name": "Home Dispenser",
    "type": "Main",
    "status": "Active",
    "timeZoneId": "Europe/Zurich",
    "lastHeartbeatAtUtc": "2026-02-06T08:30:00Z",
    "firmwareVersion": "1.2.0",
    "batteryLevel": 95,
    "wifiSignal": -52,
    "temperature": 22.5,
    "humidity": 45,
    "isOnline": true,
    "createdAtUtc": "2026-01-15T10:00:00Z"
  }
]
```

### 12.2 Get Device by ID

**Endpoint:** `GET /api/devices/{id}`

**Response:** Same structure as list item above.

### 12.3 Create Device

**Endpoint:** `POST /api/devices`

**Request:**

```json
{
  "name": "Home Dispenser",
  "type": "Main",
  "timeZoneId": "Europe/Zurich"
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `name` | string | Yes | Display name |
| `type` | string | Yes | `"Main"` or `"Portable"` |
| `timeZoneId` | string | No | IANA timezone (default: UTC) |

**Response (201 Created):** Returns the created device object.

### 12.4 Pause / Resume Device

**Pause:** `PATCH /api/devices/{id}/pause`

**Resume:** `PATCH /api/devices/{id}/resume`

**Response:** Returns updated device object with `status` changed to `"Paused"` or `"Active"`.

### 12.5 Device Heartbeat (User API)

**Endpoint:** `POST /api/devices/{id}/heartbeat`

**Response:** `204 No Content` on success, `404` if device not found.

---

## 13. Containers (Medication Slots)

Containers represent physical medication compartments (slots) on a device.

### 13.1 List Containers for Device

**Endpoint:** `GET /api/devices/{deviceId}/containers`

**Response:**

```json
[
  {
    "id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
    "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
    "slotNumber": 1,
    "medicationName": "Metformin 500mg",
    "medicationImageUrl": null,
    "quantity": 85,
    "pillsPerDose": 2,
    "lowStockThreshold": 14,
    "createdAtUtc": "2026-01-15T10:05:00Z"
  }
]
```

### 13.2 Create Container

**Endpoint:** `POST /api/devices/{deviceId}/containers`

**Request:**

```json
{
  "slotNumber": 1,
  "medicationName": "Metformin 500mg",
  "quantity": 90,
  "pillsPerDose": 2,
  "lowStockThreshold": 14,
  "medicationImageUrl": null
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `slotNumber` | integer | Yes | Physical slot (1-10 home, 1-4 travel) |
| `medicationName` | string | Yes | Medication display name |
| `quantity` | integer | Yes | Current pill count |
| `pillsPerDose` | integer | Yes | Pills per dose |
| `lowStockThreshold` | integer | No | Alert when below this count |

### 13.3 Update Container

**Endpoint:** `PUT /api/containers/{id}`

**Request:** Same fields as create.

### 13.4 Delete Container

**Endpoint:** `DELETE /api/containers/{id}`

**Response:** `204 No Content`. Fails if active schedules reference this container.

---

## 14. Schedules

Schedules define recurring dose times for a specific container/medication.

### 14.1 List Schedules for Container

**Endpoint:** `GET /api/containers/{containerId}/schedules`

**Response:**

```json
[
  {
    "id": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
    "timeOfDay": "08:00:00",
    "daysOfWeekBitmask": 127,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": null,
    "notes": "Take with food",
    "timeZoneId": "Europe/Zurich",
    "createdAtUtc": "2026-01-15T10:10:00Z"
  }
]
```

| Field | Type | Description |
|:------|:-----|:------------|
| `timeOfDay` | string | Time in `HH:mm:ss` format (24h) |
| `daysOfWeekBitmask` | integer | Bitmask: Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64. `127` = every day |
| `startDate` | string | Schedule activation date |
| `endDate` | string | Schedule end date (null = ongoing) |

### 14.2 Create Schedule

**Endpoint:** `POST /api/containers/{containerId}/schedules`

**Request:**

```json
{
  "timeOfDay": "08:00:00",
  "daysOfWeekBitmask": 127,
  "startDate": "2026-01-01",
  "endDate": null,
  "notes": "Take with food",
  "timeZoneId": "Europe/Zurich"
}
```

### 14.3 Update Schedule

**Endpoint:** `PUT /api/schedules/{id}`

### 14.4 Delete Schedule

**Endpoint:** `DELETE /api/schedules/{id}`

**Response:** `204 No Content`

### 14.5 Get Today's Schedule

**Endpoint:** `GET /api/devices/{deviceId}/today-schedule?timeZoneId=Europe/Zurich`

**Response:**

```json
[
  {
    "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
    "medicationName": "Metformin 500mg",
    "pillsPerDose": 2,
    "scheduledTimeUtc": "2026-02-06T07:00:00Z",
    "scheduledTimeLocal": "2026-02-06T08:00:00+01:00",
    "status": "Pending",
    "dispenseEventId": null
  },
  {
    "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
    "medicationName": "Metformin 500mg",
    "pillsPerDose": 2,
    "scheduledTimeUtc": "2026-02-06T19:00:00Z",
    "scheduledTimeLocal": "2026-02-06T20:00:00+01:00",
    "status": "Pending",
    "dispenseEventId": null
  }
]
```

---

## 15. Dispensing

### 15.1 Trigger Dispense

**Endpoint:** `POST /api/devices/{deviceId}/dispense`

**Request:**

```json
{
  "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890"
}
```

**Response:**

```json
{
  "id": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
  "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "scheduledAtUtc": "2026-02-06T07:00:00Z",
  "status": "Dispensed",
  "dispensedAtUtc": "2026-02-06T07:00:02Z",
  "confirmedAtUtc": null,
  "missedMarkedAtUtc": null,
  "createdAtUtc": "2026-02-06T07:00:02Z"
}
```

### 15.2 Confirm Intake

**Endpoint:** `POST /api/dispense-events/{id}/confirm`

**Response:** Returns updated dispense event with `status: "Confirmed"` and `confirmedAtUtc` set.

### 15.3 Delay Reminder

**Endpoint:** `POST /api/dispense-events/{id}/delay`

**Request:**

```json
{
  "delayMinutes": 15
}
```

**Response:** Returns updated dispense event with `status: "Delayed"` and `delayedAtUtc` set.

### 15.4 Dispense Event Status Lifecycle

```
    ┌─────────┐
    │ Pending  │ ── Created when schedule time arrives
    └────┬────┘
         │
         ▼
    ┌──────────┐
    │ Dispensed │ ── Pills released from device
    └────┬─────┘
         │
    ┌────┼──────────────┐
    │    │              │
    ▼    ▼              ▼
┌──────────┐  ┌────────┐  ┌─────────┐
│Confirmed │  │Delayed │  │ Missed  │
│(taken)   │  │(snoozed)│  │(timeout)│
└──────────┘  └────────┘  └─────────┘
```

---

## 16. History & Events

### 16.1 Get Dispense History

**Endpoint:** `GET /api/devices/{deviceId}/events`

**Query Parameters:**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `fromUtc` | datetime | Start date filter (optional) |
| `toUtc` | datetime | End date filter (optional) |
| `limit` | integer | Max results (default: 100) |

**Response:**

```json
[
  {
    "id": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
    "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
    "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
    "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "scheduledAtUtc": "2026-02-06T07:00:00Z",
    "status": "Confirmed",
    "dispensedAtUtc": "2026-02-06T07:00:02Z",
    "confirmedAtUtc": "2026-02-06T07:01:30Z",
    "missedMarkedAtUtc": null,
    "delayedAtUtc": null,
    "createdAtUtc": "2026-02-06T07:00:02Z"
  }
]
```

---

## 17. Notifications

### 17.1 Get Notifications

**Endpoint:** `GET /api/notifications?limit=50`

**Response:**

```json
[
  {
    "id": "n1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "type": "MissedDose",
    "title": "Missed Dose",
    "body": "You missed your Metformin 500mg dose scheduled at 08:00",
    "isRead": false,
    "createdAtUtc": "2026-02-06T08:30:00Z",
    "relatedEntityId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
  }
]
```

**Notification Types:**

| Type | Description |
|:-----|:------------|
| `MissedDose` | Patient missed a scheduled dose |
| `LowStock` | Medication supply is running low |
| `RefillCritical` | Critical: less than 3 days supply |
| `DoseDispensed` | Pills were dispensed |
| `DoseTaken` | Patient confirmed intake |
| `TravelStarted` | Travel mode activated |
| `TravelEnded` | Travel mode deactivated |
| `DeviceOnline` | Device connected |
| `DeviceOffline` | Device disconnected |
| `DeviceError` | Device reported an error |
| `DeviceStatus` | Device status change |
| `BatteryLow` | Battery below 20% |
| `BatteryCritical` | Battery below 5% |
| `General` | General notification |

### 17.2 Mark Notification as Read

**Endpoint:** `POST /api/notifications/{id}/read`

**Response:** `204 No Content`

---

## 18. Travel Mode (User API)

### 18.1 Start Travel Session

**Endpoint:** `POST /api/travel/start`

**Request:**

```json
{
  "mainDeviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "portableDeviceId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "plannedEndDateUtc": "2026-02-20T18:00:00Z"
}
```

**Response:**

```json
{
  "id": "t1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "mainDeviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "portableDeviceId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "startedAtUtc": "2026-02-06T09:00:00Z",
  "endedAtUtc": null,
  "plannedEndDateUtc": "2026-02-20T18:00:00Z"
}
```

### 18.2 End Travel Session

**Endpoint:** `POST /api/travel/end`

**Response:** Returns updated travel session with `endedAtUtc` set.

---

## 19. Integrations & Webhooks

### 19.1 Outgoing Webhooks

Register URLs to receive POST notifications when events occur (dose confirmed, missed, low stock, etc.).

#### List Webhooks

**Endpoint:** `GET /api/integrations/webhooks`

**Response:**

```json
[
  {
    "id": "w1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "url": "https://your-system.com/webhook",
    "isActive": true,
    "description": "EHR integration",
    "lastTriggeredAtUtc": "2026-02-06T08:00:00Z",
    "lastStatus": "200 OK"
  }
]
```

#### Create Webhook

**Endpoint:** `POST /api/integrations/webhooks`

**Request:**

```json
{
  "url": "https://your-system.com/webhook",
  "secret": "optional-hmac-secret",
  "description": "EHR integration"
}
```

#### Delete Webhook

**Endpoint:** `DELETE /api/integrations/webhooks/{id}`

#### Outgoing webhook body (MVP)

All outgoing events use the same envelope: `eventType`, `timestampUtc`, and `data` (event-specific). Example for dose confirmation:

```json
{
  "eventType": "dispense.confirmed",
  "timestampUtc": "2026-02-10T08:05:00Z",
  "data": {
    "dispenseEventId": "e1f2g3a4-b5c6-7890-abcd-ef1234567890",
    "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
    "containerId": "c1d2e3a4-b5c6-7890-abcd-ef1234567890",
    "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "medicationName": "Metformin 500mg",
    "pillsPerDose": 2
  }
}
```

`notification.missed_dose`, `notification.low_stock`, and `device.*` follow the same pattern. Full cheat sheet: [../software-docs/WEBHOOKS_JSON_REFERENCE.md](../software-docs/WEBHOOKS_JSON_REFERENCE.md).

Public `GET /health` (and `/health/live`, etc.) includes `mvp` and `mvpLabel` when MVP mode is enabled in `appsettings` / environment.

### 19.2 Device API Keys

Create API keys for devices to authenticate with the webhook/sync endpoints without user JWT.

#### List Device API Keys

**Endpoint:** `GET /api/integrations/devices/{deviceId}/api-keys`

#### Create Device API Key

**Endpoint:** `POST /api/integrations/devices/{deviceId}/api-keys`

**Request:**

```json
{
  "name": "Production Key"
}
```

**Response:**

```json
{
  "apiKeyId": "k1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "plainKey": "sk_..."
}
```

> **Important:** `plainKey` is only returned once on creation. The backend stores only the SHA-256 hash.

#### Delete Device API Key

**Endpoint:** `DELETE /api/integrations/devices/{deviceId}/api-keys/{apiKeyId}`

### 19.3 Incoming Webhooks

External systems can send events to the dispenser via webhook.

**Endpoint:** `POST /api/webhooks/incoming`

**Authentication:** `X-API-Key` header (device API key)

**Request:**

```json
{
  "eventType": "heartbeat",
  "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "data": {
    "batteryLevel": 85,
    "temperature": 22.5
  }
}
```

| Event Type | Description |
|:-----------|:------------|
| `heartbeat` | Device status update |
| `dispense_completed` | Dispense confirmed externally |
| `low_stock` | Low stock alert |
| `device_status` | Device status change |

### 19.4 Sync from Cloud

**Endpoint:** `POST /api/integrations/sync`

**Authentication:** `X-API-Key` header

**Request:**

```json
{
  "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "syncType": "full"
}
```

---

## 20. Complete Endpoint Reference

### 20.1 Device API (`/api/v1/`) — For Firmware

| Action | Method | Endpoint | Auth |
|:-------|:-------|:---------|:-----|
| Register device | POST | `/api/v1/devices/register` | None |
| Send heartbeat | POST | `/api/v1/devices/{id}/heartbeat` | Device token |
| Get schedule | GET | `/api/v1/devices/{id}/schedule` | Device token |
| Send event | POST | `/api/v1/events` | Device token |
| Sync inventory | POST | `/api/v1/devices/{id}/inventory` | Device token |
| Report error | POST | `/api/v1/devices/{id}/error` | Device token |
| Check firmware | GET | `/api/v1/devices/{id}/firmware` | Device token |

### 20.2 User/App API (`/api/`) — For Mobile & Web

| Action | Method | Endpoint | Auth |
|:-------|:-------|:---------|:-----|
| Register user | POST | `/api/auth/register` | None |
| Login | POST | `/api/auth/login` | None |
| Get current user | GET | `/api/auth/me` | JWT |
| Get user profile | GET | `/api/auth/me/profile` | JWT |
| List devices | GET | `/api/devices` | JWT |
| Get device | GET | `/api/devices/{id}` | JWT |
| Create device | POST | `/api/devices` | JWT |
| Pause device | PATCH | `/api/devices/{id}/pause` | JWT |
| Resume device | PATCH | `/api/devices/{id}/resume` | JWT |
| Device heartbeat | POST | `/api/devices/{id}/heartbeat` | JWT |
| List containers | GET | `/api/devices/{deviceId}/containers` | JWT |
| Create container | POST | `/api/devices/{deviceId}/containers` | JWT |
| Update container | PUT | `/api/containers/{id}` | JWT |
| Delete container | DELETE | `/api/containers/{id}` | JWT |
| List schedules | GET | `/api/containers/{containerId}/schedules` | JWT |
| Create schedule | POST | `/api/containers/{containerId}/schedules` | JWT |
| Update schedule | PUT | `/api/schedules/{id}` | JWT |
| Delete schedule | DELETE | `/api/schedules/{id}` | JWT |
| Today's schedule | GET | `/api/devices/{deviceId}/today-schedule` | JWT |
| Trigger dispense | POST | `/api/devices/{deviceId}/dispense` | JWT |
| Confirm intake | POST | `/api/dispense-events/{id}/confirm` | JWT |
| Delay reminder | POST | `/api/dispense-events/{id}/delay` | JWT |
| Get history | GET | `/api/devices/{deviceId}/events` | JWT |
| Get notifications | GET | `/api/notifications` | JWT |
| Mark read | POST | `/api/notifications/{id}/read` | JWT |
| Start travel | POST | `/api/travel/start` | JWT |
| End travel | POST | `/api/travel/end` | JWT |
| List webhooks | GET | `/api/integrations/webhooks` | JWT |
| Create webhook | POST | `/api/integrations/webhooks` | JWT |
| Delete webhook | DELETE | `/api/integrations/webhooks/{id}` | JWT |
| List API keys | GET | `/api/integrations/devices/{id}/api-keys` | JWT |
| Create API key | POST | `/api/integrations/devices/{id}/api-keys` | JWT |
| Delete API key | DELETE | `/api/integrations/devices/{id}/api-keys/{keyId}` | JWT |
| Incoming webhook | POST | `/api/webhooks/incoming` | X-API-Key |
| Sync from cloud | POST | `/api/integrations/sync` | X-API-Key |

---

## Appendix A: Error Code Reference

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E001 | WIFI_DISCONNECTED | WiFi connection lost | Check WiFi |
| E002 | API_UNREACHABLE | Cannot reach API | Check internet |
| E003 | AUTH_FAILED | Token invalid | Re-authenticate |
| E101 | PILL_JAM | Pills stuck in slot | Clear jam |
| E102 | MOTOR_FAILURE | Motor not responding | Contact support |
| E103 | SENSOR_FAILURE | Sensor malfunction | Contact support |
| E104 | TRAY_MISSING | Output tray not detected | Replace tray |
| E201 | BATTERY_LOW | Battery below 20% | Charge device |
| E202 | BATTERY_CRITICAL | Battery below 5% | Charge immediately |
| E203 | POWER_LOST | AC power disconnected | Check power |
| E301 | STORAGE_FULL | Local storage full | Sync events |
| E302 | TEMP_OUT_OF_RANGE | Temperature too high/low | Check location |
| E303 | HUMIDITY_OUT_OF_RANGE | Humidity too high | Check location |

---

## Appendix B: Sample Implementation (C/ESP-IDF)

```c
// Heartbeat function example
esp_err_t send_heartbeat(void) {
    char url[256];
    snprintf(url, sizeof(url), "%s/devices/%s/heartbeat", 
             API_BASE_URL, device_id);
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "timestamp", get_iso_timestamp());
    cJSON_AddNumberToObject(root, "battery_level", get_battery_level());
    cJSON_AddNumberToObject(root, "wifi_signal", get_wifi_rssi());
    
    cJSON *slots = cJSON_CreateArray();
    for (int i = 0; i < NUM_SLOTS; i++) {
        cJSON *slot = cJSON_CreateObject();
        cJSON_AddNumberToObject(slot, "slot", i + 1);
        cJSON_AddNumberToObject(slot, "pills_count", slot_pills[i]);
        cJSON_AddItemToArray(slots, slot);
    }
    cJSON_AddItemToObject(root, "slots", slots);
    
    char *body = cJSON_PrintUnformatted(root);
    
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
        .cert_pem = server_cert_pem,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Authorization", auth_token);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, body, strlen(body));
    
    esp_err_t err = esp_http_client_perform(client);
    
    cJSON_Delete(root);
    free(body);
    esp_http_client_cleanup(client);
    
    return err;
}
```
