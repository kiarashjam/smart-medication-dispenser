# Error Codes Reference

**Smart Medication Dispenser — Comprehensive Error Code Documentation**

**Version 1.0** | **February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 1.0 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | Backend Engineers, Firmware Developers, Support Team, DevOps |
| **Related Documents** | [02_BACKEND_API.md](./02_BACKEND_API.md), [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md), [10_NOTIFICATION_SYSTEM.md](./10_NOTIFICATION_SYSTEM.md) |

---

## 1. Error Code Overview

The Smart Medication Dispenser uses a structured error code system to track, diagnose, and respond to issues across the device fleet. Error codes flow from the ESP32-S3 device through the backend API to the notification system, enabling automated recovery, user alerts, and fleet-wide monitoring.

### 1.1 Error Code Format

Error codes follow the pattern: **EXXX** where:
- **E** = Error prefix
- **XXX** = Three-digit numeric code (001-999)
- Codes are grouped by category ranges

### 1.2 Error Code Categories

| Category | Range | Description |
|:---------|:------|:------------|
| **Network** | E001-E099 | WiFi, API connectivity, authentication, DNS, TLS issues |
| **Hardware** | E101-E199 | Motors, sensors, carousel, gates, display, audio, buttons |
| **Power** | E201-E299 | Battery, charging, UPS, temperature monitoring |
| **Storage** | E301-E399 | NVS, SD card, environmental sensors (temp/humidity) |
| **Software** | E501-E599 | Firmware, configuration, OTA, memory, task crashes |

**Note:** E400-E499 range is reserved for future use.

### 1.3 Severity Levels

| Severity | Description | Notification Priority | Auto-Recovery | User Action Required |
|:---------|:------------|:---------------------|:-------------|:---------------------|
| **info** | Informational event, no immediate action needed | Low | N/A | No |
| **warning** | Potential issue, monitor closely | Medium | Attempted | Optional |
| **error** | Issue requiring attention | High | Attempted | Yes |
| **critical** | Immediate action required, device may be non-functional | Critical | Attempted | Yes (immediate) |

### 1.4 Error Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ERROR FLOW FROM DEVICE TO NOTIFICATION                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    ESP32-S3 DEVICE (Firmware)                        │    │
│  │                                                                      │    │
│  │   Error Detected → Error Code Generated → Diagnostic Data Collected │    │
│  │                                                                      │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │  Auto-Recovery Attempted (if applicable)                    │   │    │
│  │   │  • Retry operation                                           │   │    │
│  │   │  • Reset component                                           │   │    │
│  │   │  • Fallback mode                                             │   │    │
│  │   └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │   Error Event Packaged → DEVICE_ERROR Event Created                │    │
│  │                                                                      │    │
│  └──────────────────────┬──────────────────────────────────────────────┘    │
│                         │                                                    │
│                         │ POST /api/v1/heartbeat                            │
│                         │ (includes error in events array)                  │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    BACKEND API (ASP.NET Core 8)                      │    │
│  │                                                                      │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │  Heartbeat Handler                                          │   │    │
│  │   │  • Validates error event                                    │   │    │
│  │   │  • Stores in DeviceError table                              │   │    │
│  │   │  • Updates device status                                    │   │    │
│  │   └──────────────────────┬──────────────────────────────────────┘   │    │
│  │                          │                                          │    │
│  │                          ▼                                          │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │  Error Processing Service                                    │   │    │
│  │   │  • Determines severity                                      │   │    │
│  │   │  • Checks error frequency                                   │   │    │
│  │   │  • Applies notification rules                                │   │    │
│  │   │  • Triggers escalation if needed                            │   │    │
│  │   └──────────────────────┬──────────────────────────────────────┘   │    │
│  │                          │                                          │    │
│  └──────────────────────────┼──────────────────────────────────────────┘    │
│                             │                                                │
│                             ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    NOTIFICATION SYSTEM                              │    │
│  │                                                                      │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │  Notification Service                                         │   │    │
│  │   │  • Creates DeviceError notification                          │   │    │
│  │   │  • Selects channels (push, email, in-app)                   │   │    │
│  │   │  • Delivers to user & caregivers                            │   │    │
│  │   └──────────────────────┬──────────────────────────────────────┘   │    │
│  │                          │                                          │    │
│  │         ┌────────────────┼────────────────┐                         │    │
│  │         │                │                │                         │    │
│  │         ▼                ▼                ▼                         │    │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐                        │    │
│  │   │   Push   │  │  Email   │  │  In-App  │                        │    │
│  │   │ (FCM/    │  │ (SendGrid│  │ (SignalR │                        │    │
│  │   │  APNs)   │  │ / Azure) │  │ / Poll)  │                        │    │
│  │   └──────────┘  └──────────┘  └──────────┘                        │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    MONITORING & ALERTING                             │    │
│  │                                                                      │    │
│  │   • Error frequency analysis                                        │    │
│  │   • Fleet-wide error trends                                         │    │
│  │   • PagerDuty alerts (critical errors)                              │    │
│  │   • Grafana dashboards                                              │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Network Errors (E001-E099)

Network errors cover connectivity issues between the device and backend API, including WiFi, cellular (for travel devices), DNS, TLS, and API communication problems.

### 2.1 Network Error Codes Table

| Code | Name | Severity | Description | Recoverable | Auto-Recovery | User Action | Backend Handling |
|:-----|:-----|:---------|:------------|:------------|:--------------|:-------------|:-----------------|
| **E001** | WIFI_DISCONNECTED | warning | WiFi connection lost. Device attempts auto-reconnect every 30 seconds. | Yes | Yes (every 30s) | Check WiFi router, ensure SSID/password correct | Log error, set device status to "offline", trigger notification after 5 min |
| **E002** | API_UNREACHABLE | warning | Cannot reach API server. Device enters offline mode, continues operating locally. | Yes | Yes (retry every 60s) | Check internet connection, verify API server status | Log error, set device status to "offline", trigger notification after 5 min |
| **E003** | AUTH_FAILED | error | Device authentication token rejected by API. Device may need re-registration. | Yes | No | Re-register device via web portal or contact support | Log error, set device status to "unauthenticated", trigger immediate notification |
| **E004** | API_TIMEOUT | warning | API did not respond within 30 seconds. Request timed out. | Yes | Yes (retry with backoff) | Check network latency, verify API server performance | Log error, increment timeout counter, trigger notification if >3 occurrences/hour |
| **E005** | DNS_FAILED | error | Cannot resolve API hostname. DNS lookup failed. | Yes | Yes (retry every 60s) | Check DNS settings, verify hostname is correct | Log error, set device status to "offline", trigger notification |
| **E006** | TLS_FAILED | critical | TLS handshake failed. Possible MITM attack or certificate issue. | Yes | No | Verify network security, check for proxy/firewall issues | Log error, set device status to "error", trigger immediate critical notification, escalate to security team |
| **E007** | RATE_LIMITED | info | API returned HTTP 429 (Too Many Requests). Device will back off. | Yes | Yes (exponential backoff) | None (automatic) | Log error, no notification (informational only) |
| **E010** | CELLULAR_NO_SIGNAL | warning | No cellular signal detected (travel device). Device cannot connect to API. | Yes | Yes (scan every 60s) | Move device to area with cellular coverage | Log error, set device status to "offline", trigger notification |
| **E011** | CELLULAR_NO_DATA | warning | Cellular signal present but no data connection available. | Yes | Yes (retry every 60s) | Check cellular data plan, verify APN settings | Log error, set device status to "offline", trigger notification |
| **E012** | CELLULAR_ROAMING | info | Device is roaming on cellular network. May incur additional charges. | N/A | N/A | None (informational) | Log event, no notification (informational only) |

### 2.2 Network Error Diagnostic Data

Network errors include the following diagnostic fields:

```json
{
  "error_code": "E001",
  "diagnostic_data": {
    "wifi_ssid": "HomeNetwork",
    "wifi_rssi": -85,
    "wifi_channel": 6,
    "ip_address": "192.168.1.100",
    "gateway": "192.168.1.1",
    "dns_primary": "8.8.8.8",
    "dns_secondary": "8.8.4.4",
    "api_endpoint": "https://api.smartdispenser.com",
    "last_successful_connection": "2026-02-10T14:30:00Z",
    "connection_attempts": 3,
    "failure_reason": "Connection timeout"
  }
}
```

### 2.3 Network Error Recovery Strategies

| Error Code | Auto-Recovery Strategy | Max Retries | Backoff Strategy |
|:-----------|:----------------------|:------------|:-----------------|
| E001 | WiFi reconnect | Unlimited | Exponential: 30s, 60s, 120s, 300s (max) |
| E002 | API retry | Unlimited | Exponential: 60s, 120s, 300s, 600s (max) |
| E003 | None (requires user action) | 0 | N/A |
| E004 | API retry with timeout increase | 3 | Linear: +10s per retry |
| E005 | DNS retry | Unlimited | Exponential: 60s, 120s, 300s (max) |
| E006 | None (security issue) | 0 | N/A |
| E007 | Exponential backoff | Unlimited | Exponential: 60s, 120s, 300s, 600s (max) |
| E010 | Cellular scan | Unlimited | Every 60s |
| E011 | Data connection retry | Unlimited | Exponential: 60s, 120s, 300s (max) |
| E012 | N/A | N/A | N/A |

---

## 3. Hardware Errors (E101-E199)

Hardware errors cover mechanical and electronic component failures, including motors, sensors, carousel, gates, display, audio, and user interface components.

### 3.1 Hardware Error Codes Table

| Code | Name | Severity | Description | Recoverable | Auto-Recovery | User Action | Backend Handling |
|:-----|:-----|:---------|:------------|:------------|:--------------|:-------------|:-----------------|
| **E101** | PILL_JAM | warning | Pill stuck during dispensing. Motor detected obstruction. | Yes | Yes (reverse motor, retry) | Remove stuck pill, check slot for debris | Log error, pause dispensing schedule, trigger notification |
| **E102** | MOTOR_FAILURE | error | Stepper motor not responding to commands. Motor driver fault. | Yes | Yes (reset driver, retry) | Power cycle device, contact support if persists | Log error, set device status to "error", trigger notification |
| **E103** | MOTOR_OVERCURRENT | critical | Motor drawing excessive current (>2A). Possible short circuit or mechanical binding. | Yes | No (safety shutdown) | Power cycle device, check for mechanical obstruction, contact support | Log error, set device status to "error", trigger critical notification, escalate |
| **E104** | SENSOR_FAILURE | error | Sensor not responding to queries. I2C/SPI communication failure. | Yes | Yes (reset sensor, retry) | Power cycle device, contact support if persists | Log error, trigger notification |
| **E105** | TRAY_NOT_DETECTED | warning | Output tray not detected in position. Tray sensor not triggered. | Yes | Yes (retry detection) | Ensure tray is properly inserted | Log error, pause dispensing, trigger notification |
| **E106** | TRAY_FULL | warning | Output tray contains uncollected pills. Tray sensor indicates full. | Yes | No (requires user action) | Remove pills from tray | Log error, pause dispensing, trigger notification |
| **E107** | SLOT_EMPTY | warning | Medication slot has no pills remaining. Slot sensor indicates empty. | Yes | No (requires refill) | Refill medication slot | Log error, trigger LowStock notification |
| **E108** | SLOT_SENSOR_BLOCKED | error | Optical sensor permanently blocked. Possible debris or sensor failure. | Yes | Yes (clean sensor, retry) | Clean sensor area, remove debris | Log error, trigger notification |
| **E109** | DISPLAY_FAILURE | error | Display not responding to commands. SPI communication failure. | Yes | Yes (reset display, retry) | Power cycle device, contact support if persists | Log error, trigger notification |
| **E110** | TOUCH_FAILURE | error | Touch controller not responding. I2C communication failure. | Yes | Yes (reset touch controller, retry) | Power cycle device, contact support if persists | Log error, trigger notification |
| **E111** | SPEAKER_FAILURE | error | Audio amplifier not responding. I2S communication failure. | Yes | Yes (reset audio system, retry) | Power cycle device, contact support if persists | Log error, trigger notification (non-critical) |
| **E112** | BUTTON_STUCK | warning | Physical button stuck in pressed state. Button sensor indicates constant press. | Yes | Yes (debounce, retry) | Check button for physical obstruction | Log error, trigger notification |
| **E120** | CAROUSEL_MISALIGNED | error | Carousel not in expected position. Hall sensor indicates misalignment. | Yes | Yes (recalibrate, retry) | Power cycle device, allow auto-calibration | Log error, trigger notification |
| **E121** | GATE_STUCK_OPEN | error | Servo gate stuck in open position. Cannot close for next dispensing cycle. | Yes | Yes (reset servo, retry) | Check gate mechanism, remove obstruction | Log error, pause dispensing, trigger notification |
| **E122** | GATE_STUCK_CLOSED | error | Servo gate stuck in closed position. Cannot open for dispensing. | Yes | Yes (reset servo, retry) | Check gate mechanism, remove obstruction | Log error, pause dispensing, trigger notification |

### 3.2 Hardware Error Diagnostic Data

Hardware errors include detailed diagnostic information:

```json
{
  "error_code": "E101",
  "diagnostic_data": {
    "slot": 3,
    "motor_position": 1250,
    "motor_current": 0.85,
    "motor_voltage": 12.0,
    "sensor_value": 0,
    "expected_sensor_value": 1,
    "retry_count": 2,
    "last_successful_dispense": "2026-02-10T08:00:00Z",
    "carousel_position": 3,
    "gate_state": "open",
    "temperature": 22.5,
    "vibration_detected": true
  }
}
```

### 3.3 Hardware Error Auto-Recovery Steps

| Error Code | Auto-Recovery Steps | Max Retries |
|:-----------|:-------------------|:------------|
| E101 | 1. Reverse motor 180°<br>2. Wait 2s<br>3. Forward motor 360°<br>4. Check sensor | 3 |
| E102 | 1. Reset motor driver IC<br>2. Reinitialize motor<br>3. Test movement | 2 |
| E103 | None (safety shutdown) | 0 |
| E104 | 1. Reset I2C/SPI bus<br>2. Reinitialize sensor<br>3. Test communication | 3 |
| E105 | 1. Retry tray detection<br>2. Check sensor | 5 |
| E106 | None (requires user action) | 0 |
| E107 | None (requires refill) | 0 |
| E108 | 1. Blow air through sensor<br>2. Retry detection | 3 |
| E109 | 1. Reset SPI bus<br>2. Reinitialize display<br>3. Test communication | 2 |
| E110 | 1. Reset I2C bus<br>2. Reinitialize touch controller<br>3. Test communication | 2 |
| E111 | 1. Reset I2S bus<br>2. Reinitialize audio<br>3. Test output | 2 |
| E112 | 1. Debounce button input<br>2. Wait 5s<br>3. Retry | 3 |
| E120 | 1. Move carousel to home position<br>2. Recalibrate hall sensor<br>3. Verify position | 2 |
| E121 | 1. Reset servo driver<br>2. Command close position<br>3. Verify gate state | 3 |
| E122 | 1. Reset servo driver<br>2. Command open position<br>3. Verify gate state | 3 |

### 3.4 Hardware Error User Instructions (Multilingual)

#### E101: PILL_JAM

| Language | User Instructions |
|:---------|:------------------|
| **EN** | A pill is stuck in the dispenser. Please remove the stuck pill and check the slot for any debris. The device will retry dispensing automatically. |
| **FR** | Une pilule est coincée dans le distributeur. Veuillez retirer la pilule coincée et vérifier l'emplacement pour tout débris. L'appareil réessayera la distribution automatiquement. |
| **DE** | Eine Tablette ist im Spender stecken geblieben. Bitte entfernen Sie die steckengebliebene Tablette und prüfen Sie den Schlitz auf Ablagerungen. Das Gerät versucht die Abgabe automatisch erneut. |
| **IT** | Una pillola è bloccata nel distributore. Rimuovere la pillola bloccata e controllare lo slot per eventuali detriti. Il dispositivo riproverà la distribuzione automaticamente. |

#### E102: MOTOR_FAILURE

| Language | User Instructions |
|:---------|:------------------|
| **EN** | The motor is not responding. Please power cycle the device (unplug for 10 seconds, then plug back in). If the issue persists, contact support. |
| **FR** | Le moteur ne répond pas. Veuillez redémarrer l'appareil (débrancher pendant 10 secondes, puis rebrancher). Si le problème persiste, contactez le support. |
| **DE** | Der Motor reagiert nicht. Bitte schalten Sie das Gerät aus und wieder ein (10 Sekunden vom Netz trennen, dann wieder anschließen). Wenn das Problem weiterhin besteht, kontaktieren Sie den Support. |
| **IT** | Il motore non risponde. Eseguire un ciclo di alimentazione del dispositivo (scollegare per 10 secondi, poi ricollegare). Se il problema persiste, contattare il supporto. |

#### E103: MOTOR_OVERCURRENT

| Language | User Instructions |
|:---------|:------------------|
| **EN** | **CRITICAL:** Motor safety shutdown activated. Unplug the device immediately and check for mechanical obstructions. Do not attempt to use the device. Contact support immediately. |
| **FR** | **CRITIQUE :** Arrêt de sécurité du moteur activé. Débranchez immédiatement l'appareil et vérifiez les obstructions mécaniques. N'essayez pas d'utiliser l'appareil. Contactez immédiatement le support. |
| **DE** | **KRITISCH:** Sicherheitsabschaltung des Motors aktiviert. Trennen Sie das Gerät sofort vom Netz und prüfen Sie auf mechanische Hindernisse. Versuchen Sie nicht, das Gerät zu verwenden. Kontaktieren Sie sofort den Support. |
| **IT** | **CRITICO:** Spegnimento di sicurezza del motore attivato. Scollegare immediatamente il dispositivo e controllare le ostruzioni meccaniche. Non tentare di utilizzare il dispositivo. Contattare immediatamente il supporto. |

#### E105: TRAY_NOT_DETECTED

| Language | User Instructions |
|:---------|:------------------|
| **EN** | The output tray is not detected. Please ensure the tray is properly inserted into the device. |
| **FR** | Le plateau de sortie n'est pas détecté. Veuillez vous assurer que le plateau est correctement inséré dans l'appareil. |
| **DE** | Das Ausgabefach wird nicht erkannt. Bitte stellen Sie sicher, dass das Fach ordnungsgemäß in das Gerät eingesetzt ist. |
| **IT** | Il vassoio di uscita non è rilevato. Assicurarsi che il vassoio sia inserito correttamente nel dispositivo. |

#### E106: TRAY_FULL

| Language | User Instructions |
|:---------|:------------------|
| **EN** | The output tray is full. Please remove the pills from the tray to continue dispensing. |
| **FR** | Le plateau de sortie est plein. Veuillez retirer les pilules du plateau pour continuer la distribution. |
| **DE** | Das Ausgabefach ist voll. Bitte entfernen Sie die Tabletten aus dem Fach, um die Abgabe fortzusetzen. |
| **IT** | Il vassoio di uscita è pieno. Rimuovere le pillole dal vassoio per continuare la distribuzione. |

#### E107: SLOT_EMPTY

| Language | User Instructions |
|:---------|:------------------|
| **EN** | Medication slot is empty. Please refill the medication slot to continue dispensing. |
| **FR** | L'emplacement de médicament est vide. Veuillez remplir l'emplacement de médicament pour continuer la distribution. |
| **DE** | Der Medikamentenschlitz ist leer. Bitte füllen Sie den Medikamentenschlitz nach, um die Abgabe fortzusetzen. |
| **IT** | Lo slot del farmaco è vuoto. Ricaricare lo slot del farmaco per continuare la distribuzione. |

---

## 4. Power Errors (E201-E299)

Power errors cover battery status, charging issues, UPS (Uninterruptible Power Supply) status, and temperature-related power problems.

### 4.1 Power Error Codes Table

| Code | Name | Severity | Description | Recoverable | Auto-Recovery | User Action | Backend Handling |
|:-----|:-----|:---------|:------------|:------------|:--------------|:-------------|:-----------------|
| **E201** | BATTERY_LOW | warning | Battery level below 20%. Device continues operating but may shut down soon. | Yes | N/A | Connect device to AC power | Log error, trigger notification, set device status to "battery_low" |
| **E202** | BATTERY_CRITICAL | critical | Battery level below 5%. Device will shut down within minutes. | Yes | N/A | Connect device to AC power immediately | Log error, trigger critical notification, set device status to "battery_critical" |
| **E203** | AC_POWER_LOST | warning | Mains power disconnected. Device running on battery/UPS. | Yes | N/A | Restore AC power connection | Log error, trigger notification, set device status to "on_battery" |
| **E204** | BATTERY_NOT_CHARGING | error | Battery not charging despite AC power connected. Charger fault detected. | Yes | Yes (reset charger IC) | Check AC adapter, verify connection, contact support if persists | Log error, trigger notification, set device status to "charging_fault" |
| **E205** | BATTERY_OVERTEMP | critical | Battery temperature exceeds 45°C. Safety shutdown to prevent damage. | Yes | No (safety shutdown) | Allow battery to cool, check ventilation, contact support | Log error, trigger critical notification, set device status to "error", escalate |
| **E206** | BATTERY_UNDERTEMP | warning | Battery temperature below 0°C. Charging disabled to prevent damage. | Yes | Yes (resume when temp > 5°C) | Move device to warmer location | Log error, trigger notification |
| **E207** | CHARGER_FAULT | error | BQ24195 charger IC fault detected. Charging circuit malfunction. | Yes | Yes (reset charger IC) | Check AC adapter, contact support if persists | Log error, trigger notification, set device status to "charging_fault" |
| **E210** | UPS_BATTERY_LOW | warning | Backup UPS battery low (< 30%). Mains power required soon. | Yes | N/A | Restore AC power connection | Log error, trigger notification |

### 4.2 Power Error Diagnostic Data

```json
{
  "error_code": "E201",
  "diagnostic_data": {
    "battery_level": 18,
    "battery_voltage": 3.4,
    "battery_current": -0.5,
    "battery_temperature": 25.0,
    "ac_power_connected": false,
    "charging_status": "not_charging",
    "ups_battery_level": 85,
    "power_consumption": 2.5,
    "estimated_runtime_minutes": 45
  }
}
```

### 4.3 Power Error Auto-Recovery

| Error Code | Auto-Recovery Strategy | Notes |
|:-----------|:----------------------|:------|
| E201 | None (monitoring only) | Device continues operating |
| E202 | None (monitoring only) | Device will shut down soon |
| E203 | None (monitoring only) | Device switches to battery |
| E204 | Reset BQ24195 charger IC, retry charging | Max 3 retries |
| E205 | None (safety shutdown) | Device disabled until temp < 40°C |
| E206 | Resume charging when temp > 5°C | Automatic |
| E207 | Reset BQ24195 charger IC, retry charging | Max 3 retries |
| E210 | None (monitoring only) | UPS continues providing power |

---

## 5. Storage Errors (E301-E399)

Storage errors cover NVS (Non-Volatile Storage), SD card issues, and environmental sensor readings outside acceptable ranges.

### 5.1 Storage Error Codes Table

| Code | Name | Severity | Description | Recoverable | Auto-Recovery | User Action | Backend Handling |
|:-----|:-----|:---------|:------------|:------------|:--------------|:-------------|:-----------------|
| **E301** | LOCAL_STORAGE_FULL | warning | NVS partition >90% full. May affect logging and configuration storage. | Yes | Yes (cleanup old logs) | None (automatic cleanup) | Log error, trigger notification, cleanup old device logs |
| **E302** | TEMP_OUT_OF_RANGE | warning | Ambient temperature outside acceptable range (10-35°C). May affect medication stability. | Yes | Yes (monitor, resume when in range) | Move device to temperature-controlled environment | Log error, trigger notification |
| **E303** | HUMIDITY_OUT_OF_RANGE | warning | Humidity outside acceptable range (20-80%). May affect medication stability. | Yes | Yes (monitor, resume when in range) | Move device to humidity-controlled environment | Log error, trigger notification |
| **E304** | SD_CARD_ERROR | error | SD card read/write failure. Data logging may be affected. | Yes | Yes (remount, retry) | Remove and reinsert SD card, format if necessary | Log error, trigger notification |
| **E305** | SD_CARD_FULL | warning | SD card >90% full. Data logging may stop. | Yes | Yes (cleanup old logs) | Replace with larger SD card or backup and format | Log error, trigger notification |
| **E306** | SD_CARD_MISSING | info | SD card not inserted. Data logging disabled. | Yes | Yes (resume when inserted) | Insert SD card for data logging | Log event (informational only) |

### 5.2 Storage Error Diagnostic Data

```json
{
  "error_code": "E301",
  "diagnostic_data": {
    "nvs_used_bytes": 92160,
    "nvs_total_bytes": 98304,
    "nvs_usage_percent": 93.75,
    "sd_card_present": true,
    "sd_card_used_mb": 14500,
    "sd_card_total_mb": 16000,
    "sd_card_usage_percent": 90.6,
    "ambient_temperature": 38.5,
    "humidity": 75.0,
    "last_cleanup": "2026-02-09T00:00:00Z"
  }
}
```

---

## 6. Software Errors (E501-E599)

Software errors cover firmware corruption, configuration issues, OTA (Over-The-Air) update failures, memory exhaustion, and task crashes.

### 6.1 Software Error Codes Table

| Code | Name | Severity | Description | Recoverable | Auto-Recovery | User Action | Backend Handling |
|:-----|:-----|:---------|:------------|:------------|:--------------|:-------------|:-----------------|
| **E501** | FIRMWARE_CORRUPT | critical | Firmware verification failed. SHA-256 checksum mismatch. Device may be non-functional. | Yes | Yes (rollback to previous version) | None (automatic rollback) | Log error, trigger critical notification, escalate to firmware team |
| **E502** | CONFIG_CORRUPT | error | Configuration data corrupted. Device using default settings. | Yes | Yes (restore from backup, sync from cloud) | None (automatic restore) | Log error, trigger notification, restore config from cloud |
| **E503** | SCHEDULE_SYNC_FAILED | warning | Cannot sync medication schedule from cloud. Device using cached schedule. | Yes | Yes (retry sync every 60s) | Check network connection | Log error, trigger notification |
| **E504** | OTA_FAILED | error | Firmware OTA update failed. Device remains on current version. | Yes | Yes (retry OTA, rollback if needed) | None (automatic retry) | Log error, trigger notification, schedule retry |
| **E505** | WATCHDOG_RESET | error | Watchdog timer triggered. System reset due to task hang or infinite loop. | Yes | Yes (automatic reset) | None (automatic recovery) | Log error, trigger notification, analyze crash dump |
| **E506** | OUT_OF_MEMORY | critical | Heap memory exhausted. System may be unstable. | Yes | Yes (garbage collection, task cleanup) | Restart device if persists | Log error, trigger critical notification, escalate |
| **E507** | TASK_CRASH | critical | FreeRTOS task crashed. System stability compromised. | Yes | Yes (restart task, system reset if needed) | Restart device if persists | Log error, trigger critical notification, escalate, analyze crash dump |

### 6.2 Software Error Diagnostic Data

```json
{
  "error_code": "E505",
  "diagnostic_data": {
    "watchdog_timeout_seconds": 30,
    "last_heartbeat": "2026-02-10T14:25:00Z",
    "reset_reason": "watchdog",
    "free_heap_bytes": 45000,
    "largest_free_block": 12000,
    "task_stack_high_water": {
      "dispensing_task": 85,
      "network_task": 92,
      "sensor_task": 78
    },
    "uptime_seconds": 86400,
    "firmware_version": "1.2.3",
    "crash_dump_available": true
  }
}
```

---

## 7. Error Event Schema (JSON)

All errors are transmitted from the device to the backend API as part of the heartbeat payload. The error event follows a standardized JSON schema.

### 7.1 Complete Error Event Payload

```json
{
  "event": "DEVICE_ERROR",
  "device_id": "SMD-00A1B2C3",
  "timestamp": "2026-02-10T14:30:15.123Z",
  "data": {
    "error_code": "E101",
    "error_type": "hardware",
    "category": "dispensing",
    "severity": "warning",
    "slot": 3,
    "message": "Pill jam detected in slot 3",
    "description": "Motor detected obstruction during dispensing cycle. Auto-recovery attempted but failed after 3 retries.",
    "recoverable": true,
    "auto_recovery_attempted": true,
    "auto_recovery_success": false,
    "user_action_required": true,
    "user_instructions": {
      "en": "A pill is stuck in the dispenser. Please remove the stuck pill and check the slot for any debris. The device will retry dispensing automatically.",
      "fr": "Une pilule est coincée dans le distributeur. Veuillez retirer la pilule coincée et vérifier l'emplacement pour tout débris. L'appareil réessayera la distribution automatiquement.",
      "de": "Eine Tablette ist im Spender stecken geblieben. Bitte entfernen Sie die steckengebliebene Tablette und prüfen Sie den Schlitz auf Ablagerungen. Das Gerät versucht die Abgabe automatisch erneut.",
      "it": "Una pillola è bloccata nel distributore. Rimuovere la pillola bloccata e controllare lo slot per eventuali detriti. Il dispositivo riproverà la distribuzione automaticamente."
    },
    "diagnostic_data": {
      "slot": 3,
      "motor_position": 1250,
      "motor_current": 0.85,
      "motor_voltage": 12.0,
      "sensor_value": 0,
      "expected_sensor_value": 1,
      "retry_count": 3,
      "last_successful_dispense": "2026-02-10T08:00:00Z",
      "carousel_position": 3,
      "gate_state": "open",
      "temperature": 22.5,
      "vibration_detected": true
    },
    "previous_occurrence": "2026-02-10T12:15:00Z",
    "total_occurrences": 2,
    "first_occurrence": "2026-02-10T12:15:00Z",
    "frequency_minutes": 135
  }
}
```

### 7.2 Error Event Field Descriptions

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `event` | string | Yes | Always "DEVICE_ERROR" |
| `device_id` | string | Yes | Unique device identifier (format: SMD-XXXXXXXX) |
| `timestamp` | ISO 8601 | Yes | Error detection timestamp (UTC) |
| `data.error_code` | string | Yes | Error code (EXXX format) |
| `data.error_type` | string | Yes | Category: "network", "hardware", "power", "storage", "software" |
| `data.category` | string | Yes | Sub-category (e.g., "dispensing", "connectivity", "charging") |
| `data.severity` | string | Yes | "info", "warning", "error", "critical" |
| `data.slot` | integer | No | Affected medication slot (if applicable) |
| `data.message` | string | Yes | Short error message |
| `data.description` | string | Yes | Detailed error description |
| `data.recoverable` | boolean | Yes | Whether error can be automatically recovered |
| `data.auto_recovery_attempted` | boolean | Yes | Whether auto-recovery was attempted |
| `data.auto_recovery_success` | boolean | Yes | Whether auto-recovery succeeded |
| `data.user_action_required` | boolean | Yes | Whether user intervention is needed |
| `data.user_instructions` | object | Yes | Multilingual user instructions (en, fr, de, it) |
| `data.diagnostic_data` | object | Yes | Error-specific diagnostic information |
| `data.previous_occurrence` | ISO 8601 | No | Timestamp of previous occurrence (if recurring) |
| `data.total_occurrences` | integer | Yes | Total occurrences of this error (this session) |
| `data.first_occurrence` | ISO 8601 | Yes | Timestamp of first occurrence |
| `data.frequency_minutes` | integer | No | Minutes since previous occurrence (if recurring) |

---

## 8. Backend Error Handling

The backend API processes error events received via the heartbeat endpoint, stores them in the database, triggers notifications, and performs fleet-wide error analysis.

### 8.1 Error Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND ERROR PROCESSING PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Heartbeat Received                                                      │
│     POST /api/v1/heartbeat                                                  │
│     └─ Contains events[] array with DEVICE_ERROR events                     │
│                                                                              │
│  2. Error Validation                                                        │
│     • Validate error_code format (EXXX)                                     │
│     • Validate required fields                                              │
│     • Check error_code exists in registry                                   │
│                                                                              │
│  3. Error Storage                                                           │
│     • Insert into DeviceError table                                         │
│     • Update Device.LastErrorCode                                           │
│     • Update Device.LastErrorTimestamp                                      │
│     • Increment Device.ErrorCount                                           │
│                                                                              │
│  4. Error Analysis                                                          │
│     • Check error frequency (same error in last hour)                       │
│     • Determine notification rules                                          │
│     • Check escalation criteria                                             │
│                                                                              │
│  5. Notification Generation                                                 │
│     • Create DeviceError notification                                       │
│     • Select delivery channels (push, email, in-app)                        │
│     • Apply rate limiting                                                   │
│     • Deliver notifications                                                 │
│                                                                              │
│  6. Fleet Monitoring                                                        │
│     • Update error frequency metrics                                        │
│     • Check for fleet-wide error trends                                     │
│     • Trigger PagerDuty alerts (if critical)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Error-to-Notification Mapping

| Severity | Notification Channels | Rate Limiting | Caregiver Notification | Escalation |
|:---------|:---------------------|:--------------|:----------------------|:-----------|
| **info** | In-app only | None | No | No |
| **warning** | Push, In-app | Max 1 per 10 min per error code | Yes (if user preference enabled) | No |
| **error** | Push, Email, In-app | Max 1 per 10 min per error code | Yes | After 3 occurrences/hour |
| **critical** | Push, Email, In-app, SMS (B2B) | Immediate (no rate limit) | Yes (immediate) | Immediate to PagerDuty |

### 8.3 Notification Generation Rules

| Condition | Action |
|:----------|:-------|
| First occurrence of error | Generate notification |
| Recurring error (< 10 min since last) | Suppress duplicate notification |
| Recurring error (> 10 min since last) | Generate notification with "recurring" flag |
| Error frequency > 3/hour | Escalate to support team |
| Critical error (E006, E103, E202, E205, E501, E506, E507) | Immediate notification + PagerDuty alert |
| Network error (E001-E012) + device offline > 5 min | Generate DeviceOffline notification |
| Hardware error (E101-E122) + auto-recovery failed | Generate notification with user instructions |
| Power error (E201-E210) + battery < 10% | Generate critical notification |

### 8.4 Caregiver Escalation Rules

| Error Code | Escalation Timeline | Caregiver Notification |
|:-----------|:-------------------|:----------------------|
| E101 (PILL_JAM) | After 30 min if unresolved | Yes (after 30 min) |
| E102 (MOTOR_FAILURE) | After 15 min if unresolved | Yes (after 15 min) |
| E103 (MOTOR_OVERCURRENT) | Immediate | Yes (immediate) |
| E106 (TRAY_FULL) | After 1 hour if unresolved | Yes (after 1 hour) |
| E107 (SLOT_EMPTY) | After 4 hours if unresolved | Yes (after 4 hours) |
| E201 (BATTERY_LOW) | After 1 hour if unresolved | Yes (after 1 hour) |
| E202 (BATTERY_CRITICAL) | Immediate | Yes (immediate) |
| E501 (FIRMWARE_CORRUPT) | Immediate | Yes (immediate) |
| E506 (OUT_OF_MEMORY) | Immediate | Yes (immediate) |
| E507 (TASK_CRASH) | Immediate | Yes (immediate) |

### 8.5 Error Frequency Analysis

The backend tracks error frequency for fleet monitoring:

- **Per-device error frequency**: Count of errors per device per hour/day
- **Per-error-code frequency**: Count of specific error codes across fleet
- **Error trends**: Identify increasing error rates (e.g., E101 increasing across fleet may indicate design issue)
- **Correlation analysis**: Identify error patterns (e.g., E101 often followed by E102)

Fleet-wide error metrics are exposed via:
- Grafana dashboards
- Prometheus metrics (`device_errors_total{error_code="E101"}`)
- API endpoint: `GET /api/v1/admin/errors/statistics`

---

## 9. Error Resolution Workflow

Errors can be resolved through multiple pathways: device self-recovery, user-assisted recovery, remote recovery via heartbeat commands, or support team escalation.

### 9.1 Device Self-Recovery

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVICE SELF-RECOVERY WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Error Detected                                                              │
│       │                                                                      │
│       ▼                                                                      │
│  Check if Recoverable                                                        │
│       │                                                                      │
│       ├─ No ────────────────────────────────────────────────────────────┐   │
│       │                                                                  │   │
│       │  Log Error                                                       │   │
│       │  Send to Backend                                                 │   │
│       │  Wait for User Action                                            │   │
│       │                                                                  │   │
│       └─ Yes ───────────────────────────────────────────────────────────┼───┤
│                                                                          │   │
│  Attempt Auto-Recovery                                                   │   │
│  (See section 3.3 for hardware recovery steps)                           │   │
│       │                                                                  │   │
│       ▼                                                                  │   │
│  Recovery Successful?                                                    │   │
│       │                                                                  │   │
│       ├─ Yes ───────────────────────────────────────────────────────────┼───┤
│       │                                                                  │   │
│       │  Resume Normal Operation                                         │   │
│       │  Log Recovery Success                                            │   │
│       │  Send Recovery Event to Backend                                 │   │
│       │                                                                  │   │
│       └─ No ────────────────────────────────────────────────────────────┼───┤
│                                                                          │   │
│  Increment Retry Count                                                   │   │
│       │                                                                  │   │
│       ▼                                                                  │   │
│  Max Retries Exceeded?                                                   │   │
│       │                                                                  │   │
│       ├─ Yes ───────────────────────────────────────────────────────────┼───┤
│       │                                                                  │   │
│       │  Log Error (with retry failure)                                 │   │
│       │  Send to Backend                                                 │   │
│       │  Pause Affected Operations                                      │   │
│       │  Wait for User Action                                            │   │
│       │                                                                  │   │
│       └─ No ────────────────────────────────────────────────────────────┼───┤
│                                                                          │   │
│  Wait Backoff Period                                                     │   │
│  Retry Auto-Recovery                                                     │   │
│                                                                          │   │
└──────────────────────────────────────────────────────────────────────────┘   │
```

### 9.2 User-Assisted Recovery

Users can resolve errors through:

1. **Physical Actions**:
   - Remove stuck pills (E101)
   - Insert/remove tray (E105, E106)
   - Refill medication slots (E107)
   - Clean sensors (E108)
   - Power cycle device (E102, E109, E110, E111, E120)

2. **Mobile App Actions**:
   - Acknowledge error (dismisses notification)
   - Request retry (triggers remote recovery command)
   - View error details and instructions

3. **Web Portal Actions**:
   - View error history
   - Trigger remote recovery commands
   - Contact support

### 9.3 Remote Recovery via Heartbeat Commands

The backend can send recovery commands in the heartbeat response:

```json
{
  "status": "ok",
  "commands": [
    {
      "command": "RETRY_DISPENSE",
      "parameters": {
        "slot": 3,
        "retry_count": 1
      }
    },
    {
      "command": "RESET_MOTOR",
      "parameters": {
        "motor_id": "carousel"
      }
    },
    {
      "command": "RECALIBRATE_CAROUSEL"
    }
  ]
}
```

Available remote recovery commands:

| Command | Description | Applicable Errors |
|:--------|:------------|:------------------|
| `RETRY_DISPENSE` | Retry dispensing operation | E101, E105, E121, E122 |
| `RESET_MOTOR` | Reset motor driver | E102, E103 |
| `RESET_SENSOR` | Reset sensor | E104, E108 |
| `RECALIBRATE_CAROUSEL` | Recalibrate carousel position | E120 |
| `RESET_GATE` | Reset gate servo | E121, E122 |
| `CLEANUP_STORAGE` | Cleanup old logs | E301, E305 |
| `RETRY_SYNC` | Retry schedule sync | E503 |
| `RETRY_OTA` | Retry OTA update | E504 |

### 9.4 Support Team Escalation Criteria

Errors are escalated to the support team when:

1. **Critical errors** (E006, E103, E202, E205, E501, E506, E507): Immediate escalation
2. **Error frequency > 3/hour**: Escalation after 1 hour
3. **Error unresolved > 24 hours**: Escalation for user action required errors
4. **Fleet-wide error trend**: Escalation if same error affects >5% of fleet
5. **User requests support**: Manual escalation via web portal or mobile app

Escalation triggers:
- PagerDuty alert (critical errors)
- Support ticket creation (non-critical escalation)
- Email to support team
- Dashboard alert in Grafana

---

## 10. Error Code Quick Reference

Complete one-page reference table with all error codes, severity, and one-line descriptions.

| Code | Name | Severity | Description |
|:-----|:-----|:---------|:------------|
| **E001** | WIFI_DISCONNECTED | warning | WiFi connection lost, auto-reconnect every 30s |
| **E002** | API_UNREACHABLE | warning | Cannot reach API server, enter offline mode |
| **E003** | AUTH_FAILED | error | Device token rejected, re-register |
| **E004** | API_TIMEOUT | warning | API didn't respond within 30s |
| **E005** | DNS_FAILED | error | Cannot resolve API hostname |
| **E006** | TLS_FAILED | critical | TLS handshake failed, possible MITM |
| **E007** | RATE_LIMITED | info | API returned 429, back off |
| **E010** | CELLULAR_NO_SIGNAL | warning | No cellular signal (travel device) |
| **E011** | CELLULAR_NO_DATA | warning | Signal but no data connection |
| **E012** | CELLULAR_ROAMING | info | Device is roaming |
| **E101** | PILL_JAM | warning | Pill stuck during dispensing |
| **E102** | MOTOR_FAILURE | error | Stepper motor not responding |
| **E103** | MOTOR_OVERCURRENT | critical | Motor drawing excessive current |
| **E104** | SENSOR_FAILURE | error | Sensor not responding |
| **E105** | TRAY_NOT_DETECTED | warning | Output tray not in position |
| **E106** | TRAY_FULL | warning | Output tray contains uncollected pills |
| **E107** | SLOT_EMPTY | warning | Medication slot has no pills |
| **E108** | SLOT_SENSOR_BLOCKED | error | Optical sensor permanently blocked |
| **E109** | DISPLAY_FAILURE | error | Display not responding |
| **E110** | TOUCH_FAILURE | error | Touch controller not responding |
| **E111** | SPEAKER_FAILURE | error | Audio amplifier not responding |
| **E112** | BUTTON_STUCK | warning | Physical button stuck in pressed state |
| **E120** | CAROUSEL_MISALIGNED | error | Carousel not in expected position |
| **E121** | GATE_STUCK_OPEN | error | Servo gate stuck open |
| **E122** | GATE_STUCK_CLOSED | error | Servo gate stuck closed |
| **E201** | BATTERY_LOW | warning | Battery < 20% |
| **E202** | BATTERY_CRITICAL | critical | Battery < 5% |
| **E203** | AC_POWER_LOST | warning | Mains power disconnected (UPS active) |
| **E204** | BATTERY_NOT_CHARGING | error | Charger fault |
| **E205** | BATTERY_OVERTEMP | critical | Battery temperature > 45°C |
| **E206** | BATTERY_UNDERTEMP | warning | Battery temperature < 0°C |
| **E207** | CHARGER_FAULT | error | BQ24195 charger IC fault |
| **E210** | UPS_BATTERY_LOW | warning | Backup battery low |
| **E301** | LOCAL_STORAGE_FULL | warning | NVS partition >90% full |
| **E302** | TEMP_OUT_OF_RANGE | warning | Ambient temp outside 10-35°C |
| **E303** | HUMIDITY_OUT_OF_RANGE | warning | Humidity outside 20-80% |
| **E304** | SD_CARD_ERROR | error | SD card read/write failure |
| **E305** | SD_CARD_FULL | warning | SD card >90% full |
| **E306** | SD_CARD_MISSING | info | SD card not inserted |
| **E501** | FIRMWARE_CORRUPT | critical | Firmware verification failed |
| **E502** | CONFIG_CORRUPT | error | Configuration data corrupted |
| **E503** | SCHEDULE_SYNC_FAILED | warning | Cannot sync schedule from cloud |
| **E504** | OTA_FAILED | error | Firmware update failed |
| **E505** | WATCHDOG_RESET | error | Watchdog timer triggered |
| **E506** | OUT_OF_MEMORY | critical | Heap memory exhausted |
| **E507** | TASK_CRASH | critical | FreeRTOS task crashed |

---

## Appendix A: Error Code Registry

The backend maintains an error code registry that validates incoming error codes and provides metadata. This registry is stored in the database (`ErrorCode` table) and can be updated via admin API.

### A.1 Registry Schema

```sql
CREATE TABLE ErrorCode (
    Code VARCHAR(4) PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Category VARCHAR(20) NOT NULL,
    Severity VARCHAR(10) NOT NULL,
    Description TEXT NOT NULL,
    Recoverable BIT NOT NULL,
    AutoRecovery BIT NOT NULL,
    UserActionRequired BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL
);
```

### A.2 Admin API Endpoints

- `GET /api/v1/admin/error-codes` - List all error codes
- `GET /api/v1/admin/error-codes/{code}` - Get error code details
- `POST /api/v1/admin/error-codes` - Create new error code (future use)
- `PUT /api/v1/admin/error-codes/{code}` - Update error code metadata

---

## Appendix B: Error Code Testing

Firmware developers can trigger test errors for validation:

| Test Command | Error Code | Description |
|:-------------|:-----------|:------------|
| `TEST_ERROR E001` | E001 | Simulate WiFi disconnection |
| `TEST_ERROR E101` | E101 | Simulate pill jam |
| `TEST_ERROR E201` | E201 | Simulate low battery |
| `TEST_ERROR E501` | E501 | Simulate firmware corruption |

Test errors are marked with `test: true` flag in the error event and are filtered from production monitoring dashboards.

---

**End of Document**
