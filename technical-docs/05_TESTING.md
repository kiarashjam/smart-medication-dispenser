# Testing Specification

**Comprehensive Test Plan — Hardware, Firmware & Software**

**CE MDR & Swissmedic Compliant**

**Version 3.0**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Applies To | SMD-100 (Home), SMD-200 (Travel), Backend API, Mobile App, Web Portal |
| Standards | IEC 60601-1, IEC 62304, ISO 13485 |

---

## 1. Testing Overview

### 1.1 Testing Phases

| Phase | Purpose | When | Exit Criteria |
|:------|:--------|:-----|:--------------|
| **Unit Testing** | Individual components | Development | All components pass specs |
| **Integration Testing** | Subsystems together | Post-assembly | All subsystems interact correctly |
| **System Testing** | Complete device | Before validation | All requirements met |
| **Performance Testing** | Under stress/load | Before production | Meets performance specs |
| **Environmental Testing** | Temperature, humidity, etc. | Before certification | Passes environmental specs |
| **Regulatory Testing** | CE/Swissmedic compliance | Before submission | All standards met |
| **Production Testing** | Every manufactured unit | During production | Pass/fail criteria |

### 1.2 Test Documentation Requirements

| Document | Purpose | Standard |
|:---------|:--------|:---------|
| Test Plan | Define all tests | ISO 13485 |
| Test Protocols | Step-by-step procedures | ISO 13485 |
| Test Reports | Record results | ISO 13485 |
| Traceability Matrix | Link tests to requirements | IEC 62304 |
| Non-conformance Reports | Document failures | ISO 13485 |

---

## 2. Unit Testing

### 2.1 MCU Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| MCU-001 | Power-on voltage | 3.3V ± 0.1V | ☐ | ☐ |
| MCU-002 | Crystal frequency | 40MHz ± 50ppm | ☐ | ☐ |
| MCU-003 | Flash memory read/write | All addresses | ☐ | ☐ |
| MCU-004 | PSRAM access | 8MB accessible | ☐ | ☐ |
| MCU-005 | GPIO functionality | All pins toggle | ☐ | ☐ |
| MCU-006 | ADC accuracy | ± 1% FSR | ☐ | ☐ |
| MCU-007 | PWM output | 0-100% duty cycle | ☐ | ☐ |
| MCU-008 | Watchdog timer | Resets at timeout | ☐ | ☐ |
| MCU-009 | Deep sleep current | < 10µA | ☐ | ☐ |
| MCU-010 | Wake from sleep | < 500ms | ☐ | ☐ |

### 2.2 Display Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| DSP-001 | Power-on initialization | Display active < 2s | ☐ | ☐ |
| DSP-002 | Full white screen | All pixels white | ☐ | ☐ |
| DSP-003 | Full black screen | All pixels black | ☐ | ☐ |
| DSP-004 | Color accuracy | RGB values ± 5% | ☐ | ☐ |
| DSP-005 | Brightness control | 10 levels working | ☐ | ☐ |
| DSP-006 | Touch calibration | < 5mm accuracy | ☐ | ☐ |
| DSP-007 | Touch response time | < 50ms | ☐ | ☐ |
| DSP-008 | Multi-touch (if applicable) | Detects 2 points | ☐ | ☐ |
| DSP-009 | Viewing angle | Readable at ±45° | ☐ | ☐ |
| DSP-010 | Sunlight readability | Readable at 1000 lux | ☐ | ☐ |

### 2.3 Motor Testing

#### Stepper Motor (Carousel)

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| MTR-001 | Step accuracy | 200 steps = 360° ± 0.5° | ☐ | ☐ |
| MTR-002 | Holding torque | > 0.4 Nm | ☐ | ☐ |
| MTR-003 | Speed test | 60 RPM achievable | ☐ | ☐ |
| MTR-004 | Current draw | < 1.7A per phase | ☐ | ☐ |
| MTR-005 | Heat test (30 min operation) | < 60°C surface | ☐ | ☐ |
| MTR-006 | Microstepping (1/16) | Smooth motion | ☐ | ☐ |
| MTR-007 | Direction reversal | No lost steps | ☐ | ☐ |
| MTR-008 | Homing accuracy | ± 1 step | ☐ | ☐ |
| MTR-009 | Noise level | < 45 dB @ 1m | ☐ | ☐ |
| MTR-010 | Endurance (10,000 cycles) | No degradation | ☐ | ☐ |

#### Servo Motor (Gate)

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| SRV-001 | Position accuracy | ± 2° | ☐ | ☐ |
| SRV-002 | Speed (60° rotation) | < 200ms | ☐ | ☐ |
| SRV-003 | Torque | > 1.5 kg-cm | ☐ | ☐ |
| SRV-004 | Open position | Gate fully open | ☐ | ☐ |
| SRV-005 | Close position | Gate fully sealed | ☐ | ☐ |
| SRV-006 | Obstacle detection | Stall detected | ☐ | ☐ |
| SRV-007 | Endurance (50,000 cycles) | No degradation | ☐ | ☐ |

### 2.4 Sensor Testing

#### Optical Pill Counter

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| OPT-001 | Detection sensitivity | Detects 3mm pill | ☐ | ☐ |
| OPT-002 | Speed (pills/sec) | Up to 10 pills/sec | ☐ | ☐ |
| OPT-003 | Count accuracy (1 pill) | 100% (100 tests) | ☐ | ☐ |
| OPT-004 | Count accuracy (5 pills) | 100% (100 tests) | ☐ | ☐ |
| OPT-005 | Count accuracy (10 pills) | ≥ 99.9% (100 tests) | ☐ | ☐ |
| OPT-006 | Different pill colors | White, blue, red, clear | ☐ | ☐ |
| OPT-007 | Different pill sizes | 3mm to 20mm | ☐ | ☐ |
| OPT-008 | Ambient light immunity | Works 0-1000 lux | ☐ | ☐ |
| OPT-009 | Dust/debris tolerance | Works with minor debris | ☐ | ☐ |

#### Weight Sensor (Load Cell + HX711)

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| WGT-001 | Zero calibration | 0.0g ± 0.1g | ☐ | ☐ |
| WGT-002 | Accuracy at 1g | ± 0.1g | ☐ | ☐ |
| WGT-003 | Accuracy at 10g | ± 0.2g | ☐ | ☐ |
| WGT-004 | Accuracy at 50g | ± 0.5g | ☐ | ☐ |
| WGT-005 | Repeatability | ± 0.1g over 10 readings | ☐ | ☐ |
| WGT-006 | Response time | < 100ms | ☐ | ☐ |
| WGT-007 | Drift over 1 hour | < 0.2g | ☐ | ☐ |
| WGT-008 | Temperature compensation | ± 0.3g (15-35°C) | ☐ | ☐ |
| WGT-009 | Overload protection | Survives 2x rated load | ☐ | ☐ |

#### Temperature & Humidity Sensor

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| ENV-001 | Temperature accuracy | ± 0.5°C | ☐ | ☐ |
| ENV-002 | Humidity accuracy | ± 3% RH | ☐ | ☐ |
| ENV-003 | Response time | < 8 seconds | ☐ | ☐ |
| ENV-004 | Range (temperature) | -10°C to 60°C | ☐ | ☐ |
| ENV-005 | Range (humidity) | 0% to 100% RH | ☐ | ☐ |
| ENV-006 | I2C communication | Stable at 400kHz | ☐ | ☐ |

#### Door/Tray Sensor

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| DOR-001 | Open detection | State = OPEN | ☐ | ☐ |
| DOR-002 | Close detection | State = CLOSED | ☐ | ☐ |
| DOR-003 | Response time | < 10ms | ☐ | ☐ |
| DOR-004 | Debounce | No false triggers | ☐ | ☐ |
| DOR-005 | Magnet alignment | Works with 5mm gap | ☐ | ☐ |

#### PIR Motion Sensor

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| PIR-001 | Detection range | 3 meters @ 25°C | ☐ | ☐ |
| PIR-002 | Detection angle | 120° horizontal | ☐ | ☐ |
| PIR-003 | Response time | < 2 seconds | ☐ | ☐ |
| PIR-004 | Reset time | < 5 seconds | ☐ | ☐ |
| PIR-005 | False trigger rate | < 1 per hour | ☐ | ☐ |

---

## 3. Connectivity Testing

### 3.1 WiFi Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| WIF-001 | 2.4GHz connection | Connects < 10s | ☐ | ☐ |
| WIF-002 | 5GHz connection | Connects < 10s | ☐ | ☐ |
| WIF-003 | Range (open space) | 30 meters | ☐ | ☐ |
| WIF-004 | Range (through 1 wall) | 15 meters | ☐ | ☐ |
| WIF-005 | Signal strength reading | Accurate ± 3 dBm | ☐ | ☐ |
| WIF-006 | Auto reconnect | Reconnects < 60s | ☐ | ☐ |
| WIF-007 | WPA2 authentication | Connects successfully | ☐ | ☐ |
| WIF-008 | WPA3 authentication | Connects successfully | ☐ | ☐ |
| WIF-009 | Hidden SSID | Connects successfully | ☐ | ☐ |
| WIF-010 | Channel switching | Seamless handoff | ☐ | ☐ |
| WIF-011 | Data throughput | > 5 Mbps | ☐ | ☐ |
| WIF-012 | Concurrent connections | WiFi + BLE | ☐ | ☐ |

### 3.2 Cellular Testing (SMD-200 Travel Device)

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| CEL-001 | LTE Cat-M1 connection | Connects < 30s | ☐ | ☐ |
| CEL-002 | NB-IoT fallback | Connects < 60s | ☐ | ☐ |
| CEL-003 | Signal strength reading | Accurate | ☐ | ☐ |
| CEL-004 | Indoor operation | Works in building | ☐ | ☐ |
| CEL-005 | Roaming (EU) | Connects in DE, FR, AT | ☐ | ☐ |
| CEL-006 | Data throughput | > 100 Kbps | ☐ | ☐ |
| CEL-007 | Power consumption | < 200mA average | ☐ | ☐ |
| CEL-008 | Antenna performance | VSWR < 2:1 | ☐ | ☐ |
| CEL-009 | SIM card detection | Detects and authenticates | ☐ | ☐ |
| CEL-010 | eSIM profile switch | Changes profile | ☐ | ☐ |

### 3.3 Bluetooth Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| BLE-001 | Advertising | Discoverable | ☐ | ☐ |
| BLE-002 | Pairing (iOS) | Pairs successfully | ☐ | ☐ |
| BLE-003 | Pairing (Android) | Pairs successfully | ☐ | ☐ |
| BLE-004 | Range | 10 meters | ☐ | ☐ |
| BLE-005 | Reconnection | Auto reconnects | ☐ | ☐ |
| BLE-006 | Data transfer | GATT operations | ☐ | ☐ |
| BLE-007 | Notification | Receives notifications | ☐ | ☐ |
| BLE-008 | Security (bonding) | Encrypted connection | ☐ | ☐ |

---

## 4. Dispensing System Testing

### 4.1 Basic Dispensing Tests

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| DIS-001 | Single pill dispense (slot 1) | 1 pill dispensed | ☐ | ☐ |
| DIS-002 | Multiple pills (5) | 5 pills dispensed | ☐ | ☐ |
| DIS-003 | All slots work | 10/10 slots dispense | ☐ | ☐ |
| DIS-004 | Slot rotation accuracy | Correct slot selected | ☐ | ☐ |
| DIS-005 | Dispense speed | < 5 seconds total | ☐ | ☐ |
| DIS-006 | Consecutive dispenses | 10 in a row work | ☐ | ☐ |

### 4.2 Pill Size/Shape Compatibility

| Test ID | Pill Type | Size | Expected Result | Pass | Fail |
|:--------|:----------|:-----|:----------------|:----:|:----:|
| PIL-001 | Small round | 5mm | Dispenses correctly | ☐ | ☐ |
| PIL-002 | Medium round | 10mm | Dispenses correctly | ☐ | ☐ |
| PIL-003 | Large round | 15mm | Dispenses correctly | ☐ | ☐ |
| PIL-004 | Oval tablet | 12×6mm | Dispenses correctly | ☐ | ☐ |
| PIL-005 | Oblong tablet | 18×8mm | Dispenses correctly | ☐ | ☐ |
| PIL-006 | Capsule small | 14mm | Dispenses correctly | ☐ | ☐ |
| PIL-007 | Capsule large | 22mm | Dispenses correctly | ☐ | ☐ |
| PIL-008 | Gel cap | 12mm | Dispenses correctly | ☐ | ☐ |
| PIL-009 | Soft gel | 15mm | Dispenses correctly | ☐ | ☐ |
| PIL-010 | Irregular shape | Various | Dispenses correctly | ☐ | ☐ |

### 4.3 Accuracy Testing (Statistical)

| Test ID | Test | Sample Size | Acceptance Criteria | Result |
|:--------|:-----|:------------|:--------------------|:-------|
| ACC-001 | 1 pill accuracy | 1000 | ≥ 99.9% | ___% |
| ACC-002 | 2 pill accuracy | 500 | ≥ 99.8% | ___% |
| ACC-003 | 5 pill accuracy | 200 | ≥ 99.5% | ___% |
| ACC-004 | 10 pill accuracy | 100 | ≥ 99.0% | ___% |
| ACC-005 | Mixed sizes | 100 | ≥ 99.0% | ___% |
| ACC-006 | All slots combined | 100 | ≥ 99.5% | ___% |

### 4.4 Jam Detection & Recovery

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| JAM-001 | Detects single pill jam | Error E101 generated | ☐ | ☐ |
| JAM-002 | Detects multiple pill jam | Error E101 generated | ☐ | ☐ |
| JAM-003 | Motor stall detection | Error E103 generated | ☐ | ☐ |
| JAM-004 | Auto-retry (1x) | Attempts recovery | ☐ | ☐ |
| JAM-005 | User notification | Alert displayed | ☐ | ☐ |
| JAM-006 | API error sent | Event transmitted | ☐ | ☐ |
| JAM-007 | Recovery after clear | Normal operation resumes | ☐ | ☐ |

---

## 5. API Integration Testing

### 5.1 Device Registration

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| REG-001 | First boot registration | Registers successfully | ☐ | ☐ |
| REG-002 | Token received | Valid JWT token | ☐ | ☐ |
| REG-003 | Token stored securely | In secure element | ☐ | ☐ |
| REG-004 | Device ID sent | Correct format | ☐ | ☐ |
| REG-005 | Firmware version sent | Correct version | ☐ | ☐ |
| REG-006 | Hardware version sent | Correct version | ☐ | ☐ |
| REG-007 | Re-registration | Works after factory reset | ☐ | ☐ |
| REG-008 | Invalid credentials | Rejected properly | ☐ | ☐ |

### 5.2 Heartbeat Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| HRT-001 | Interval timing | Every 60s ± 5s | ☐ | ☐ |
| HRT-002 | All fields populated | No null values | ☐ | ☐ |
| HRT-003 | Battery level accurate | ± 5% | ☐ | ☐ |
| HRT-004 | WiFi signal accurate | ± 3 dBm | ☐ | ☐ |
| HRT-005 | Temperature accurate | ± 1°C | ☐ | ☐ |
| HRT-006 | Slot data accurate | Correct pill counts | ☐ | ☐ |
| HRT-007 | Command processing | Commands received | ☐ | ☐ |
| HRT-008 | Config updates | Settings applied | ☐ | ☐ |

### 5.3 Event Transmission

| Test ID | Event Type | Expected Result | Pass | Fail |
|:--------|:-----------|:----------------|:----:|:----:|
| EVT-001 | DOSE_DISPENSED | Sent successfully | ☐ | ☐ |
| EVT-002 | DOSE_TAKEN | Sent successfully | ☐ | ☐ |
| EVT-003 | DOSE_MISSED | Sent successfully | ☐ | ☐ |
| EVT-004 | DOSE_PARTIAL | Sent successfully | ☐ | ☐ |
| EVT-005 | REFILL_NEEDED | Sent successfully | ☐ | ☐ |
| EVT-006 | REFILL_CRITICAL | Sent successfully | ☐ | ☐ |
| EVT-007 | DEVICE_ONLINE | Sent successfully | ☐ | ☐ |
| EVT-008 | DEVICE_ERROR | Sent successfully | ☐ | ☐ |
| EVT-009 | BATTERY_LOW | Sent successfully | ☐ | ☐ |
| EVT-010 | TRAVEL_MODE_ON | Sent successfully | ☐ | ☐ |
| EVT-011 | Event timing | Timestamp accurate ± 1s | ☐ | ☐ |
| EVT-012 | Event ordering | Sequence numbers correct | ☐ | ☐ |

### 5.4 Offline Mode Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| OFF-001 | Event storage | Events saved locally | ☐ | ☐ |
| OFF-002 | Storage capacity | 1000+ events | ☐ | ☐ |
| OFF-003 | Sync on reconnect | All events sent | ☐ | ☐ |
| OFF-004 | Event ordering | Chronological order | ☐ | ☐ |
| OFF-005 | No data loss | All events delivered | ☐ | ☐ |
| OFF-006 | Storage encryption | Events encrypted | ☐ | ☐ |
| OFF-007 | Extended offline (7 days) | Continues operation | ☐ | ☐ |
| OFF-008 | Schedule continues | Doses dispensed offline | ☐ | ☐ |

---

## 6. Power Testing

### 6.1 SMD-100 Home Device Power

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| PWR-001 | AC input voltage range | 100-240V AC | ☐ | ☐ |
| PWR-002 | Power consumption (idle) | < 5W | ☐ | ☐ |
| PWR-003 | Power consumption (active) | < 15W | ☐ | ☐ |
| PWR-004 | AC to battery switchover | < 100ms | ☐ | ☐ |
| PWR-005 | Battery to AC switchover | < 100ms | ☐ | ☐ |
| PWR-006 | Battery backup duration | > 48 hours (idle) | ☐ | ☐ |
| PWR-007 | Battery backup (dispensing) | > 100 dispenses | ☐ | ☐ |
| PWR-008 | Low battery detection | Alert at 20% | ☐ | ☐ |
| PWR-009 | Critical battery shutdown | At 5% | ☐ | ☐ |
| PWR-010 | Battery charging time | < 8 hours | ☐ | ☐ |
| PWR-011 | Over-voltage protection | Survives 15V | ☐ | ☐ |
| PWR-012 | Reverse polarity protection | No damage | ☐ | ☐ |

### 6.2 SMD-200 Travel Device Power

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| TRV-001 | Battery capacity | 3000mAh ± 5% | ☐ | ☐ |
| TRV-002 | Battery life (standby) | > 14 days | ☐ | ☐ |
| TRV-003 | Battery life (4 doses/day) | > 7 days | ☐ | ☐ |
| TRV-004 | Charging time (0-100%) | < 3 hours | ☐ | ☐ |
| TRV-005 | USB-C charging | 5V/2A | ☐ | ☐ |
| TRV-006 | Charge while operating | Works correctly | ☐ | ☐ |
| TRV-007 | Low battery alert | At 20% | ☐ | ☐ |
| TRV-008 | Battery temperature | < 45°C during charge | ☐ | ☐ |

---

## 7. Audio Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| AUD-001 | Volume range | 60-90 dB @ 1m | ☐ | ☐ |
| AUD-002 | Volume steps | 10 distinguishable levels | ☐ | ☐ |
| AUD-003 | Alert tone clarity | Clear at all volumes | ☐ | ☐ |
| AUD-004 | Voice prompt clarity | Intelligible | ☐ | ☐ |
| AUD-005 | French voice | Natural pronunciation | ☐ | ☐ |
| AUD-006 | German voice | Natural pronunciation | ☐ | ☐ |
| AUD-007 | Italian voice | Natural pronunciation | ☐ | ☐ |
| AUD-008 | English voice | Natural pronunciation | ☐ | ☐ |
| AUD-009 | Audio feedback | Button press sounds | ☐ | ☐ |
| AUD-010 | Distortion | No distortion at max | ☐ | ☐ |
| AUD-011 | Quiet hours | Audio muted | ☐ | ☐ |

---

## 8. Security Testing

### 8.1 Communication Security

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| SEC-001 | HTTPS enforcement | HTTP rejected | ☐ | ☐ |
| SEC-002 | TLS version | TLS 1.3 only | ☐ | ☐ |
| SEC-003 | Certificate validation | Invalid cert rejected | ☐ | ☐ |
| SEC-004 | Certificate pinning | Wrong pin rejected | ☐ | ☐ |
| SEC-005 | Token validation | Invalid token rejected | ☐ | ☐ |
| SEC-006 | Token expiry handling | Refreshes automatically | ☐ | ☐ |
| SEC-007 | Man-in-the-middle | Attack detected | ☐ | ☐ |
| SEC-008 | Replay attack | Rejected | ☐ | ☐ |

### 8.2 Device Security

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| SEC-010 | Secure boot | Only signed firmware boots | ☐ | ☐ |
| SEC-011 | JTAG disabled | Cannot connect debugger | ☐ | ☐ |
| SEC-012 | UART disabled | No debug output | ☐ | ☐ |
| SEC-013 | Flash encryption | Flash unreadable | ☐ | ☐ |
| SEC-014 | Secure element | Token inaccessible | ☐ | ☐ |
| SEC-015 | Factory reset | All data cleared | ☐ | ☐ |
| SEC-016 | Tamper detection | Event generated | ☐ | ☐ |

### 8.3 Data Security

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| SEC-020 | Data at rest encryption | AES-256 | ☐ | ☐ |
| SEC-021 | No PII stored | Only device ID | ☐ | ☐ |
| SEC-022 | Event data encrypted | Cannot read offline | ☐ | ☐ |
| SEC-023 | Schedule data encrypted | Cannot read offline | ☐ | ☐ |
| SEC-024 | WiFi password encrypted | Cannot extract | ☐ | ☐ |

---

## 9. Environmental Testing

### 9.1 Temperature Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| TMP-001 | Operating at 10°C | Full functionality | ☐ | ☐ |
| TMP-002 | Operating at 25°C | Full functionality | ☐ | ☐ |
| TMP-003 | Operating at 40°C | Full functionality | ☐ | ☐ |
| TMP-004 | Operating at 5°C | Warning, functional | ☐ | ☐ |
| TMP-005 | Operating at 45°C | Warning, functional | ☐ | ☐ |
| TMP-006 | Storage at -10°C | No damage | ☐ | ☐ |
| TMP-007 | Storage at 60°C | No damage | ☐ | ☐ |
| TMP-008 | Thermal cycling | No failures | ☐ | ☐ |

### 9.2 Humidity Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| HUM-001 | Operating at 30% RH | Full functionality | ☐ | ☐ |
| HUM-002 | Operating at 60% RH | Full functionality | ☐ | ☐ |
| HUM-003 | Operating at 85% RH | Warning, functional | ☐ | ☐ |
| HUM-004 | Condensation test | No damage | ☐ | ☐ |

### 9.3 Mechanical Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| MEC-001 | Drop test (0.5m, operating) | No damage, functional | ☐ | ☐ |
| MEC-002 | Drop test (1m, packaged) | No damage | ☐ | ☐ |
| MEC-003 | Vibration test | No failures | ☐ | ☐ |
| MEC-004 | Button durability (10,000 presses) | Still functional | ☐ | ☐ |
| MEC-005 | Tray durability (10,000 cycles) | Still functional | ☐ | ☐ |
| MEC-006 | Enclosure integrity | No cracks | ☐ | ☐ |

### 9.4 EMC Pre-Compliance

| Test ID | Test | Standard | Expected Result | Pass | Fail |
|:--------|:-----|:---------|:----------------|:----:|:----:|
| EMC-001 | Radiated emissions | EN 55032 | < Class B | ☐ | ☐ |
| EMC-002 | Conducted emissions | EN 55032 | < Class B | ☐ | ☐ |
| EMC-003 | ESD immunity | EN 61000-4-2 | Level 3 | ☐ | ☐ |
| EMC-004 | Radiated immunity | EN 61000-4-3 | 3 V/m | ☐ | ☐ |
| EMC-005 | Surge immunity | EN 61000-4-5 | Level 2 | ☐ | ☐ |

---

## 10. User Experience Testing

| Test ID | Test | Expected Result | Pass | Fail |
|:--------|:-----|:----------------|:----:|:----:|
| UX-001 | Setup time (unbox to first dose) | < 15 minutes | ☐ | ☐ |
| UX-002 | WiFi setup | < 3 minutes | ☐ | ☐ |
| UX-003 | Medication loading | < 5 minutes per slot | ☐ | ☐ |
| UX-004 | Schedule setup (via app) | < 10 minutes | ☐ | ☐ |
| UX-005 | Daily use (take dose) | < 30 seconds | ☐ | ☐ |
| UX-006 | Error message clarity | 5/5 users understand | ☐ | ☐ |
| UX-007 | Display readability | 5/5 users can read | ☐ | ☐ |
| UX-008 | Button accessibility | 5/5 users can press | ☐ | ☐ |
| UX-009 | Elderly user test (65+) | Task completion rate ≥ 90% | ☐ | ☐ |
| UX-010 | Visually impaired test | Audio-only navigation | ☐ | ☐ |

---

## 11. Regulatory Certification Testing

### 11.1 CE Marking (IEC 60601-1)

| Test ID | Test | Standard | Lab Required | Status |
|:--------|:-----|:---------|:------------:|:------:|
| CE-001 | Electrical safety | IEC 60601-1 | Yes | ☐ |
| CE-002 | EMC - Emissions | IEC 60601-1-2 | Yes | ☐ |
| CE-003 | EMC - Immunity | IEC 60601-1-2 | Yes | ☐ |
| CE-004 | Software lifecycle | IEC 62304 | No | ☐ |
| CE-005 | Risk management | ISO 14971 | No | ☐ |
| CE-006 | Usability | IEC 62366-1 | No | ☐ |
| CE-007 | Biocompatibility | ISO 10993 | Yes | ☐ |

### 11.2 Quality System

| Test ID | Requirement | Standard | Status |
|:--------|:------------|:---------|:------:|
| QMS-001 | QMS established | ISO 13485 | ☐ |
| QMS-002 | Design controls | ISO 13485 | ☐ |
| QMS-003 | Document control | ISO 13485 | ☐ |
| QMS-004 | CAPA system | ISO 13485 | ☐ |
| QMS-005 | Supplier management | ISO 13485 | ☐ |
| QMS-006 | Internal audits | ISO 13485 | ☐ |

---

## 12. Production Testing

### 12.1 In-Circuit Test (ICT)

| Test | Pass Criteria |
|:-----|:--------------|
| Power rails | 3.3V ± 3%, 5V ± 3%, 12V ± 5% |
| All ICs present | Continuity to ground/power |
| All passives | ± 10% tolerance |
| Crystal oscillation | 40MHz ± 50ppm |
| Flash ID | Correct manufacturer ID |

### 12.2 Functional Test (FCT)

| Test | Duration | Pass Criteria |
|:-----|:---------|:--------------|
| Boot test | 30s | Boot to main screen |
| WiFi test | 60s | Connect to test AP |
| Display test | 15s | All pixels, touch works |
| Motor test | 30s | Full rotation, no stall |
| Sensor test | 30s | All sensors responding |
| Audio test | 15s | Tone at 80 dB |
| API test | 30s | Heartbeat sent |

### 12.3 Burn-In Test

| Phase | Duration | Conditions |
|:------|:---------|:-----------|
| High temp | 4 hours | 40°C |
| Normal | 16 hours | 25°C |
| Low temp | 4 hours | 10°C |
| Cycling | 10 dispense cycles | — |

---

## 13. Test Sign-Off (Hardware)

| Role | Name | Signature | Date |
|:-----|:-----|:----------|:-----|
| Electronics Engineer | | | |
| Firmware Engineer | | | |
| QA Engineer | | | |
| Project Manager | | | |
| Regulatory | | | |

---

# PART 2: Software Testing

> The following sections cover testing for the **backend API** (ASP.NET Core 8), **mobile app** (React Native/Expo), and **web portal** (React + Vite).

---

## 14. Backend API Testing

### 14.1 Testing Framework

| Tool | Purpose | Notes |
|:-----|:--------|:------|
| **xUnit** | Test framework | Standard for .NET |
| **FluentAssertions** | Assertion library | Readable assertions |
| **Moq** | Mocking library | Service mocking |
| **MediatR** | CQRS testing | Command/Query handlers |
| **EF Core InMemory** | Database testing | In-memory provider for unit tests |
| **TestServer** | Integration testing | ASP.NET Core test server |
| **Swagger/OpenAPI** | API documentation | Auto-generated from controllers |

### 14.2 Unit Tests — Application Layer

Tests for CQRS command/query handlers (located in `backend/tests/Application.Tests/`).

#### Dispensing Logic Tests

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| APP-001 | Confirm dispense sets ConfirmedAtUtc | Timestamp set, status = Confirmed | ☐ |
| APP-002 | Confirm already-confirmed dispense throws | InvalidOperationException | ☐ |
| APP-003 | Confirm missed dispense throws | InvalidOperationException | ☐ |
| APP-004 | Dispense for non-existent device returns null | Result is null | ☐ |
| APP-005 | Dispense creates event with Dispensed status | Status = Dispensed | ☐ |
| APP-006 | Delay sets DelayedAtUtc and status | Status = Delayed | ☐ |

#### Missed Dose Logic Tests

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| APP-010 | Pending event older than 30 min marked missed | Status = Missed | ☐ |
| APP-011 | Pending event within 30 min stays pending | Status = Pending | ☐ |
| APP-012 | Already confirmed event not marked missed | Status = Confirmed | ☐ |
| APP-013 | Missed dose creates notification | Notification created | ☐ |
| APP-014 | Missed dose triggers caregiver alert | Caregiver notified | ☐ |

#### Travel Mode Logic Tests

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| APP-020 | Start travel creates session | TravelSession created | ☐ |
| APP-021 | Start travel with active session throws | InvalidOperationException | ☐ |
| APP-022 | End travel sets EndedAtUtc | Timestamp set | ☐ |
| APP-023 | End travel without active session returns null | Result is null | ☐ |
| APP-024 | Travel copies containers to portable device | Container copies created | ☐ |

#### Authentication Tests

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| APP-030 | Register new user returns JWT | Valid token + user DTO | ☐ |
| APP-031 | Register duplicate email throws | InvalidOperationException | ☐ |
| APP-032 | Login with correct credentials returns JWT | Valid token | ☐ |
| APP-033 | Login with wrong password throws | UnauthorizedAccessException | ☐ |
| APP-034 | Login with non-existent email throws | UnauthorizedAccessException | ☐ |
| APP-035 | JWT contains correct claims | sub, email, role claims present | ☐ |

### 14.3 Unit Tests — Domain Layer

Tests for domain entities and value objects (located in `backend/tests/Domain.Tests/`).

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| DOM-001 | Device default status is Active | Status = Active | ☐ |
| DOM-002 | Container validates slot number range | 1-10 valid, 0/11 invalid | ☐ |
| DOM-003 | Schedule bitmask 127 = every day | All 7 days set | ☐ |
| DOM-004 | Schedule bitmask 31 = weekdays only | Mon-Fri set | ☐ |
| DOM-005 | DispenseEvent status lifecycle | Pending→Dispensed→Confirmed valid | ☐ |
| DOM-006 | User role enum values correct | Patient=0, Caregiver=1, Admin=2 | ☐ |

### 14.4 Integration Tests — API Endpoints

Full-stack tests against the test server with in-memory database.

#### Authentication Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-001 | POST /api/auth/register with valid data | 200 OK + JWT | ☐ |
| API-002 | POST /api/auth/register duplicate email | 400 Bad Request | ☐ |
| API-003 | POST /api/auth/login valid credentials | 200 OK + JWT | ☐ |
| API-004 | POST /api/auth/login invalid password | 401 Unauthorized | ☐ |
| API-005 | GET /api/auth/me with valid JWT | 200 OK + user | ☐ |
| API-006 | GET /api/auth/me without JWT | 401 Unauthorized | ☐ |
| API-007 | GET /api/auth/me with expired JWT | 401 Unauthorized | ☐ |
| API-008 | GET /api/auth/me/profile returns deviceIds | 200 OK + deviceIds array | ☐ |

#### Device Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-010 | GET /api/devices (no devices) | 200 OK + empty array | ☐ |
| API-011 | POST /api/devices creates device | 201 Created | ☐ |
| API-012 | GET /api/devices returns user's devices | 200 OK + device list | ☐ |
| API-013 | GET /api/devices/{id} (own device) | 200 OK + device | ☐ |
| API-014 | GET /api/devices/{id} (other user's) | 404 Not Found | ☐ |
| API-015 | PATCH /api/devices/{id}/pause | 200 OK + status=Paused | ☐ |
| API-016 | PATCH /api/devices/{id}/resume | 200 OK + status=Active | ☐ |

#### Container Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-020 | POST /api/devices/{id}/containers | 201 Created | ☐ |
| API-021 | GET /api/devices/{id}/containers | 200 OK + container list | ☐ |
| API-022 | PUT /api/containers/{id} updates | 200 OK + updated container | ☐ |
| API-023 | DELETE /api/containers/{id} (no schedules) | 204 No Content | ☐ |
| API-024 | DELETE /api/containers/{id} (with schedules) | 400/409 Conflict | ☐ |

#### Schedule Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-030 | POST /api/containers/{id}/schedules | 201 Created | ☐ |
| API-031 | GET /api/containers/{id}/schedules | 200 OK + schedule list | ☐ |
| API-032 | PUT /api/schedules/{id} updates | 200 OK + updated schedule | ☐ |
| API-033 | DELETE /api/schedules/{id} | 204 No Content | ☐ |
| API-034 | GET /api/devices/{id}/today-schedule | 200 OK + today items | ☐ |

#### Dispensing Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-040 | POST /api/devices/{id}/dispense | 200 OK + event | ☐ |
| API-041 | POST /api/dispense-events/{id}/confirm | 200 OK + confirmed | ☐ |
| API-042 | POST /api/dispense-events/{id}/delay | 200 OK + delayed | ☐ |
| API-043 | GET /api/devices/{id}/events | 200 OK + history | ☐ |
| API-044 | GET /api/devices/{id}/events with date filter | Filtered results | ☐ |

#### Device API (Firmware Endpoints)

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-050 | POST /api/v1/devices/register | 200 OK + token | ☐ |
| API-051 | POST /api/v1/devices/{id}/heartbeat | 200 OK + commands | ☐ |
| API-052 | GET /api/v1/devices/{id}/schedule | 200 OK + schedules | ☐ |
| API-053 | POST /api/v1/events (DOSE_DISPENSED) | 202 Accepted | ☐ |
| API-054 | POST /api/v1/events (DOSE_TAKEN) | 202 Accepted | ☐ |
| API-055 | POST /api/v1/events (DOSE_MISSED) | 202 Accepted | ☐ |
| API-056 | POST /api/v1/events (unknown type) | 400 Bad Request | ☐ |
| API-057 | GET /api/v1/devices/{id}/firmware | 200 OK + update info | ☐ |

#### Webhook & Integration Endpoints

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| API-060 | POST /api/integrations/webhooks | 201 Created | ☐ |
| API-061 | GET /api/integrations/webhooks | 200 OK + list | ☐ |
| API-062 | DELETE /api/integrations/webhooks/{id} | 204 No Content | ☐ |
| API-063 | POST /api/integrations/devices/{id}/api-keys | 200 OK + key | ☐ |
| API-064 | POST /api/webhooks/incoming with valid key | 202 Accepted | ☐ |
| API-065 | POST /api/webhooks/incoming without key | 401 Unauthorized | ☐ |
| API-066 | POST /api/integrations/sync with valid key | 202 Accepted | ☐ |

### 14.5 Running Backend Tests

```bash
# Run all tests
cd backend
dotnet test

# Run specific test project
dotnet test tests/Application.Tests/

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run with verbose output
dotnet test --verbosity detailed
```

### 14.6 Test Coverage Targets

| Layer | Target Coverage | Priority |
|:------|:---------------|:---------|
| Domain entities | 90%+ | High |
| Application handlers | 85%+ | High |
| API controllers | 80%+ | High |
| Infrastructure | 70%+ | Medium |
| Middleware | 75%+ | Medium |

---

## 15. Mobile App Testing (React Native / Expo)

### 15.1 Testing Framework

| Tool | Purpose |
|:-----|:--------|
| **Jest** | Test runner and assertions |
| **React Native Testing Library** | Component testing |
| **MSW (Mock Service Worker)** | API mocking |
| **Detox** | E2E testing (optional) |

### 15.2 Component Tests

| Test ID | Screen | Test | Expected Result | Status |
|:--------|:-------|:-----|:----------------|:------:|
| MOB-001 | Login | Renders email and password fields | Fields visible | ☐ |
| MOB-002 | Login | Shows error on invalid credentials | Error message displayed | ☐ |
| MOB-003 | Login | Navigates to home on success | Home screen shown | ☐ |
| MOB-004 | Register | Validates required fields | Validation errors shown | ☐ |
| MOB-005 | Home | Displays today's schedule | Schedule items listed | ☐ |
| MOB-006 | Home | Shows device selection | Device picker visible | ☐ |
| MOB-007 | Home | Confirm dose button works | API called, status updated | ☐ |
| MOB-008 | Devices | Lists user's devices | Device cards shown | ☐ |
| MOB-009 | Devices | Pause/resume toggle works | Status changes | ☐ |
| MOB-010 | History | Shows dispense history | History items listed | ☐ |
| MOB-011 | Notifications | Lists notifications | Notification items shown | ☐ |
| MOB-012 | Notifications | Mark as read works | isRead updated | ☐ |
| MOB-013 | Dose Detail | Shows dose details | Medication info displayed | ☐ |
| MOB-014 | Dose Detail | Confirm intake works | Status = Confirmed | ☐ |
| MOB-015 | Dose Detail | Delay button works | Status = Delayed | ☐ |

### 15.3 API Integration Tests

| Test ID | Test | Expected Result | Status |
|:--------|:-----|:----------------|:------:|
| MOB-020 | Auth token stored after login | Token in context | ☐ |
| MOB-021 | 401 response clears token | Token cleared, redirect to login | ☐ |
| MOB-022 | API calls include Bearer header | Authorization header present | ☐ |
| MOB-023 | Offline mode shows cached data | Last fetched data displayed | ☐ |
| MOB-024 | Push notification received | Notification shown | ☐ |

### 15.4 Running Mobile Tests

```bash
cd mobile
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
```

---

## 16. Web Portal Testing (React + Vite)

### 16.1 Testing Framework

| Tool | Purpose |
|:-----|:--------|
| **Vitest** | Test runner (Vite-native) |
| **React Testing Library** | Component testing |
| **MSW** | API mocking |
| **Playwright** | E2E testing (optional) |

### 16.2 Component Tests

| Test ID | Screen | Test | Expected Result | Status |
|:--------|:-------|:-----|:----------------|:------:|
| WEB-001 | Login | Renders login form | Email + password fields | ☐ |
| WEB-002 | Login | Shows error on 401 | Error message displayed | ☐ |
| WEB-003 | Login | Stores token in localStorage | Token saved | ☐ |
| WEB-004 | Register | Validates all fields | Validation errors shown | ☐ |
| WEB-005 | Dashboard | Shows device overview | Device cards rendered | ☐ |
| WEB-006 | Dashboard | Shows today's schedule | Schedule timeline | ☐ |
| WEB-007 | Dashboard | Shows adherence stats | Percentage displayed | ☐ |
| WEB-008 | Devices | Lists all devices | Device grid shown | ☐ |
| WEB-009 | Devices | Create device modal | Form submits, device added | ☐ |
| WEB-010 | Device Detail | Shows containers | Container list rendered | ☐ |
| WEB-011 | Containers | Add medication slot | Container created | ☐ |
| WEB-012 | Containers | Update quantity | Quantity updated | ☐ |
| WEB-013 | Schedules | List schedules for container | Schedule items shown | ☐ |
| WEB-014 | Schedules | Create schedule | Schedule added | ☐ |
| WEB-015 | Schedules | Edit schedule | Schedule updated | ☐ |
| WEB-016 | History | Shows dispense events | Event timeline shown | ☐ |
| WEB-017 | History | Date filter works | Filtered results | ☐ |
| WEB-018 | Notifications | Lists notifications | Items shown | ☐ |
| WEB-019 | Notifications | Mark as read | Status updated | ☐ |
| WEB-020 | Travel | Start travel session | Session created | ☐ |
| WEB-021 | Travel | End travel session | Session ended | ☐ |
| WEB-022 | Integrations | Create webhook | Webhook added | ☐ |
| WEB-023 | Integrations | Create API key | Key generated | ☐ |

### 16.3 Running Web Tests

```bash
cd web
npm test                    # Run all tests
npm run test:watch          # Watch mode  
npm run test:coverage       # With coverage
npm run test:e2e            # E2E tests (Playwright)
```

---

## 17. End-to-End (E2E) Testing

### 17.1 Critical User Flows

| Test ID | Flow | Steps | Expected Result | Status |
|:--------|:-----|:------|:----------------|:------:|
| E2E-001 | Patient registration | Register → Login → See dashboard | Dashboard shown | ☐ |
| E2E-002 | Device setup | Add device → Add container → Add schedule | Schedule active | ☐ |
| E2E-003 | Dose lifecycle | Schedule dose → Dispense → Confirm | History shows Confirmed | ☐ |
| E2E-004 | Missed dose | Schedule dose → Wait 30min → Check | Status = Missed, notification | ☐ |
| E2E-005 | Low stock alert | Set quantity low → Trigger check | Notification created | ☐ |
| E2E-006 | Travel mode | Start travel → Check portable → End | Session completed | ☐ |
| E2E-007 | Caregiver access | Caregiver logs in → Sees patient data | Patient schedule visible | ☐ |
| E2E-008 | Device heartbeat | Device sends heartbeat → Check portal | Last heartbeat updated | ☐ |
| E2E-009 | Webhook delivery | Configure webhook → Trigger event | Webhook POST sent | ☐ |

### 17.2 Performance Testing

| Test ID | Test | Threshold | Method |
|:--------|:-----|:----------|:-------|
| PERF-001 | API response time (GET /devices) | < 200ms | k6 / Artillery |
| PERF-002 | API response time (POST /events) | < 500ms | k6 / Artillery |
| PERF-003 | Concurrent users (100) | < 1s p95 | k6 / Artillery |
| PERF-004 | Database query performance | < 100ms | SQL profiling |
| PERF-005 | Mobile app cold start | < 3s | Manual / Detox |
| PERF-006 | Web portal initial load | < 2s | Lighthouse |
| PERF-007 | Web portal LCP | < 2.5s | Lighthouse |

---

## 18. Continuous Integration

### 18.1 CI Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   git push   │────▶│  CI Server   │────▶│  Deploy      │
│              │     │  (GitHub     │     │  (Staging)   │
│              │     │   Actions)   │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌────────────┐ ┌──────────┐ ┌────────────┐
       │ Backend    │ │ Mobile   │ │ Web        │
       │ Tests      │ │ Tests    │ │ Tests      │
       │ (dotnet    │ │ (npm     │ │ (npm test) │
       │  test)     │ │  test)   │ │            │
       └────────────┘ └──────────┘ └────────────┘
```

### 18.2 CI Checks Per PR

| Check | Tool | Blocking |
|:------|:-----|:--------:|
| Backend unit tests | `dotnet test` | Yes |
| Backend lint | `dotnet format --verify-no-changes` | Yes |
| Mobile tests | `npm test` | Yes |
| Web tests | `npm test` | Yes |
| Type checking | `tsc --noEmit` | Yes |
| Lint (ESLint) | `npm run lint` | Yes |
| Build succeeds | `dotnet build` / `npm run build` | Yes |
| Docker build | `docker compose build` | No |

---

## 19. Test Sign-Off (Software)

| Role | Name | Signature | Date |
|:-----|:-----|:----------|:-----|
| Backend Engineer | | | |
| Mobile Engineer | | | |
| Frontend Engineer | | | |
| QA Engineer | | | |

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Complete expansion with all test categories, regulatory requirements |
| 3.0 | Feb 2026 | Added comprehensive software testing (API, mobile, web, E2E, CI) |