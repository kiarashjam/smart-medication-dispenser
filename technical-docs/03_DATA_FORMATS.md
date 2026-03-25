# Data Formats Reference

**JSON Schema & API Payload Specifications**

**Version 3.0**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Target Audience | Firmware Engineers, Backend Developers, Mobile/Web Developers |
| API Version | v1 (Device), User/App API |

---

## 1. Core Principles

### 1.1 JSON Standards

| Principle | Implementation |
|:----------|:---------------|
| Encoding | UTF-8 |
| Date/Time | ISO 8601 with timezone (UTC preferred) |
| Numbers | Native JSON numbers (no quotes) |
| Booleans | Native JSON `true`/`false` |
| Null values | Explicit `null` or omit field |
| Field naming | `snake_case` |

### 1.2 Timestamp Format

```
YYYY-MM-DDTHH:MM:SS.sssZ     (UTC)
YYYY-MM-DDTHH:MM:SS±HH:MM    (with offset)

Examples:
2026-02-06T08:00:00Z           # UTC
2026-02-06T09:00:00+01:00      # CET (Swiss winter)
2026-02-06T10:00:00+02:00      # CEST (Swiss summer)
```

### 1.3 Device ID Format

```
SMD-XXXXXXXX

Where:
- SMD = Smart Medication Dispenser
- XXXXXXXX = 8 hex characters (32-bit unique ID)

Examples:
SMD-00A1B2C3
SMD-FF00EE11
```

---

## 2. Event System

### 2.1 Base Event Structure

Every event sent from device to API follows this structure:

```json
{
  "event": "EVENT_TYPE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:00Z",
  "sequence": 12345,
  "data": {
    // Event-specific payload
  }
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `event` | string | Yes | Event type identifier |
| `device_id` | string | Yes | Unique device ID |
| `timestamp` | string | Yes | ISO 8601 UTC timestamp |
| `sequence` | integer | Yes | Monotonic sequence number |
| `data` | object | Yes | Event-specific data |

### 2.2 Event Types Reference

| Event | Description | Priority | Frequency |
|:------|:------------|:---------|:----------|
| `DOSE_DISPENSED` | Pills released from slot | High | Per dose |
| `DOSE_TAKEN` | Pills confirmed removed | High | Per dose |
| `DOSE_MISSED` | Window expired without confirmation | Critical | Per miss |
| `DOSE_PARTIAL` | Only some pills taken | High | Rare |
| `REFILL_NEEDED` | Stock low (<7 days) | Medium | Daily |
| `REFILL_CRITICAL` | Stock very low (<3 days) | High | Daily |
| `REFILL_EMPTY` | Slot empty | Critical | Once |
| `DEVICE_ONLINE` | Device connected | Low | On connect |
| `DEVICE_OFFLINE` | Device disconnected (server-side) | Medium | On disconnect |
| `DEVICE_ERROR` | Error detected | High | On error |
| `DEVICE_RECOVERY` | Error resolved | Medium | On recovery |
| `BATTERY_LOW` | Battery <20% | Medium | Every 10% drop |
| `BATTERY_CRITICAL` | Battery <5% | High | Every 1% drop |
| `BATTERY_CHARGING` | Charging started | Low | On state change |
| `BATTERY_FULL` | Charging complete | Low | On state change |
| `TRAVEL_MODE_ON` | Travel mode activated | Medium | On activation |
| `TRAVEL_MODE_OFF` | Travel mode deactivated | Medium | On deactivation |
| `TRAY_OPENED` | Output tray accessed | Low | On open |
| `TRAY_CLOSED` | Output tray closed | Low | On close |
| `SLOT_LOADED` | Medication slot filled | Medium | On load |
| `FIRMWARE_UPDATED` | Firmware update complete | Low | On update |
| `CONFIG_CHANGED` | Configuration changed | Low | On change |

---

## 3. Detailed Event Schemas

### 3.1 DOSE_DISPENSED

Sent immediately when pills are released from a slot.

```json
{
  "event": "DOSE_DISPENSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:02Z",
  "sequence": 1001,
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "medication_id": "med_x1y2z3",
    "slot": 1,
    "pills_dispensed": 2,
    "pills_remaining": 83,
    "days_remaining": 41,
    "scheduled_time": "2026-02-06T08:00:00+01:00",
    "actual_time": "2026-02-06T08:00:02+01:00",
    "delay_seconds": 2,
    "dispensing_duration_ms": 2340,
    "sensor_readings": {
      "pill_count_optical": 2,
      "weight_before_g": 0.0,
      "weight_after_g": 1.2,
      "motor_steps": 512
    }
  }
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `schedule_id` | string | Yes | Reference to schedule |
| `medication` | string | Yes | Display name |
| `medication_id` | string | No | Internal medication ID |
| `slot` | integer | Yes | Slot number (1-10) |
| `pills_dispensed` | integer | Yes | Pills released |
| `pills_remaining` | integer | Yes | Pills left in slot |
| `days_remaining` | integer | No | Calculated days supply |
| `scheduled_time` | string | Yes | When dose was scheduled |
| `actual_time` | string | Yes | When dispensed |
| `delay_seconds` | integer | No | Seconds late |
| `dispensing_duration_ms` | integer | No | Mechanism time |
| `sensor_readings` | object | No | Diagnostic data |

### 3.2 DOSE_TAKEN

Sent when weight sensor confirms pills removed from output tray.

```json
{
  "event": "DOSE_TAKEN",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:01:45Z",
  "sequence": 1002,
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "medication_id": "med_x1y2z3",
    "pills_taken": 2,
    "pills_expected": 2,
    "complete": true,
    "seconds_to_take": 103,
    "on_time": true,
    "window_status": "within",
    "sensor_readings": {
      "tray_weight_before_g": 1.2,
      "tray_weight_after_g": 0.0,
      "weight_change_g": -1.2
    },
    "user_interaction": {
      "button_pressed": false,
      "app_confirmed": true,
      "voice_confirmed": false
    }
  }
}
```

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `pills_taken` | integer | Yes | Pills confirmed removed |
| `pills_expected` | integer | Yes | Pills that were dispensed |
| `complete` | boolean | Yes | All pills taken |
| `seconds_to_take` | integer | Yes | Time from dispense to take |
| `on_time` | boolean | Yes | Taken within window |
| `window_status` | string | No | `"within"`, `"late"`, `"early"` |
| `user_interaction` | object | No | How confirmation occurred |

### 3.3 DOSE_MISSED

Sent when the configured window expires without confirmation.

```json
{
  "event": "DOSE_MISSED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:30:00Z",
  "sequence": 1003,
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "medication_id": "med_x1y2z3",
    "scheduled_time": "2026-02-06T08:00:00+01:00",
    "window_minutes": 30,
    "pills_not_taken": 2,
    "tray_status": "pills_present",
    "alerts_sent": {
      "device_audio": 3,
      "device_visual": true,
      "app_notification": 2,
      "caregiver_alert": 1
    },
    "user_acknowledged": false,
    "reason_code": null
  }
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `window_minutes` | integer | How long system waited |
| `tray_status` | string | `"pills_present"`, `"empty"`, `"unknown"` |
| `alerts_sent` | object | Alert count by channel |
| `user_acknowledged` | boolean | Did user dismiss alert |
| `reason_code` | string | Optional: `"nap"`, `"away"`, `"refused"` |

### 3.4 DOSE_PARTIAL

Sent when only some pills were taken.

```json
{
  "event": "DOSE_PARTIAL",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:25:00Z",
  "sequence": 1004,
  "data": {
    "schedule_id": "sch_a1b2c3d4",
    "medication": "Metformin 500mg",
    "pills_dispensed": 2,
    "pills_taken": 1,
    "pills_remaining_in_tray": 1,
    "seconds_to_partial": 1500
  }
}
```

### 3.5 REFILL_NEEDED / REFILL_CRITICAL / REFILL_EMPTY

```json
{
  "event": "REFILL_NEEDED",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:00:05Z",
  "sequence": 1005,
  "data": {
    "medication": "Metformin 500mg",
    "medication_id": "med_x1y2z3",
    "slot": 1,
    "pills_remaining": 14,
    "days_remaining": 7,
    "daily_usage": 2,
    "urgency": "warning",
    "last_refill": "2026-01-07T10:00:00Z",
    "average_consumption_rate": 2.1,
    "projected_empty_date": "2026-02-13"
  }
}
```

| Urgency | Condition |
|:--------|:----------|
| `warning` | 7-14 days remaining |
| `critical` | 3-7 days remaining |
| `empty` | 0 pills |

### 3.6 DEVICE_ONLINE

```json
{
  "event": "DEVICE_ONLINE",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T06:00:00Z",
  "sequence": 1000,
  "data": {
    "firmware_version": "1.2.0",
    "hardware_version": "1.0",
    "boot_reason": "power_on",
    "battery_level": 100,
    "battery_charging": false,
    "wifi_ssid": "HomeNetwork",
    "wifi_signal_dbm": -48,
    "wifi_channel": 6,
    "ip_address": "192.168.1.105",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "offline_duration_seconds": 0,
    "pending_events_count": 0,
    "storage_used_percent": 12,
    "last_heartbeat": null,
    "timezone": "Europe/Zurich",
    "locale": "fr-CH"
  }
}
```

| Boot Reason | Description |
|:------------|:------------|
| `power_on` | Fresh power applied |
| `reset` | Software/hardware reset |
| `watchdog` | Watchdog timeout recovery |
| `crash` | Crash recovery |
| `ota` | After firmware update |
| `sleep` | Wake from deep sleep |

### 3.7 DEVICE_ERROR

```json
{
  "event": "DEVICE_ERROR",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T14:00:00Z",
  "sequence": 1050,
  "data": {
    "error_code": "E101",
    "error_type": "hardware",
    "category": "dispensing",
    "severity": "warning",
    "slot": 1,
    "message": "Pill jam detected in slot 1",
    "description": "Motor stalled during dispensing operation",
    "recoverable": true,
    "auto_recovery_attempted": true,
    "auto_recovery_success": false,
    "user_action_required": true,
    "user_instructions": "Please open slot 1 and clear any jammed pills",
    "diagnostic_data": {
      "motor_current_ma": 850,
      "motor_steps_completed": 256,
      "motor_steps_expected": 512,
      "sensor_blocked": true,
      "retry_count": 3
    },
    "previous_occurrence": "2026-01-15T09:00:00Z",
    "total_occurrences": 2
  }
}
```

| Severity | Description | User Impact |
|:---------|:------------|:------------|
| `info` | Informational | None |
| `warning` | Attention needed | May affect function |
| `error` | Significant issue | Function impaired |
| `critical` | Severe problem | Device unusable |

### 3.8 BATTERY_LOW / BATTERY_CRITICAL

```json
{
  "event": "BATTERY_LOW",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T14:00:00Z",
  "sequence": 1060,
  "data": {
    "battery_level": 18,
    "battery_voltage_mv": 3420,
    "battery_temperature_c": 25,
    "charging": false,
    "estimated_hours_remaining": 8,
    "estimated_doses_remaining": 4,
    "threshold_triggered": 20,
    "power_source": "battery",
    "ac_power_available": false,
    "last_full_charge": "2026-02-05T22:00:00Z"
  }
}
```

### 3.9 TRAVEL_MODE_ON

```json
{
  "event": "TRAVEL_MODE_ON",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T09:00:00Z",
  "sequence": 1070,
  "data": {
    "portable_device_id": "SMD-00P1Q2R3",
    "transfer_method": "bluetooth",
    "medications_transferred": [
      {
        "medication": "Metformin 500mg",
        "medication_id": "med_x1y2z3",
        "from_slot": 1,
        "to_slot": 1,
        "pills_transferred": 28,
        "schedules_transferred": 1
      },
      {
        "medication": "Lisinopril 10mg",
        "medication_id": "med_a1b2c3",
        "from_slot": 2,
        "to_slot": 2,
        "pills_transferred": 14,
        "schedules_transferred": 1
      }
    ],
    "days_loaded": 14,
    "expected_return_date": "2026-02-20",
    "home_device_status": "suspended",
    "travel_destination": null
  }
}
```

### 3.10 TRAVEL_MODE_OFF

```json
{
  "event": "TRAVEL_MODE_OFF",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-20T18:00:00Z",
  "sequence": 1150,
  "data": {
    "portable_device_id": "SMD-00P1Q2R3",
    "days_away": 14,
    "travel_summary": {
      "total_doses_scheduled": 56,
      "doses_taken": 54,
      "doses_missed": 2,
      "doses_partial": 0,
      "adherence_rate": 96.4
    },
    "pills_returned": [
      {
        "medication": "Metformin 500mg",
        "pills_returned": 0
      },
      {
        "medication": "Lisinopril 10mg",
        "pills_returned": 0
      }
    ],
    "home_device_status": "resumed",
    "schedule_sync_status": "complete"
  }
}
```

---

## 4. Heartbeat Format

### 4.1 Request (Device → API)

```json
{
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-06T08:30:00Z",
  "sequence": 12345,
  "uptime_seconds": 86400,
  "firmware_version": "1.2.0",
  "battery": {
    "level": 95,
    "charging": false,
    "voltage_mv": 3850,
    "temperature_c": 24
  },
  "connectivity": {
    "wifi_ssid": "HomeNetwork",
    "wifi_signal_dbm": -52,
    "wifi_channel": 6,
    "connection_quality": "excellent"
  },
  "environment": {
    "temperature_c": 22.5,
    "humidity_percent": 45,
    "light_lux": 350
  },
  "storage": {
    "used_percent": 15,
    "pending_events": 0,
    "pending_bytes": 0
  },
  "slots": [
    {
      "slot": 1,
      "medication": "Metformin 500mg",
      "medication_id": "med_x1y2z3",
      "pills_count": 85,
      "days_remaining": 42,
      "last_dispensed": "2026-02-06T08:00:00Z",
      "status": "ok"
    },
    {
      "slot": 2,
      "medication": "Lisinopril 10mg",
      "medication_id": "med_a1b2c3",
      "pills_count": 28,
      "days_remaining": 28,
      "last_dispensed": "2026-02-06T09:00:00Z",
      "status": "ok"
    },
    {
      "slot": 3,
      "medication": null,
      "medication_id": null,
      "pills_count": 0,
      "days_remaining": 0,
      "last_dispensed": null,
      "status": "empty"
    }
  ],
  "tray": {
    "status": "empty",
    "pills_present": false,
    "weight_g": 0.0
  },
  "next_dose": {
    "schedule_id": "sch_e5f6g7h8",
    "medication": "Lisinopril 10mg",
    "time": "2026-02-06T09:00:00+01:00",
    "minutes_until": 30
  },
  "errors": [],
  "diagnostics": {
    "cpu_usage_percent": 15,
    "memory_free_kb": 128,
    "last_reboot": "2026-02-05T00:00:00Z",
    "reboot_count": 1
  }
}
```

### 4.2 Response (API → Device)

```json
{
  "success": true,
  "server_time": "2026-02-06T08:30:01Z",
  "next_heartbeat_seconds": 60,
  "commands": [
    {
      "id": "cmd_123456",
      "type": "SYNC_SCHEDULE",
      "priority": "normal",
      "params": {}
    }
  ],
  "config_updates": {
    "heartbeat_interval": 60,
    "dispensing_audio_enabled": true,
    "volume_level": 7,
    "display_brightness": 80,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  },
  "alerts": [],
  "schedule_version": "v2026020601",
  "firmware_update_available": false
}
```

---

## 5. Schedule Format

### 5.1 Schedule Response

```json
{
  "schedule_version": "v2026020601",
  "last_updated": "2026-02-06T07:00:00Z",
  "timezone": "Europe/Zurich",
  "device_id": "SMD-00A1B2C3",
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
      "priority": 1,
      "start_date": "2026-01-01",
      "end_date": null,
      "instructions": {
        "text": "Prendre avec de la nourriture",
        "audio_id": "instr_001",
        "display": true
      },
      "window_minutes": 30,
      "reminder_minutes": [0, 10, 20],
      "skip_dates": ["2026-02-14"],
      "special_rules": {
        "allow_early_minutes": 15,
        "allow_late_minutes": 60,
        "require_confirmation": true,
        "escalate_to_caregiver_minutes": 45
      }
    }
  ],
  "next_doses": [
    {
      "schedule_id": "sch_a1b2c3d4",
      "medication": "Metformin 500mg",
      "time": "2026-02-06T08:00:00+01:00",
      "slot": 1,
      "pills": 2
    },
    {
      "schedule_id": "sch_e5f6g7h8",
      "medication": "Lisinopril 10mg",
      "time": "2026-02-06T09:00:00+01:00",
      "slot": 2,
      "pills": 1
    }
  ]
}
```

### 5.2 Schedule Fields

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `id` | string | Yes | Unique schedule ID |
| `medication` | string | Yes | Display name |
| `medication_id` | string | No | Internal ID |
| `slot` | integer | Yes | Slot number (1-10) |
| `pills_per_dose` | integer | Yes | Pills to dispense |
| `times` | array | Yes | Times in HH:MM (24h) |
| `days` | array | Yes | Days of week |
| `active` | boolean | Yes | Is schedule enabled |
| `priority` | integer | No | Display order |
| `start_date` | string | No | When schedule starts |
| `end_date` | string | No | When schedule ends (null=ongoing) |
| `instructions` | object | No | Patient instructions |
| `window_minutes` | integer | No | Time until "missed" |
| `reminder_minutes` | array | No | Reminder timing |
| `skip_dates` | array | No | Dates to skip |
| `special_rules` | object | No | Advanced rules |

---

## 6. Error Codes Reference

### 6.1 Error Code Structure

```
EXXX

Where:
- E = Error prefix
- XXX = 3-digit category + number
```

### 6.2 Complete Error Code List

#### Network Errors (E001-E099)

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E001 | WIFI_DISCONNECTED | WiFi connection lost | Check WiFi router |
| E002 | API_UNREACHABLE | Cannot reach cloud API | Check internet |
| E003 | AUTH_FAILED | Authentication rejected | Re-register device |
| E004 | API_TIMEOUT | API response timeout | Retry later |
| E005 | DNS_FAILED | Cannot resolve hostname | Check DNS settings |
| E006 | TLS_FAILED | TLS handshake failed | Check certificate |
| E007 | RATE_LIMITED | Too many requests | Wait and retry |
| E010 | CELLULAR_NO_SIGNAL | No cellular signal | Move to better location |
| E011 | CELLULAR_NO_DATA | Cellular data unavailable | Check data plan |
| E012 | CELLULAR_ROAMING | Roaming not enabled | Enable roaming |

#### Hardware Errors (E101-E199)

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E101 | PILL_JAM | Pills stuck in mechanism | Clear jam in slot |
| E102 | MOTOR_FAILURE | Motor not responding | Contact support |
| E103 | MOTOR_OVERCURRENT | Motor drawing too much current | Contact support |
| E104 | SENSOR_FAILURE | Sensor malfunction | Contact support |
| E105 | TRAY_NOT_DETECTED | Output tray missing | Replace tray |
| E106 | TRAY_FULL | Tray still has pills | Remove pills first |
| E107 | SLOT_EMPTY | No pills in requested slot | Refill slot |
| E108 | SLOT_SENSOR_BLOCKED | Slot sensor obstructed | Clean sensor |
| E109 | DISPLAY_FAILURE | Display not responding | Restart device |
| E110 | TOUCH_FAILURE | Touch not responding | Restart device |
| E111 | SPEAKER_FAILURE | Audio not working | Contact support |
| E112 | BUTTON_STUCK | Button stuck pressed | Check buttons |
| E120 | CAROUSEL_MISALIGNED | Carousel position error | Contact support |
| E121 | GATE_STUCK_OPEN | Slot gate won't close | Contact support |
| E122 | GATE_STUCK_CLOSED | Slot gate won't open | Contact support |

#### Power Errors (E201-E299)

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E201 | BATTERY_LOW | Battery below 20% | Charge soon |
| E202 | BATTERY_CRITICAL | Battery below 5% | Charge immediately |
| E203 | AC_POWER_LOST | AC adapter disconnected | Reconnect power |
| E204 | BATTERY_NOT_CHARGING | Charger connected but not charging | Check charger |
| E205 | BATTERY_OVERTEMP | Battery too hot | Move to cooler location |
| E206 | BATTERY_UNDERTEMP | Battery too cold | Move to warmer location |
| E207 | CHARGER_FAULT | Charger malfunction | Use different charger |
| E210 | UPS_BATTERY_LOW | Backup battery low | Replace backup battery |

#### Storage Errors (E301-E399)

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E301 | LOCAL_STORAGE_FULL | Local storage full | Sync to clear |
| E302 | TEMP_OUT_OF_RANGE | Temperature outside safe range | Move device |
| E303 | HUMIDITY_OUT_OF_RANGE | Humidity too high/low | Move device |
| E304 | SD_CARD_ERROR | SD card read/write error | Check SD card |
| E305 | SD_CARD_FULL | SD card full | Clear old data |
| E306 | SD_CARD_MISSING | SD card not detected | Insert SD card |

#### Software Errors (E501-E599)

| Code | Name | Description | User Action |
|:-----|:-----|:------------|:------------|
| E501 | FIRMWARE_CORRUPT | Firmware corruption detected | Reinstall firmware |
| E502 | CONFIG_CORRUPT | Configuration corrupted | Reset to defaults |
| E503 | SCHEDULE_SYNC_FAILED | Cannot sync schedule | Retry sync |
| E504 | OTA_FAILED | Firmware update failed | Retry update |
| E505 | WATCHDOG_RESET | Watchdog reset occurred | Monitor for recurrence |
| E506 | OUT_OF_MEMORY | Memory exhausted | Restart device |
| E507 | TASK_CRASH | Task crashed | Restart device |

---

## 7. Data Types Quick Reference

| Field | Type | Format | Example |
|:------|:-----|:-------|:--------|
| `device_id` | string | `SMD-XXXXXXXX` | `"SMD-00A1B2C3"` |
| `timestamp` | string | ISO 8601 UTC | `"2026-02-06T08:00:00Z"` |
| `schedule_id` | string | `sch_XXXXXXXX` | `"sch_a1b2c3d4"` |
| `medication_id` | string | `med_XXXXXX` | `"med_x1y2z3"` |
| `event_id` | string | `evt_XXXXXXXXXXXX` | `"evt_a1b2c3d4e5f6"` |
| `battery` | integer | 0-100 | `95` |
| `wifi_signal` | integer | dBm (-30 to -90) | `-52` |
| `temperature` | number | Celsius | `22.5` |
| `humidity` | integer | 0-100 percent | `45` |
| `pills` | integer | 0-999 | `85` |
| `slot` | integer | 1-10 (home), 1-4 (travel) | `1` |
| `weight` | number | grams | `1.2` |
| `duration` | integer | milliseconds | `2340` |
| `sequence` | integer | monotonic | `12345` |
| `version` | string | semver | `"1.2.0"` |

---

## 8. Validation Rules

### 8.1 Required Field Validation

| Event Type | Required Data Fields |
|:-----------|:--------------------|
| DOSE_DISPENSED | schedule_id, medication, slot, pills_dispensed, pills_remaining, scheduled_time |
| DOSE_TAKEN | schedule_id, medication, pills_taken, seconds_to_take |
| DOSE_MISSED | schedule_id, medication, scheduled_time |
| REFILL_NEEDED | medication, slot, pills_remaining, days_remaining |
| DEVICE_ERROR | error_code, error_type, message |
| BATTERY_LOW | battery_level |

### 8.2 Value Constraints

| Field | Constraint |
|:------|:-----------|
| `slot` | 1-10 (home), 1-4 (travel) |
| `battery_level` | 0-100 |
| `wifi_signal_dbm` | -30 to -100 |
| `temperature_c` | -10 to 50 |
| `humidity_percent` | 0-100 |
| `pills_*` | 0-999 |
| `*_seconds` | ≥ 0 |
| `*_minutes` | ≥ 0 |

---

# PART 2: User/Application API Data Formats

> The following sections define the data formats used by the **User/Application API** consumed by the mobile app and web portal. These correspond to the domain entities and DTOs in the backend.

---

## 9. Domain Entity Reference

### 9.1 Core Domain Model

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│   User     │ 1───* │  Device    │ 1───* │ Container  │
│            │       │            │       │ (Slot)     │
│ id         │       │ id         │       │ id         │
│ email      │       │ userId     │       │ deviceId   │
│ fullName   │       │ name       │       │ slotNumber │
│ role       │       │ type       │       │ medication │
│ caregiverId│       │ status     │       │ quantity   │
└────────────┘       │ firmware   │       │ pillsPerDose│
                     │ battery    │       └──────┬─────┘
                     │ isOnline   │              │
                     └────────────┘              │ 1
                                                 │
                                                 ▼ *
                                          ┌────────────┐
                                          │ Schedule   │
                                          │ id         │
                                          │ containerId│
                                          │ timeOfDay  │
                                          │ daysOfWeek │
                                          │ startDate  │
                                          └──────┬─────┘
                                                 │ 1
                                                 │
                                                 ▼ *
                                          ┌────────────┐
                                          │ Dispense   │
                                          │ Event      │
                                          │ id         │
                                          │ status     │
                                          │ scheduledAt│
                                          │ dispensedAt│
                                          │ confirmedAt│
                                          └────────────┘
```

### 9.2 Entity Relationships

| Parent | Child | Relationship | Description |
|:-------|:------|:-------------|:------------|
| User | Device | 1:many | User owns multiple devices |
| User | Notification | 1:many | User receives notifications |
| User | User (Caregiver) | many:1 | Patient can have a caregiver |
| Device | Container | 1:many | Device has multiple medication slots |
| Device | DispenseEvent | 1:many | Device dispenses doses |
| Device | DeviceApiKey | 1:many | Device has API keys for integrations |
| Container | Schedule | 1:many | Container has multiple schedules |
| Container | Container (Travel copy) | 1:many | Main container has portable copies |
| Schedule | DispenseEvent | 1:many | Schedule generates dispense events |
| User | TravelSession | 1:many | User manages travel sessions |
| User | WebhookEndpoint | 1:many | User configures outgoing webhooks |

---

## 10. User-Facing DTO Schemas

### 10.1 User & Authentication

#### AuthResponse

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

#### MeProfileResponse

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "patient@example.com",
  "fullName": "Jean Dupont",
  "role": "Patient",
  "deviceIds": ["d1e2f3a4-b5c6-7890-abcd-ef1234567890"]
}
```

### 10.2 Device DTO

```json
{
  "id": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "name": "Home Dispenser",
  "type": "Main",
  "status": "Active",
  "timeZoneId": "Europe/Zurich",
  "lastHeartbeatAtUtc": "2026-02-06T08:30:00Z",
  "firmwareVersion": "1.2.0",
  "hardwareVersion": "1.0",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "batteryLevel": 95,
  "wifiSignal": -52,
  "temperature": 22.5,
  "humidity": 45,
  "isOnline": true,
  "lastOnlineAtUtc": "2026-02-06T06:00:00Z",
  "lastErrorCode": null,
  "lastErrorMessage": null,
  "createdAtUtc": "2026-01-15T10:00:00Z",
  "updatedAtUtc": "2026-02-06T08:30:00Z"
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `type` | enum | `"Main"` or `"Portable"` |
| `status` | enum | `"Active"` or `"Paused"` |
| `batteryLevel` | integer? | 0-100 (null for AC-powered home devices) |
| `wifiSignal` | integer? | dBm (-30 to -90) |
| `temperature` | decimal? | Celsius, from device environment sensor |

### 10.3 Container DTO

```json
{
  "id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "deviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "slotNumber": 1,
  "medicationName": "Metformin 500mg",
  "medicationImageUrl": null,
  "quantity": 85,
  "pillsPerDose": 2,
  "lowStockThreshold": 14,
  "sourceContainerId": null,
  "createdAtUtc": "2026-01-15T10:05:00Z",
  "updatedAtUtc": "2026-02-06T08:00:05Z"
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `slotNumber` | integer | Physical slot: 1-10 (home), 1-4 (travel) |
| `quantity` | integer | Current pill count |
| `pillsPerDose` | integer | Pills dispensed per dose |
| `lowStockThreshold` | integer | Alert threshold |
| `sourceContainerId` | guid? | Links travel copy to home container |

### 10.4 Schedule DTO

```json
{
  "id": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "timeOfDay": "08:00:00",
  "daysOfWeekBitmask": 127,
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": null,
  "notes": "Take with food",
  "timeZoneId": "Europe/Zurich",
  "createdAtUtc": "2026-01-15T10:10:00Z",
  "updatedAtUtc": null
}
```

#### Days of Week Bitmask

| Day | Bit Value | Binary |
|:----|----------:|:-------|
| Monday | 1 | 0000001 |
| Tuesday | 2 | 0000010 |
| Wednesday | 4 | 0000100 |
| Thursday | 8 | 0001000 |
| Friday | 16 | 0010000 |
| Saturday | 32 | 0100000 |
| Sunday | 64 | 1000000 |
| **Every day** | **127** | **1111111** |
| **Weekdays** | **31** | **0011111** |
| **Weekends** | **96** | **1100000** |

### 10.5 Dispense Event DTO

```json
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
```

| Status | Value | Description |
|:-------|------:|:------------|
| Pending | 0 | Dose scheduled, not yet dispensed |
| Dispensed | 1 | Pills released from device |
| Confirmed | 2 | Patient confirmed intake |
| Missed | 3 | Window expired, no confirmation |
| Delayed | 4 | Patient snoozed/delayed |

### 10.6 Notification DTO

```json
{
  "id": "n1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "type": "MissedDose",
  "title": "Missed Dose",
  "body": "You missed your Metformin 500mg dose at 08:00",
  "isRead": false,
  "createdAtUtc": "2026-02-06T08:30:00Z",
  "relatedEntityId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
}
```

| Type (enum) | Value | Description |
|:------------|------:|:------------|
| MissedDose | 0 | Dose was missed |
| LowStock | 1 | Medication supply running low |
| TravelStarted | 2 | Travel mode activated |
| TravelEnded | 3 | Travel mode deactivated |
| General | 4 | General information |
| DoseDispensed | 5 | Pills dispensed |
| DoseTaken | 6 | Intake confirmed |
| RefillCritical | 7 | Critical stock level |
| DeviceOnline | 8 | Device connected |
| DeviceOffline | 9 | Device disconnected |
| DeviceError | 10 | Device error reported |
| DeviceStatus | 11 | Device status change |
| BatteryLow | 12 | Battery below 20% |
| BatteryCritical | 13 | Battery below 5% |

### 10.7 Travel Session DTO

```json
{
  "id": "t1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "mainDeviceId": "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  "portableDeviceId": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "startedAtUtc": "2026-02-06T09:00:00Z",
  "endedAtUtc": null,
  "plannedEndDateUtc": "2026-02-20T18:00:00Z",
  "createdAtUtc": "2026-02-06T09:00:00Z"
}
```

### 10.8 Webhook Endpoint DTO

```json
{
  "id": "w1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "url": "https://your-system.com/webhook",
  "isActive": true,
  "description": "EHR integration",
  "lastTriggeredAtUtc": "2026-02-06T08:00:00Z",
  "lastStatus": "200 OK",
  "createdAtUtc": "2026-01-20T12:00:00Z"
}
```

### 10.9 Device API Key DTO

```json
{
  "id": "k1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "name": "Production Key",
  "createdAtUtc": "2026-02-06T10:00:00Z",
  "lastUsedAtUtc": "2026-02-06T12:00:00Z"
}
```

> **Note:** The actual API key value is only returned once during creation. The backend stores a SHA-256 hash.

### 10.10 Today Schedule Item DTO

```json
{
  "scheduleId": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "containerId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "medicationName": "Metformin 500mg",
  "pillsPerDose": 2,
  "scheduledTimeUtc": "2026-02-06T07:00:00Z",
  "scheduledTimeLocal": "2026-02-06T08:00:00+01:00",
  "status": "Pending",
  "dispenseEventId": null
}
```

---

## 11. Enum Reference

### 11.1 User Roles

| Role | Value | Description |
|:-----|------:|:------------|
| Patient | 0 | End user / patient |
| Caregiver | 1 | Caregiver with patient access |
| Admin | 2 | B2B administrator |

### 11.2 Device Types

| Type | Value | Description |
|:-----|------:|:------------|
| Main | 0 | SMD-100 Home device |
| Portable | 1 | SMD-200 Travel device |

### 11.3 Device Status

| Status | Value | Description |
|:-------|------:|:------------|
| Active | 0 | Dispensing enabled |
| Paused | 1 | Dispensing paused |

### 11.4 Dispense Event Status

| Status | Value | Description |
|:-------|------:|:------------|
| Pending | 0 | Awaiting dispensing |
| Dispensed | 1 | Pills released |
| Confirmed | 2 | Patient took pills |
| Missed | 3 | Timeout expired |
| Delayed | 4 | Patient snoozed |

### 11.5 Device Event Types (from firmware)

| Type | Value | Description |
|:-----|------:|:------------|
| DoseDispensed | 0 | Pills dropped to tray |
| DoseTaken | 1 | Pills removed (weight sensor) |
| DoseMissed | 2 | 30-minute window expired |
| RefillNeeded | 3 | Less than 7 days of pills |
| RefillCritical | 4 | Less than 3 days of pills |
| DeviceOnline | 5 | Device connected |
| DeviceOffline | 6 | Device lost connection |
| DeviceError | 7 | Hardware/software error |
| BatteryLow | 8 | Battery below 20% |
| BatteryCritical | 9 | Battery below 5% |
| TravelModeOn | 10 | Travel mode activated |
| TravelModeOff | 11 | Travel mode deactivated |
| Heartbeat | 12 | Regular heartbeat |

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Complete expansion with all event types, detailed schemas |
| 3.0 | Feb 2026 | Added user-facing DTOs, domain model reference, enum documentation |