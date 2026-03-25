# Device-Cloud Protocol Specification

**Smart Medication Dispenser — ESP32-S3 to ASP.NET Core 8 Communication Protocol**

---

## Document Information

| **Version** | 1.0 |
| **Date** | February 2026 |
| **Author** | Smart Medication Dispenser Team |
| **Status** | Active |
| **Target Audience** | Firmware Engineers, Backend Engineers, DevOps |

---

## 1. Protocol Overview

### 1.1 Communication Stack

| Component | Specification |
|:----------|:-------------|
| **Transport** | HTTPS (TLS 1.3 minimum) |
| **Protocol** | REST API (JSON) |
| **Authentication** | Device JWT (RS256) or X-API-Key header |
| **Data Format** | JSON (UTF-8 encoding, snake_case fields) |
| **Heartbeat Interval** | 60 seconds (configurable) |
| **Base URL** | `https://api.smartdispenser.ch/api/v1` |

### 1.2 Protocol Principles

- **Stateless**: Each request contains all necessary authentication and context
- **Idempotent**: Event reporting and commands support retry without side effects
- **Resilient**: Devices operate offline with local event queue and cached schedules
- **Secure**: End-to-end encryption, certificate pinning, token-based auth
- **Efficient**: Incremental sync, compression support, minimal payloads

---

## 2. Device Registration & Provisioning

### 2.1 Factory Provisioning

During manufacturing, each ESP32-S3 device undergoes factory provisioning:

```
Factory Process:
1. Flash firmware image to device
2. Generate unique device ID (format: SMD-{8 hex chars})
3. Write device ID to eFuse (read-only, tamper-resistant)
4. Generate provisioning token (one-time use, 24-hour expiry)
5. Store provisioning token in secure NVS partition
6. Package device with QR code containing device serial
```

**Device ID Format**: `SMD-00A1B2C3` (prefix + 8 hexadecimal characters)

**eFuse Storage**:
- Device ID stored in eFuse block (permanent, cannot be modified)
- Used for device identification even after factory reset
- Prevents device ID spoofing

### 2.2 First Boot Registration Flow

When a device boots for the first time (or after factory reset), it must register with the cloud:

#### Step 1: WiFi Connection

Device connects to WiFi network using credentials provided via:
- **BLE provisioning**: Mobile app sends WiFi SSID/password via BLE
- **Touch display**: User enters credentials on device touchscreen
- **AP mode**: Device creates hotspot, user connects and configures

#### Step 2: Device Registration Request

**Endpoint**: `POST /api/v1/devices/register`

**Request Headers**:
```
Content-Type: application/json
X-Provisioning-Token: {provisioning_token}
```

**Request Body**:
```json
{
  "device_id": "SMD-00A1B2C3",
  "device_type": "SMART_DISPENSER_V1",
  "firmware_version": "1.2.0",
  "hardware_version": "1.0",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "provisioning_token": "prov_token_abc123xyz"
}
```

**Response (201 Created)**:
```json
{
  "device_id": "SMD-00A1B2C3",
  "device_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expires_at": "2027-02-10T08:00:00Z",
  "heartbeat_interval": 60,
  "server_time": "2026-02-10T08:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid device_id format, missing fields
- `401 Unauthorized`: Invalid or expired provisioning token
- `409 Conflict`: Device ID already registered

#### Step 3: Token Storage

Device stores the `device_token` in encrypted NVS (Non-Volatile Storage):

```
NVS Namespace: "device_auth"
Key: "device_token"
Value: {encrypted JWT}
Encryption: AES-256-GCM
Key Derivation: PBKDF2-SHA256 (device_id as salt)
```

#### Step 4: Start Heartbeat Loop

Device begins periodic heartbeat loop (every 60 seconds) to maintain connection and receive commands.

### 2.3 Device Onboarding (User Links Device)

After device registration, a user must link the device to their account:

**User Flow**:
1. User scans QR code on device (contains device serial: `SMD-00A1B2C3`)
2. Mobile app opens with device serial pre-filled
3. User logs in to their account
4. App sends link request to backend

**Endpoint**: `POST /api/devices` (User API, requires JWT)

**Request Headers**:
```
Authorization: Bearer {user_jwt}
Content-Type: application/json
```

**Request Body**:
```json
{
  "deviceSerial": "SMD-00A1B2C3",
  "name": "Kitchen Dispenser",
  "location": "Kitchen"
}
```

**Response (201 Created)**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "deviceSerial": "SMD-00A1B2C3",
  "name": "Kitchen Dispenser",
  "location": "Kitchen",
  "userId": "user-uuid-here",
  "status": "Active",
  "lastSeenAt": null,
  "firmwareVersion": "1.2.0",
  "hardwareVersion": "1.0"
}
```

**Backend Process**:
1. Backend validates device serial exists in `Devices` table
2. Checks device is not already linked to another user
3. Creates `UserDevice` relationship record
4. Device receives link notification via next heartbeat command

---

## 3. Heartbeat Protocol

The heartbeat is the primary bidirectional communication mechanism between device and cloud.

### 3.1 Request Format

**Endpoint**: `POST /api/v1/devices/{device_id}/heartbeat`

**Request Headers**:
```
Authorization: Bearer {device_token}
Content-Type: application/json
X-Device-ID: SMD-00A1B2C3
X-Firmware-Version: 1.2.0
Accept-Encoding: gzip
```

**Request Body** (Complete JSON with all fields):
```json
{
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12345,
  "battery": {
    "level_percent": 85,
    "voltage_mv": 4200,
    "charging": false,
    "health_status": "good"
  },
  "connectivity": {
    "wifi_ssid": "HomeNetwork",
    "wifi_signal_dbm": -45,
    "wifi_channel": 6,
    "connection_quality": "excellent",
    "ip_address": "192.168.1.100"
  },
  "environment": {
    "temperature_c": 22.5,
    "humidity_percent": 45,
    "light_lux": 350
  },
  "storage": {
    "used_percent": 35,
    "pending_events": 5,
    "pending_bytes": 2048
  },
  "slots": [
    {
      "slot": 1,
      "medication": "Aspirin",
      "pills_count": 25,
      "days_remaining": 12,
      "last_dispensed": "2026-02-10T07:30:00Z",
      "status": "ok"
    },
    {
      "slot": 2,
      "medication": "Metformin",
      "pills_count": 0,
      "days_remaining": 0,
      "last_dispensed": "2026-02-09T20:00:00Z",
      "status": "empty"
    },
    {
      "slot": 3,
      "medication": null,
      "pills_count": 0,
      "days_remaining": 0,
      "last_dispensed": null,
      "status": "empty"
    },
    {
      "slot": 4,
      "medication": null,
      "pills_count": 0,
      "days_remaining": 0,
      "last_dispensed": null,
      "status": "empty"
    }
  ],
  "tray": {
    "status": "closed",
    "pills_present": true,
    "weight_g": 0.5
  },
  "next_dose": {
    "scheduled_at": "2026-02-10T12:00:00Z",
    "medication": "Aspirin",
    "slot": 1,
    "pills_count": 1
  },
  "errors": [],
  "diagnostics": {
    "cpu_usage_percent": 15,
    "memory_free_kb": 45000,
    "last_reboot": "2026-02-10T06:00:00Z",
    "reboot_count": 3,
    "uptime_seconds": 7200
  }
}
```

### 3.2 Response Format

**Response (200 OK)**:
```json
{
  "device_id": "SMD-00A1B2C3",
  "server_time": "2026-02-10T08:00:01Z",
  "next_heartbeat": 60,
  "commands": [
    {
      "id": "cmd_001",
      "type": "SYNC_SCHEDULE",
      "priority": "high",
      "params": {
        "force_full": false,
        "since": "2026-02-09T00:00:00Z"
      }
    },
    {
      "id": "cmd_002",
      "type": "CONFIG_UPDATE",
      "priority": "normal",
      "params": {
        "heartbeat_interval": 60,
        "display_brightness": 80
      }
    }
  ],
  "config_updates": {
    "heartbeat_interval": 60,
    "dispensing_audio_enabled": true,
    "volume_level": 70,
    "display_brightness": 80,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "invalid_token",
  "message": "Device token expired or invalid",
  "retry_after": 0
}
```

**Response (429 Too Many Requests)**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many heartbeat requests",
  "retry_after": 30
}
```

### 3.3 Command Types

| Command Type | Priority | Description | Parameters |
|:-------------|:---------|:------------|:-----------|
| **SYNC_SCHEDULE** | High | Fetch latest medication schedule | `force_full` (bool), `since` (ISO8601) |
| **FIRMWARE_UPDATE** | High | Download and install firmware update | `version`, `download_url`, `checksum_sha256`, `mandatory` |
| **CONFIG_UPDATE** | Normal | Update device configuration | `heartbeat_interval`, `dispensing_audio_enabled`, `volume_level`, `display_brightness`, `quiet_hours_start`, `quiet_hours_end` |
| **FORCE_DISPENSE** | High | Immediately dispense medication | `slot`, `pills_count`, `reason` |
| **DIAGNOSTIC_MODE** | Low | Enable extended diagnostics | `enabled` (bool), `duration_seconds` |
| **REBOOT** | High | Reboot device | `delay_seconds` (default: 5) |
| **FACTORY_RESET** | Critical | Reset device to factory state | `confirm_token` (required) |
| **REMOTE_WIPE** | Critical | Erase all data and deactivate | `reason` (string) |

### 3.4 Command Execution Flow

```
Device receives command → Validate command → Execute → Report result via event
```

**Command Acknowledgment**:
Device must acknowledge command receipt and execution status via event reporting:

```json
{
  "event": "COMMAND_EXECUTED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:05Z",
  "sequence": 12346,
  "data": {
    "command_id": "cmd_001",
    "command_type": "SYNC_SCHEDULE",
    "status": "success",
    "execution_time_ms": 150
  }
}
```

---

## 4. Event Reporting Protocol

Devices report events asynchronously to provide real-time status updates and audit trails.

### 4.1 Base Event Structure

All events follow this base structure:

```json
{
  "event": "EVENT_TYPE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12345,
  "data": {
    // Event-specific data
  }
}
```

**Field Descriptions**:
- `event`: Event type identifier (string, uppercase with underscores)
- `device_id`: Device identifier (format: SMD-{8 hex})
- `timestamp`: ISO 8601 UTC timestamp
- `sequence`: Monotonically increasing sequence number (64-bit integer)
- `data`: Event-specific payload (object)

### 4.2 Complete Event Type Catalog

#### DOSE_DISPENSED

Triggered when medication is physically dispensed from a slot.

```json
{
  "event": "DOSE_DISPENSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12345,
  "data": {
    "slot": 1,
    "medication": "Aspirin",
    "pills_count": 1,
    "scheduled_at": "2026-02-10T08:00:00Z",
    "sensor_readings": {
      "pill_count_optical": 1,
      "weight_before_g": 25.5,
      "weight_after_g": 24.8,
      "motor_steps": 120,
      "motor_duration_ms": 350
    },
    "schedule_id": "schedule-uuid-here"
  }
}
```

#### DOSE_TAKEN

Triggered when user confirms medication was taken.

```json
{
  "event": "DOSE_TAKEN",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:05:00Z",
  "sequence": 12346,
  "data": {
    "slot": 1,
    "medication": "Aspirin",
    "pills_count": 1,
    "dispensed_at": "2026-02-10T08:00:00Z",
    "user_interaction": {
      "button_pressed": true,
      "app_confirmed": false,
      "voice_confirmed": false,
      "confirmation_method": "button"
    },
    "schedule_id": "schedule-uuid-here",
    "dispense_event_id": "event-uuid-here"
  }
}
```

#### DOSE_PARTIAL

Triggered when only some pills from a dispensed dose are taken.

```json
{
  "event": "DOSE_PARTIAL",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:10:00Z",
  "sequence": 12347,
  "data": {
    "slot": 1,
    "medication": "Aspirin",
    "dispensed_count": 2,
    "taken_count": 1,
    "remaining_count": 1,
    "dispensed_at": "2026-02-10T08:00:00Z",
    "schedule_id": "schedule-uuid-here"
  }
}
```

#### DOSE_MISSED

Triggered when a scheduled dose is not taken within the allowed time window.

```json
{
  "event": "DOSE_MISSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T09:30:00Z",
  "sequence": 12348,
  "data": {
    "slot": 1,
    "medication": "Aspirin",
    "scheduled_at": "2026-02-10T08:00:00Z",
    "window_end": "2026-02-10T09:00:00Z",
    "schedule_id": "schedule-uuid-here"
  }
}
```

#### REFILL_NEEDED

Triggered when slot medication count falls below threshold (typically 7 days remaining).

```json
{
  "event": "REFILL_NEEDED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12349,
  "data": {
    "slot": 2,
    "medication": "Metformin",
    "pills_count": 14,
    "days_remaining": 7,
    "threshold_days": 7
  }
}
```

#### REFILL_CRITICAL

Triggered when slot medication count falls below critical threshold (typically 3 days remaining).

```json
{
  "event": "REFILL_CRITICAL",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12350,
  "data": {
    "slot": 2,
    "medication": "Metformin",
    "pills_count": 6,
    "days_remaining": 3,
    "threshold_days": 3
  }
}
```

#### REFILL_EMPTY

Triggered when slot becomes empty (0 pills).

```json
{
  "event": "REFILL_EMPTY",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12351,
  "data": {
    "slot": 2,
    "medication": "Metformin",
    "last_dispensed": "2026-02-09T20:00:00Z"
  }
}
```

#### DEVICE_ONLINE

Triggered when device comes online (boot, wake from sleep, reconnection).

```json
{
  "event": "DEVICE_ONLINE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T06:00:00Z",
  "sequence": 12352,
  "data": {
    "boot_reason": "power_on",
    "firmware_version": "1.2.0",
    "hardware_version": "1.0",
    "uptime_seconds": 0,
    "last_offline": "2026-02-09T22:00:00Z"
  }
}
```

**Boot Reasons**:
- `power_on`: Normal power-on
- `reset`: Software reset (watchdog, crash recovery)
- `watchdog`: Watchdog timer reset
- `crash`: Crash recovery reboot
- `ota`: OTA update reboot
- `sleep`: Wake from deep sleep

#### DEVICE_OFFLINE

Triggered when device is about to go offline (graceful shutdown, sleep mode).

```json
{
  "event": "DEVICE_OFFLINE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T22:00:00Z",
  "sequence": 12353,
  "data": {
    "reason": "sleep",
    "next_wake": "2026-02-11T06:00:00Z",
    "battery_level_percent": 85
  }
}
```

#### DEVICE_ERROR

Triggered when device encounters a non-fatal error.

```json
{
  "event": "DEVICE_ERROR",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12354,
  "data": {
    "error_code": "MOTOR_STALL",
    "error_message": "Motor stalled during dispensing",
    "severity": "warning",
    "component": "dispensing_motor",
    "slot": 1,
    "recoverable": true,
    "recovery_action": "retry"
  }
}
```

#### DEVICE_RECOVERY

Triggered when device recovers from an error state.

```json
{
  "event": "DEVICE_RECOVERY",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:01:00Z",
  "sequence": 12355,
  "data": {
    "error_code": "MOTOR_STALL",
    "recovery_method": "retry",
    "recovery_time_ms": 500
  }
}
```

#### BATTERY_LOW

Triggered when battery level falls below 20%.

```json
{
  "event": "BATTERY_LOW",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12356,
  "data": {
    "battery_level_percent": 18,
    "voltage_mv": 3600,
    "charging": false,
    "estimated_hours_remaining": 4
  }
}
```

#### BATTERY_CRITICAL

Triggered when battery level falls below 10%.

```json
{
  "event": "BATTERY_CRITICAL",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12357,
  "data": {
    "battery_level_percent": 8,
    "voltage_mv": 3400,
    "charging": false,
    "estimated_minutes_remaining": 30
  }
}
```

#### BATTERY_CHARGING

Triggered when device starts charging.

```json
{
  "event": "BATTERY_CHARGING",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12358,
  "data": {
    "battery_level_percent": 15,
    "voltage_mv": 3500,
    "charging": true
  }
}
```

#### BATTERY_FULL

Triggered when battery reaches 100% charge.

```json
{
  "event": "BATTERY_FULL",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T10:00:00Z",
  "sequence": 12359,
  "data": {
    "battery_level_percent": 100,
    "voltage_mv": 4200,
    "charging": false
  }
}
```

#### TRAVEL_MODE_ON

Triggered when travel mode is activated.

```json
{
  "event": "TRAVEL_MODE_ON",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12360,
  "data": {
    "portable_device_id": "SMD-00B2C3D4",
    "planned_end_date": "2026-02-17T10:00:00Z",
    "initiated_by": "user_app"
  }
}
```

#### TRAVEL_MODE_OFF

Triggered when travel mode is deactivated.

```json
{
  "event": "TRAVEL_MODE_OFF",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12361,
  "data": {
    "portable_device_id": "SMD-00B2C3D4",
    "ended_at": "2026-02-10T08:00:00Z",
    "duration_hours": 168
  }
}
```

#### TRAY_OPENED

Triggered when medication tray is opened.

```json
{
  "event": "TRAY_OPENED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12362,
  "data": {
    "opened_by": "user_button",
    "weight_before_g": 0.0
  }
}
```

#### TRAY_CLOSED

Triggered when medication tray is closed.

```json
{
  "event": "TRAY_CLOSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:05:00Z",
  "sequence": 12363,
  "data": {
    "weight_after_g": 25.5,
    "duration_open_seconds": 300
  }
}
```

#### SLOT_LOADED

Triggered when medication is loaded into a slot (detected via weight/tray sensors).

```json
{
  "event": "SLOT_LOADED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:05:00Z",
  "sequence": 12364,
  "data": {
    "slot": 1,
    "medication": "Aspirin",
    "pills_count": 30,
    "estimated_count": 30,
    "weight_g": 30.0,
    "loaded_by": "user"
  }
}
```

#### FIRMWARE_UPDATED

Triggered when firmware update completes successfully.

```json
{
  "event": "FIRMWARE_UPDATED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12365,
  "data": {
    "old_version": "1.1.0",
    "new_version": "1.2.0",
    "update_method": "ota",
    "update_duration_seconds": 180,
    "reboot_required": true
  }
}
```

#### CONFIG_CHANGED

Triggered when device configuration is updated.

```json
{
  "event": "CONFIG_CHANGED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12366,
  "data": {
    "changed_fields": ["heartbeat_interval", "display_brightness"],
    "old_values": {
      "heartbeat_interval": 60,
      "display_brightness": 70
    },
    "new_values": {
      "heartbeat_interval": 60,
      "display_brightness": 80
    },
    "changed_by": "cloud_command"
  }
}
```

### 4.3 Event Priority and Retry

| Event Type | Priority | Max Retries | Offline Queueable | Retry Backoff |
|:-----------|:---------|:------------|:------------------|:--------------|
| DOSE_DISPENSED | High | 10 | Yes | Exponential |
| DOSE_TAKEN | High | 10 | Yes | Exponential |
| DOSE_PARTIAL | High | 10 | Yes | Exponential |
| DOSE_MISSED | High | 10 | Yes | Exponential |
| REFILL_NEEDED | Normal | 5 | Yes | Exponential |
| REFILL_CRITICAL | High | 10 | Yes | Exponential |
| REFILL_EMPTY | High | 10 | Yes | Exponential |
| DEVICE_ONLINE | Normal | 3 | No | Fixed (5s) |
| DEVICE_OFFLINE | Normal | 3 | No | Fixed (5s) |
| DEVICE_ERROR | High | 5 | Yes | Exponential |
| DEVICE_RECOVERY | Normal | 3 | Yes | Exponential |
| BATTERY_LOW | Normal | 5 | Yes | Exponential |
| BATTERY_CRITICAL | High | 10 | Yes | Exponential |
| BATTERY_CHARGING | Low | 3 | Yes | Exponential |
| BATTERY_FULL | Low | 3 | Yes | Exponential |
| TRAVEL_MODE_ON | High | 5 | Yes | Exponential |
| TRAVEL_MODE_OFF | High | 5 | Yes | Exponential |
| TRAY_OPENED | Low | 3 | Yes | Exponential |
| TRAY_CLOSED | Low | 3 | Yes | Exponential |
| SLOT_LOADED | Normal | 5 | Yes | Exponential |
| FIRMWARE_UPDATED | High | 3 | No | Fixed (10s) |
| CONFIG_CHANGED | Normal | 5 | Yes | Exponential |

### 4.4 Event Reporting Endpoint

**Endpoint**: `POST /api/v1/devices/{device_id}/events`

**Request Headers**:
```
Authorization: Bearer {device_token}
Content-Type: application/json
X-Device-ID: SMD-00A1B2C3
```

**Request Body** (single event):
```json
{
  "event": "DOSE_DISPENSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T08:00:00Z",
  "sequence": 12345,
  "data": { ... }
}
```

**Request Body** (batch events):
```json
{
  "events": [
    {
      "event": "DOSE_DISPENSED",
      "timestamp": "2026-02-10T08:00:00Z",
      "sequence": 12345,
      "data": { ... }
    },
    {
      "event": "DOSE_TAKEN",
      "timestamp": "2026-02-10T08:05:00Z",
      "sequence": 12346,
      "data": { ... }
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "received": 2,
  "processed": 2,
  "errors": []
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "validation_error",
  "message": "Invalid event format",
  "details": [
    {
      "field": "data.slot",
      "error": "Slot must be between 1 and 4"
    }
  ]
}
```

---

## 5. Schedule Synchronization

Devices fetch medication schedules from the cloud to determine when to dispense medications.

### 5.1 Full Schedule Fetch

**Endpoint**: `GET /api/v1/devices/{device_id}/schedule`

**Request Headers**:
```
Authorization: Bearer {device_token}
X-Device-ID: SMD-00A1B2C3
```

**Response (200 OK)**:
```json
{
  "device_id": "SMD-00A1B2C3",
  "schedules": [
    {
      "schedule_id": "schedule-uuid-1",
      "container_id": "container-uuid-1",
      "slot": 1,
      "medication": "Aspirin",
      "time_of_day": "08:00",
      "days_of_week": [1, 2, 3, 4, 5, 6, 7],
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": null,
      "pills_per_dose": 1,
      "instructions": {
        "text": "Take with food",
        "audio_id": "audio_aspirin_001",
        "display": true
      },
      "window_minutes": 60,
      "reminder_minutes": [15, 30],
      "skip_dates": [],
      "special_rules": {
        "allow_early_minutes": 30,
        "allow_late_minutes": 60,
        "require_confirmation": true,
        "escalate_to_caregiver_minutes": 120
      },
      "active": true
    },
    {
      "schedule_id": "schedule-uuid-2",
      "container_id": "container-uuid-2",
      "slot": 2,
      "medication": "Metformin",
      "time_of_day": "20:00",
      "days_of_week": [1, 2, 3, 4, 5, 6, 7],
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": null,
      "pills_per_dose": 1,
      "instructions": {
        "text": "Take with dinner",
        "audio_id": "audio_metformin_001",
        "display": true
      },
      "window_minutes": 120,
      "reminder_minutes": [30, 60],
      "skip_dates": ["2026-02-15"],
      "special_rules": {
        "allow_early_minutes": 60,
        "allow_late_minutes": 120,
        "require_confirmation": true,
        "escalate_to_caregiver_minutes": 180
      },
      "active": true
    }
  ],
  "last_updated": "2026-02-10T07:00:00Z",
  "version": 42
}
```

### 5.2 Incremental Sync

**Endpoint**: `GET /api/v1/devices/{device_id}/schedule?since={iso8601_timestamp}`

**Query Parameters**:
- `since` (optional): ISO 8601 timestamp - only return schedules updated after this time

**Example Request**:
```
GET /api/v1/devices/SMD-00A1B2C3/schedule?since=2026-02-09T00:00:00Z
```

**Response (200 OK)**:
```json
{
  "device_id": "SMD-00A1B2C3",
  "schedules": [
    {
      "schedule_id": "schedule-uuid-2",
      "container_id": "container-uuid-2",
      "slot": 2,
      "medication": "Metformin",
      "time_of_day": "20:00",
      "days_of_week": [1, 2, 3, 4, 5, 6, 7],
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": null,
      "pills_per_dose": 1,
      "instructions": {
        "text": "Take with dinner",
        "audio_id": "audio_metformin_001",
        "display": true
      },
      "window_minutes": 120,
      "reminder_minutes": [30, 60],
      "skip_dates": ["2026-02-15"],
      "special_rules": {
        "allow_early_minutes": 60,
        "allow_late_minutes": 120,
        "require_confirmation": true,
        "escalate_to_caregiver_minutes": 180
      },
      "active": true,
      "updated_at": "2026-02-10T07:30:00Z"
    }
  ],
  "deleted": ["schedule-uuid-3"],
  "last_updated": "2026-02-10T07:30:00Z",
  "version": 43
}
```

### 5.3 Schedule Confirmation

Device confirms it has received and stored the schedule.

**Endpoint**: `POST /api/v1/devices/{device_id}/schedule/confirm`

**Request Headers**:
```
Authorization: Bearer {device_token}
Content-Type: application/json
X-Device-ID: SMD-00A1B2C3
```

**Request Body**:
```json
{
  "version": 43,
  "received_at": "2026-02-10T08:00:00Z"
}
```

**Response (200 OK)**:
```json
{
  "confirmed": true,
  "version": 43
}
```

---

## 6. OTA Firmware Updates

Devices support Over-The-Air (OTA) firmware updates with dual-partition A/B scheme for safe updates.

### 6.1 Update Check Flow

**Endpoint**: `GET /api/v1/devices/{device_id}/firmware?current_version={version}`

**Request Headers**:
```
Authorization: Bearer {device_token}
X-Device-ID: SMD-00A1B2C3
```

**Query Parameters**:
- `current_version` (required): Current firmware version (e.g., "1.2.0")

**Response (200 OK - Update Available)**:
```json
{
  "update_available": true,
  "version": "1.3.0",
  "download_url": "https://firmware.smartdispenser.ch/v1.3.0/firmware.bin",
  "size_bytes": 2097152,
  "checksum_sha256": "a1b2c3d4e5f6...",
  "signature_rsa3072": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
  "release_notes": "Bug fixes and performance improvements",
  "mandatory": false,
  "min_battery_percent": 30,
  "min_wifi_signal_dbm": -70
}
```

**Response (200 OK - No Update)**:
```json
{
  "update_available": false,
  "current_version": "1.2.0",
  "latest_version": "1.2.0"
}
```

### 6.2 Update Prerequisites

Before initiating an OTA update, device must verify:

| Prerequisite | Requirement | Validation |
|:-------------|:------------|:-----------|
| **Battery Level** | > 30% | Check battery level before download |
| **Scheduled Doses** | No dose within 1 hour | Check next scheduled dose time |
| **WiFi Signal** | > -70 dBm | Measure current WiFi RSSI |
| **Free Storage** | > Update size + 10% margin | Check available flash space |
| **Active Partition** | Valid boot partition | Verify current partition is bootable |

**Pre-Update Validation**:
```json
{
  "battery_level_percent": 85,
  "next_dose_at": "2026-02-10T12:00:00Z",
  "wifi_signal_dbm": -45,
  "free_storage_bytes": 10485760,
  "update_size_bytes": 2097152,
  "prerequisites_met": true
}
```

### 6.3 Dual-Partition A/B Update

ESP32-S3 devices use dual OTA partitions for safe updates:

```
Flash Layout:
┌─────────────────────────────────────┐
│ Bootloader (64 KB)                  │
├─────────────────────────────────────┤
│ Partition Table (4 KB)              │
├─────────────────────────────────────┤
│ OTA Partition 0 (ota_0) - 2 MB      │ ← Active partition
│   └─ Current firmware v1.2.0        │
├─────────────────────────────────────┤
│ OTA Partition 1 (ota_1) - 2 MB      │ ← Inactive partition
│   └─ (empty or old firmware)        │
├─────────────────────────────────────┤
│ NVS (Non-Volatile Storage) - 16 KB  │
│   └─ Device config, tokens          │
└─────────────────────────────────────┘
```

**Update Process**:

1. **Download Firmware**:
   - Download firmware binary from `download_url`
   - Write to inactive partition (ota_1 if ota_0 is active)
   - Verify download integrity (SHA256 checksum)

2. **Verify Signature**:
   - Verify RSA-3072 signature using server public key
   - Signature stored in device firmware (hardcoded public key)
   - Reject update if signature invalid

3. **Switch Active Partition**:
   - Update partition table to mark new partition as active
   - Set boot flag to new partition
   - Reboot device

4. **Boot Validation**:
   - Bootloader loads firmware from active partition
   - Firmware performs self-validation:
     - Check firmware version matches expected
     - Verify critical functions (WiFi, dispensing motor)
     - Report boot status via heartbeat

5. **Rollback on Failure**:
   - If boot validation fails 3 consecutive times → automatic rollback
   - Switch back to previous partition
   - Report rollback event to cloud

### 6.4 Update Status Reporting

**Endpoint**: `POST /api/v1/devices/{device_id}/firmware/status`

**Request Headers**:
```
Authorization: Bearer {device_token}
Content-Type: application/json
X-Device-ID: SMD-00A1B2C3
```

**Request Body**:
```json
{
  "update_version": "1.3.0",
  "status": "downloading",
  "progress_percent": 45,
  "error": null
}
```

**Update States**:

| State | Description | Progress | Next State |
|:------|:------------|:---------|:-----------|
| `downloading` | Downloading firmware binary | 0-90% | `verifying` |
| `verifying` | Verifying checksum and signature | 90-95% | `installing` |
| `installing` | Writing to partition, switching boot | 95-99% | `completed` or `failed` |
| `completed` | Update successful, device rebooted | 100% | — |
| `failed` | Update failed (download/verify/install error) | — | Retry or rollback |
| `rolled_back` | Update failed, rolled back to previous version | — | — |

**Status Examples**:

**Downloading**:
```json
{
  "update_version": "1.3.0",
  "status": "downloading",
  "progress_percent": 45,
  "bytes_downloaded": 943718,
  "bytes_total": 2097152,
  "error": null
}
```

**Verifying**:
```json
{
  "update_version": "1.3.0",
  "status": "verifying",
  "progress_percent": 92,
  "checksum_verified": true,
  "signature_verified": true,
  "error": null
}
```

**Completed**:
```json
{
  "update_version": "1.3.0",
  "status": "completed",
  "progress_percent": 100,
  "installed_at": "2026-02-10T08:30:00Z",
  "rebooted_at": "2026-02-10T08:31:00Z",
  "error": null
}
```

**Failed**:
```json
{
  "update_version": "1.3.0",
  "status": "failed",
  "progress_percent": 45,
  "error": "DOWNLOAD_ERROR",
  "error_message": "Network timeout during download",
  "retry_possible": true
}
```

**Rolled Back**:
```json
{
  "update_version": "1.3.0",
  "status": "rolled_back",
  "previous_version": "1.2.0",
  "rollback_reason": "BOOT_VALIDATION_FAILED",
  "boot_failure_count": 3,
  "rolled_back_at": "2026-02-10T08:35:00Z"
}
```

### 6.5 Rollback Strategy

**Automatic Rollback**:
- Device attempts to boot new firmware
- If boot validation fails → increment failure counter
- After 3 consecutive failures → automatic rollback
- Switch partition table back to previous partition
- Boot from previous firmware
- Report rollback event to cloud

**Manual Rollback**:
- Server sends `REBOOT` command with rollback flag via heartbeat
- Device switches to previous partition
- Reboots and reports status

**Version Protection**:
- Firmware version stored in eFuse (monotonically increasing)
- Prevents downgrade attacks (cannot install older firmware)
- Version counter increments with each successful update

---

## 7. Offline Mode

Devices must operate reliably even when cloud connectivity is unavailable.

### 7.1 Offline Detection

**Detection Criteria**:
- 3 consecutive missed heartbeats (3 × 60s = 180 seconds)
- Network error (DNS failure, connection timeout, TLS handshake failure)
- HTTP 5xx server errors (temporary server issues)

**Offline State Machine**:
```
Online → [3 missed heartbeats] → Offline → [Reconnect] → Online
```

### 7.2 Offline Capabilities

When offline, device continues operating with cached data:

| Capability | Description | Limitation |
|:-----------|:------------|:-----------|
| **Dispensing** | Continue dispensing from cached schedule | Schedule must be cached locally |
| **Event Storage** | Store events locally in NVS/SPIFFS | Max 1000 events, 7 days retention |
| **Audio Alerts** | Play medication reminders | Uses cached audio files |
| **Visual Alerts** | Display notifications on screen | No cloud-synced content |
| **User Interaction** | Button presses, tray open/close | All interactions logged locally |
| **Battery Monitoring** | Continue monitoring battery | Alerts stored for later sync |

### 7.3 Local Event Queue

Events are stored locally when offline:

**Storage Format** (JSON in SPIFFS):
```json
{
  "pending_events": [
    {
      "id": "local_001",
      "event": "DOSE_TAKEN",
      "device_id": "SMD-00A1B2C3",
      "timestamp": "2026-02-06T08:01:30Z",
      "sequence": 12345,
      "data": {
        "slot": 1,
        "medication": "Aspirin",
        "pills_count": 1,
        "dispensed_at": "2026-02-06T08:00:00Z",
        "user_interaction": {
          "button_pressed": true,
          "app_confirmed": false,
          "voice_confirmed": false,
          "confirmation_method": "button"
        }
      },
      "retry_count": 3,
      "last_retry": "2026-02-06T08:15:00Z",
      "priority": "high"
    },
    {
      "id": "local_002",
      "event": "REFILL_NEEDED",
      "device_id": "SMD-00A1B2C3",
      "timestamp": "2026-02-06T09:00:00Z",
      "sequence": 12346,
      "data": {
        "slot": 2,
        "medication": "Metformin",
        "pills_count": 14,
        "days_remaining": 7
      },
      "retry_count": 0,
      "last_retry": null,
      "priority": "normal"
    }
  ],
  "last_sync": "2026-02-06T07:00:00Z",
  "offline_since": "2026-02-06T08:00:00Z",
  "total_events": 2,
  "max_events": 1000,
  "max_age_days": 7
}
```

**Queue Management**:
- **FIFO Order**: Oldest events sent first when reconnecting
- **Priority Queue**: High-priority events (DOSE_TAKEN, BATTERY_CRITICAL) sent before normal events
- **Size Limit**: Maximum 1000 events stored locally
- **Age Limit**: Events older than 7 days are discarded (prevents stale data)
- **Retry Logic**: Each event tracks retry count and last retry timestamp

### 7.4 Reconnection & Sync

When connectivity is restored:

**Step 1: Reconnect to WiFi**
- Device detects WiFi availability
- Reconnects to configured network
- Validates internet connectivity (ping to 8.8.8.8 or DNS query)

**Step 2: Send Heartbeat**
- Establishes session with cloud
- Reports offline duration and pending events count
- Receives any pending commands

**Step 3: Sync Queued Events**
- Send events in batches (max 10 events per request)
- Process oldest events first (FIFO)
- High-priority events sent before normal-priority
- Remove successfully sent events from local queue
- Retry failed events according to retry policy

**Step 4: Fetch Latest Schedule**
- Request full schedule sync
- Update local cache with latest schedule
- Confirm schedule receipt

**Step 5: Resume Normal Operation**
- Resume normal heartbeat loop (60s interval)
- Continue dispensing according to updated schedule
- Report online status via DEVICE_ONLINE event

**Reconnection Flow**:
```
Offline → WiFi Reconnect → Heartbeat → Sync Events → Sync Schedule → Online
```

### 7.5 Retry Strategy (Exponential Backoff)

**Retry Table**:

| Attempt | Wait Time | Cumulative Time | Use Case |
|:--------|:----------|:----------------|:---------|
| 1 | 0s | 0s | Immediate retry |
| 2 | 5s | 5s | First retry |
| 3 | 15s | 20s | Second retry |
| 4 | 60s | 80s | Third retry |
| 5 | 300s (5 min) | 380s | Fourth retry |
| 6+ | 600s (10 min) | 980s+ | Subsequent retries |

**HTTP Status Code Handling**:

| Status Code | Action | Retry? |
|:------------|:-------|:------|
| **200 OK** | Success | No |
| **201 Created** | Success | No |
| **400 Bad Request** | Client error (invalid request) | No (fix request) |
| **401 Unauthorized** | Token expired/invalid | Yes (refresh token first) |
| **403 Forbidden** | Authorization failed | No (fix permissions) |
| **404 Not Found** | Resource not found | No (fix resource ID) |
| **409 Conflict** | Resource conflict | No (resolve conflict) |
| **429 Too Many Requests** | Rate limited | Yes (wait `retry_after` seconds) |
| **500 Internal Server Error** | Server error | Yes (exponential backoff) |
| **502 Bad Gateway** | Gateway error | Yes (exponential backoff) |
| **503 Service Unavailable** | Service unavailable | Yes (exponential backoff) |
| **504 Gateway Timeout** | Gateway timeout | Yes (exponential backoff) |
| **Network Error** | Connection failed | Yes (exponential backoff) |
| **Timeout** | Request timeout | Yes (exponential backoff) |

**Token Refresh on 401**:
1. Device receives 401 Unauthorized
2. Attempt to refresh device token (if refresh endpoint available)
3. If refresh succeeds → retry original request with new token
4. If refresh fails → enter offline mode, queue request

---

## 8. Security Protocol

### 8.1 TLS Configuration

**Protocol Version**:
- **Minimum**: TLS 1.3
- **Preferred**: TLS 1.3 only
- **Fallback**: TLS 1.2 (deprecated, will be removed in future)

**Cipher Suites** (TLS 1.3):
- `TLS_AES_256_GCM_SHA384` (preferred)
- `TLS_CHACHA20_POLY1305_SHA256` (fallback)
- `TLS_AES_128_GCM_SHA256` (fallback)

**Certificate Validation**:
- **Certificate Pinning**: SHA-256 fingerprint of Subject Public Key Info (SPKI)
- **OCSP Stapling**: Supported (reduces certificate validation latency)
- **Certificate Chain**: Validates full chain to trusted root CA

**Certificate Pinning Implementation**:
```
Server Certificate SPKI SHA-256: a1b2c3d4e5f6...
Stored in device firmware (hardcoded)
Validated on every TLS handshake
Reject connection if fingerprint mismatch
```

### 8.2 Token Management

**Device JWT Token**:
- **Algorithm**: RS256 (RSA Signature with SHA-256)
- **Key Size**: RSA-2048 or RSA-3072
- **Expiry**: 1 year (configurable)
- **Claims**:
  - `sub`: Device ID (e.g., "SMD-00A1B2C3")
  - `iss`: Issuer ("smartdispenser.ch")
  - `aud`: Audience ("device-api")
  - `exp`: Expiration timestamp
  - `iat`: Issued at timestamp
  - `jti`: JWT ID (unique token identifier)

**Token Storage**:
- Stored in encrypted NVS partition
- Encryption: AES-256-GCM
- Key Derivation: PBKDF2-SHA256 (device_id as salt, 10000 iterations)
- Key never stored in plaintext

**Token Refresh**:
- Device receives refresh command via heartbeat
- New token provided in command response
- Device updates stored token atomically
- Old token invalidated on server

**Token Revocation**:
- Server can revoke token (e.g., device reported stolen)
- Revoked tokens rejected with 401 Unauthorized
- Device must re-register with provisioning token

### 8.3 Data Encryption

**In Transit**:
- **Protocol**: TLS 1.3
- **Encryption**: AES-256-GCM or ChaCha20-Poly1305
- **Key Exchange**: ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)
- **Perfect Forward Secrecy**: Yes (ephemeral keys)

**At Rest** (Device Storage):
- **Sensitive Data**: Device tokens, WiFi passwords, user data
- **Encryption**: AES-256-GCM
- **Key Storage**: Derived from device_id + hardware unique ID
- **NVS Encryption**: ESP-IDF NVS encryption API

**Key Derivation**:
```
Master Key = PBKDF2-SHA256(
  password = device_id + hardware_id,
  salt = device_id,
  iterations = 10000
)
```

### 8.4 API Key Authentication (Alternative)

For external systems or testing, X-API-Key header authentication is supported:

**Request Headers**:
```
X-API-Key: sk_live_a1b2c3d4e5f6...
X-Device-ID: SMD-00A1B2C3
```

**API Key Format**:
- Prefix: `sk_live_` (production) or `sk_test_` (testing)
- Key: 32-character hexadecimal string
- Stored as SHA-256 hash on server (never plaintext)

**Key Scopes**:
- Device-specific keys: Limited to single device
- Admin keys: Full access to all devices (testing only)

---

## 9. Rate Limits

To prevent abuse and ensure fair resource usage, the API implements rate limiting:

| Endpoint | Limit | Window | Headers |
|:---------|:------|:-------|:--------|
| `/api/v1/devices/{id}/heartbeat` | 2 requests | 1 minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/api/v1/devices/{id}/events` | 60 requests | 1 minute | Same as above |
| `/api/v1/devices/{id}/schedule` | 10 requests | 1 minute | Same as above |
| `/api/v1/devices/{id}/firmware` | 5 requests | 1 hour | Same as above |
| All other endpoints | 100 requests | 1 minute | Same as above |

**Rate Limit Headers** (included in all responses):
```
X-RateLimit-Limit: 2
X-RateLimit-Remaining: 1
X-RateLimit-Reset: 1644480000
```

**Rate Limit Exceeded Response (429)**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Limit: 2 per minute.",
  "retry_after": 30
}
```

**Rate Limit Strategy**:
- **Sliding Window**: Rate limits use sliding window algorithm
- **Per-Device**: Limits applied per device_id (not per IP)
- **Graceful Degradation**: Device should back off and retry after `retry_after` seconds

---

## 10. Sequence Diagrams

### 10.1 Normal Operation Flow

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Device  │                    │  Cloud   │                    │  User   │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                               │                               │
     │ 1. Boot                       │                               │
     │──────────────────────────────▶│                               │
     │                               │                               │
     │ 2. Register (POST /register)  │                               │
     │──────────────────────────────▶│                               │
     │                               │ 3. Create device record       │
     │                               │    Generate JWT token         │
     │ 4. Registration Response      │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
     │ 5. Store token (encrypted)   │                               │
     │                               │                               │
     │ 6. Heartbeat Loop (every 60s) │                               │
     │──────────────────────────────▶│                               │
     │                               │ 7. Process heartbeat          │
     │                               │    Check for commands         │
     │ 8. Heartbeat Response         │                               │
     │◀──────────────────────────────│                               │
     │    (commands: [])             │                               │
     │                               │                               │
     │ 9. Schedule Sync (if needed)  │                               │
     │──────────────────────────────▶│                               │
     │                               │ 10. Return schedule           │
     │ 11. Schedule Response         │                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
     │ 12. Dose Time Reached         │                               │
     │                               │                               │
     │ 13. Dispense Medication       │                               │
     │                               │                               │
     │ 14. DOSE_DISPENSED Event      │                               │
     │──────────────────────────────▶│                               │
     │                               │ 15. Process event             │
     │                               │    Notify user/caregiver      │
     │                               │──────────────────────────────▶│
     │                               │                               │
     │                               │                               │ 16. User confirms
     │                               │                               │    (via app/button)
     │                               │                               │
     │ 17. DOSE_TAKEN Event          │                               │
     │──────────────────────────────▶│                               │
     │                               │ 18. Update adherence          │
     │                               │                               │
     │ 19. Continue Heartbeat Loop   │                               │
     │──────────────────────────────▶│                               │
     │◀──────────────────────────────│                               │
     │                               │                               │
```

### 10.2 Offline Recovery Flow

```
┌─────────┐                    ┌──────────┐
│ Device  │                    │  Cloud   │
└────┬────┘                    └────┬─────┘
     │                               │
     │ 1. Heartbeat (attempt 1)       │
     │──────────────────────────────▶│
     │                               │ ❌ Network error
     │                               │    (timeout)
     │                               │
     │ 2. Heartbeat (attempt 2)      │
     │──────────────────────────────▶│
     │                               │ ❌ Network error
     │                               │
     │ 3. Heartbeat (attempt 3)      │
     │──────────────────────────────▶│
     │                               │ ❌ Network error
     │                               │
     │ 4. Enter Offline Mode         │
     │    - Cache events locally     │
     │    - Continue dispensing      │
     │    - Retry every 60s          │
     │                               │
     │ 5. Store DOSE_DISPENSED       │
     │    (local queue)              │
     │                               │
     │ 6. Store DOSE_TAKEN           │
     │    (local queue)              │
     │                               │
     │ 7. Retry Connection (60s)     │
     │──────────────────────────────▶│
     │                               │ ❌ Still offline
     │                               │
     │ 8. Continue Offline Operation │
     │    (dispensing, events)       │
     │                               │
     │ 9. WiFi Reconnected           │
     │                               │
     │ 10. Heartbeat (success)       │
     │──────────────────────────────▶│
     │                               │ ✅ Online
     │ 11. Heartbeat Response        │
     │◀──────────────────────────────│
     │    (pending_events: 2)        │
     │                               │
     │ 12. Sync Events (batch 1)     │
     │──────────────────────────────▶│
     │                               │ 13. Process events
     │ 14. Sync Response             │
     │◀──────────────────────────────│
     │    (received: 2)              │
     │                               │
     │ 15. Sync Schedule             │
     │──────────────────────────────▶│
     │                               │ 16. Return schedule
     │ 17. Schedule Response         │
     │◀──────────────────────────────│
     │                               │
     │ 18. Resume Normal Operation   │
     │                               │
```

### 10.3 OTA Update Flow

```
┌─────────┐                    ┌──────────┐
│ Device  │                    │  Cloud   │
└────┬────┘                    └────┬─────┘
     │                               │
     │ 1. Heartbeat                  │
     │──────────────────────────────▶│
     │                               │
     │ 2. Heartbeat Response         │
     │◀──────────────────────────────│
     │    commands: [                │
     │      {                        │
     │        type: "FIRMWARE_UPDATE"│
     │        version: "1.3.0"      │
     │        download_url: "..."   │
     │      }                        │
     │    ]                          │
     │                               │
     │ 3. Check Prerequisites        │
     │    - Battery > 30% ✅         │
     │    - No dose in 1h ✅         │
     │    - WiFi signal OK ✅       │
     │                               │
     │ 4. Update Status: downloading │
     │──────────────────────────────▶│
     │                               │
     │ 5. Download Firmware         │
     │    (from download_url)        │
     │                               │
     │ 6. Update Status: verifying   │
     │──────────────────────────────▶│
     │                               │
     │ 7. Verify SHA256 Checksum     │
     │    ✅ Checksum valid          │
     │                               │
     │ 8. Verify RSA-3072 Signature  │
     │    ✅ Signature valid         │
     │                               │
     │ 9. Update Status: installing  │
     │──────────────────────────────▶│
     │                               │
     │ 10. Write to Inactive         │
     │     Partition (ota_1)         │
     │                               │
     │ 11. Switch Active Partition   │
     │     (ota_0 → ota_1)          │
     │                               │
     │ 12. Reboot                    │
     │                               │
     │ 13. Boot from ota_1           │
     │     (new firmware)           │
     │                               │
     │ 14. Boot Validation           │
     │     ✅ WiFi OK                │
     │     ✅ Motor OK               │
     │                               │
     │ 15. Update Status: completed  │
     │──────────────────────────────▶│
     │                               │
     │ 16. FIRMWARE_UPDATED Event    │
     │──────────────────────────────▶│
     │                               │
     │ 17. Resume Normal Operation   │
     │                               │
```

### 10.4 Error Reporting and Recovery Flow

```
┌─────────┐                    ┌──────────┐
│ Device  │                    │  Cloud   │
└────┬────┘                    └────┬─────┘
     │                               │
     │ 1. Dispense Attempt           │
     │    (Slot 1, 1 pill)           │
     │                               │
     │ 2. Motor Stall Detected       │
     │    (sensor timeout)           │
     │                               │
     │ 3. DEVICE_ERROR Event         │
     │──────────────────────────────▶│
     │    error_code: "MOTOR_STALL"  │
     │    severity: "warning"        │
     │                               │
     │ 4. Retry Dispense             │
     │    (back off motor)           │
     │                               │
     │ 5. Dispense Success           │
     │                               │
     │ 6. DEVICE_RECOVERY Event      │
     │──────────────────────────────▶│
     │    error_code: "MOTOR_STALL"  │
     │    recovery_method: "retry"   │
     │                               │
     │ 7. DOSE_DISPENSED Event       │
     │──────────────────────────────▶│
     │                               │
     │ 8. Continue Normal Operation  │
     │                               │
```

---

## 11. Error Codes Reference

### 11.1 Device Error Codes

| Error Code | Severity | Description | Recovery Action |
|:-----------|:---------|:------------|:----------------|
| `MOTOR_STALL` | Warning | Motor stalled during dispensing | Retry with backoff |
| `SENSOR_FAILURE` | Error | Sensor reading failed | Use fallback method |
| `SLOT_EMPTY` | Warning | Attempted dispense from empty slot | Alert user, skip dose |
| `TRAY_OPEN` | Warning | Tray opened during dispense | Pause, wait for close |
| `BATTERY_CRITICAL` | Critical | Battery below 10% | Enter power save mode |
| `STORAGE_FULL` | Error | Local storage full | Delete oldest events |
| `WIFI_DISCONNECTED` | Warning | WiFi connection lost | Retry connection |
| `NVS_CORRUPTION` | Critical | NVS data corruption | Factory reset required |
| `FIRMWARE_CRC_ERROR` | Critical | Firmware checksum invalid | Rollback to previous |

### 11.2 API Error Codes

| HTTP Status | Error Code | Description | Client Action |
|:------------|:-----------|:------------|:--------------|
| 400 | `validation_error` | Request validation failed | Fix request format |
| 401 | `invalid_token` | Token expired or invalid | Refresh token |
| 403 | `forbidden` | Insufficient permissions | Check device ownership |
| 404 | `not_found` | Resource not found | Verify resource ID |
| 409 | `conflict` | Resource conflict | Resolve conflict |
| 429 | `rate_limit_exceeded` | Too many requests | Wait and retry |
| 500 | `internal_error` | Server error | Retry with backoff |
| 503 | `service_unavailable` | Service temporarily unavailable | Retry with backoff |

---

## 12. Appendix

### 12.1 Device ID Format

- **Format**: `SMD-{8 hex characters}`
- **Example**: `SMD-00A1B2C3`
- **Validation**: Regex `^SMD-[0-9A-F]{8}$`
- **Storage**: eFuse (read-only after factory provisioning)

### 12.2 Timestamp Format

- **Format**: ISO 8601 UTC
- **Example**: `2026-02-10T08:00:00Z`
- **Precision**: Seconds (milliseconds optional)
- **Timezone**: Always UTC (Z suffix)

### 12.3 Sequence Numbers

- **Type**: 64-bit unsigned integer
- **Range**: 0 to 2^64 - 1
- **Behavior**: Monotonically increasing, wraps to 0 after max
- **Usage**: Event ordering, duplicate detection

### 12.4 Firmware Version Format

- **Format**: Semantic versioning (SemVer)
- **Example**: `1.2.3`
- **Components**: `MAJOR.MINOR.PATCH`
- **Comparison**: Lexicographic (string comparison)

---

**End of Document**
