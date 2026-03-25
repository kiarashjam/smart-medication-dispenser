# Device Specifications — Complete Hardware Reference

**Smart Medication Dispenser — Everything You Need to Know About the Hardware**

**Designed in Lausanne, Switzerland**

**Version 3.0 | February 2026 | Confidential**

---

## Document Information

| | |
|:--|:--|
| Version | 3.0 |
| Last Updated | February 2026 |
| Classification | Confidential — Engineering & Investors |
| Audience | Engineers, Investors, Regulatory, Partners |
| Related Docs | `01_DEVICE_HARDWARE.md`, `07_COMPONENT_SELECTION_GUIDE.md`, `08_FIRMWARE_GUIDE.md` |

---

## Table of Contents

| # | Section |
|:-:|:--------|
| 1 | [Product Family Overview](#1-product-family-overview) |
| 2 | [How It Works — End-to-End](#2-how-it-works--end-to-end) |
| 3 | [SMD-100 Home Device — Deep Dive](#3-smd-100-home-device--deep-dive) |
| 4 | [SMD-200 Travel Device — Deep Dive](#4-smd-200-travel-device--deep-dive) |
| 5 | [Brain of the Device — ESP32-S3 MCU](#5-brain-of-the-device--esp32-s3-mcu) |
| 6 | [Power System — How It Stays Alive](#6-power-system--how-it-stays-alive) |
| 7 | [Dispensing Mechanism — How Pills Come Out](#7-dispensing-mechanism--how-pills-come-out) |
| 8 | [Sensors — How It Sees and Feels](#8-sensors--how-it-sees-and-feels) |
| 9 | [Display & User Interface](#9-display--user-interface) |
| 10 | [Audio System — Alerts & Voice](#10-audio-system--alerts--voice) |
| 11 | [Connectivity — WiFi, Cellular, Bluetooth](#11-connectivity--wifi-cellular-bluetooth) |
| 12 | [Cloud Communication — API & Events](#12-cloud-communication--api--events) |
| 13 | [Firmware Architecture & Code](#13-firmware-architecture--code) |
| 14 | [Security & Encryption](#14-security--encryption) |
| 15 | [Bill of Materials & Costs](#15-bill-of-materials--costs) |
| 16 | [PCB Design & Manufacturing](#16-pcb-design--manufacturing) |
| 17 | [Enclosure & Industrial Design](#17-enclosure--industrial-design) |
| 18 | [Regulatory & Compliance](#18-regulatory--compliance) |
| 19 | [Testing & Quality Assurance](#19-testing--quality-assurance) |
| 20 | [Prototyping Roadmap](#20-prototyping-roadmap) |

---

## 1. Product Family Overview

### 1.1 Two Devices, One Ecosystem

We build **two physical devices** that work together seamlessly as part of a connected medication management ecosystem:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SMART MEDICATION DISPENSER ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐                      ┌──────────────────┐            │
│   │   SMD-100 HOME   │     ◀── WiFi ──▶     │  CLOUD PLATFORM  │            │
│   │   10 med slots   │                      │  Swiss-hosted    │            │
│   │   Countertop     │                      │  (Azure Zurich)  │            │
│   └──────────────────┘                      └────────┬─────────┘            │
│                                                      │                      │
│   ┌──────────────────┐                               │                      │
│   │   SMD-200 TRAVEL │     ◀── LTE/WiFi ──▶         │                      │
│   │   4 med slots    │                               │                      │
│   │   Portable       │                               │                      │
│   └──────────────────┘                               │                      │
│                                                      │                      │
│            ┌─────────────────────┬───────────────────┤                      │
│            │                     │                   │                      │
│     ┌──────┴──────┐    ┌────────┴───────┐   ┌──────┴──────┐               │
│     │ MOBILE APP  │    │  WEB PORTAL    │   │ CAREGIVER   │               │
│     │ iOS/Android │    │  Dashboard     │   │   ALERTS    │               │
│     └─────────────┘    └────────────────┘   └─────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Specifications at a Glance

| Specification | SMD-100 (Home) | SMD-200 (Travel) |
|:--------------|:---------------|:-----------------|
| **Use Case** | Daily home use, countertop | Travel, portable |
| **Dimensions** | 305 × 203 × 254 mm (12" × 8" × 10") | 152 × 102 × 76 mm (6" × 4" × 3") |
| **Weight** | 1.6 kg (empty) | 360 g (empty) |
| **Medication Slots** | 10 | 4 |
| **Capacity/Slot** | 30 pills (90 days @ 1/day) | 14 pills (14 days @ 1/day) |
| **Max Pill Diameter** | 20 mm | 15 mm |
| **Display** | 4.3" TFT 800×480 capacitive touch | 2.4" OLED 128×64 |
| **Primary Power** | 12V DC adapter (Swiss Type J plug) | USB-C rechargeable |
| **Battery Backup** | 48 hours (2× 18650 Li-ion, 5000mAh) | 7 days primary (Li-Po 3000mAh) |
| **WiFi** | 802.11 b/g/n (2.4 GHz & 5 GHz) | 802.11 b/g/n (2.4 GHz) |
| **Bluetooth** | BLE 5.0 | BLE 5.0 |
| **Cellular** | — | LTE Cat-M1/NB-IoT (SIM7080G) |
| **GPS** | — | Yes (via SIM7080G GNSS) |
| **Audio** | 3.2W speaker, voice prompts | Buzzer + vibration motor |
| **Languages** | FR, DE, IT, EN | FR, DE, IT, EN |
| **Operating Temp** | 10–35°C | 0–40°C |
| **Storage Temp** | -10–50°C | -20–60°C |
| **IP Rating** | IP22 (splash resistant) | IP44 (travel protected) |
| **Certifications** | CE Class IIa, Swissmedic, RoHS, FCC | CE Class IIa, Swissmedic, RoHS, FCC |

---

## 2. How It Works — End-to-End

### 2.1 The Complete Flow

Here's what happens every time a patient needs their medication, from start to finish:

```
 TIME TO TAKE MEDS!
       │
       ▼
┌──────────────────┐
│ 1. SCHEDULE CHECK │  The device checks its internal clock against the
│    (Every second) │  medication schedule stored in flash memory.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. ALERT PATIENT  │  Audio alert plays through speaker (voice prompt
│    (Multi-modal)  │  in patient's language). Display shows medication
│                   │  name & dosage. LED strip glows. Push notification
│                   │  sent to patient's phone.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. CAROUSEL MOVES │  28BYJ-48 stepper motor rotates carousel to the
│    (500ms)        │  correct medication slot. Hall effect sensor
│                   │  (A3144) confirms exact position.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. GATE OPENS     │  SG90 servo motor opens the dispensing gate.
│    (200ms)        │  Gravity feeds pills down the chute.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. PILL COUNTING  │  TCPT1300 infrared optical sensor counts each
│    (<5 seconds)   │  pill as it passes through. Counts rising edges
│                   │  (IR beam breaks). Stops when target count reached.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 6. GATE CLOSES    │  Servo returns to closed position.
│    (200ms)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 7. WEIGHT CHECK   │  HX711 24-bit ADC reads the 1kg load cell under
│    (1 second)     │  the output tray. Verifies dispensed weight matches
│                   │  expected weight (±tolerance). Dual verification.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 8. EVENT SENT     │  DOSE_DISPENSED event sent to cloud API via WiFi
│    (Immediate)    │  (or stored locally if offline). Contains: slot,
│                   │  medication name, pill count, timestamp, weight.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 9. PATIENT TAKES  │  Load cell detects weight removal = pills taken.
│    (Monitoring)   │  DOSE_TAKEN event sent. If pills remain after
│                   │  30 minutes → DOSE_MISSED event + caregiver alert.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 10. CLOUD SYNCS   │  API saves event → notifies mobile app →
│     (Real-time)   │  updates web portal → sends caregiver alert
│                   │  if needed (email, push, SMS).
└──────────────────┘
```

### 2.2 Events the Device Sends

| Event | When It Fires | Data Included |
|:------|:-------------|:--------------|
| `DOSE_DISPENSED` | Pills drop to output tray | slot, medication, pill_count, weight_g, timestamp |
| `DOSE_TAKEN` | Weight removed from tray | slot, medication, pill_count, taken_at |
| `DOSE_MISSED` | 30 min past scheduled time | slot, medication, scheduled_at |
| `REFILL_NEEDED` | Less than 7 days supply left | slot, medication, pills_remaining, days_remaining |
| `REFILL_EMPTY` | Slot completely empty | slot, medication |
| `DEVICE_ONLINE` | Device connects to network | firmware_version, battery_level, wifi_signal |
| `DEVICE_OFFLINE` | Connection lost (detected server-side) | last_seen_at |
| `DEVICE_ERROR` | Hardware or software fault | error_code, error_message, component |
| `DOOR_OPENED` | Enclosure door opened | opened_at |
| `DOOR_CLOSED` | Enclosure door closed | closed_at |
| `JAM_DETECTED` | Pill jam in dispensing chute | slot, attempted_count, actual_count |
| `TEMPERATURE_ALERT` | Out of safe range (10–35°C) | temperature_c, humidity_pct |
| `BATTERY_LOW` | Below 20% charge | battery_level, estimated_hours |
| `TRAVEL_MODE_ON` | Switched to travel mode | transferred_slots |
| `TRAVEL_MODE_OFF` | Returned from travel mode | reconciled_doses |

### 2.3 Event Format (JSON)

**Dose Dispensed:**

```json
{
  "event": "DOSE_DISPENSED",
  "device_id": "SMD-100-CH-001234",
  "timestamp": "2026-02-10T08:00:00Z",
  "data": {
    "slot": 3,
    "medication": "Metformin 500mg",
    "scheduled_count": 2,
    "dispensed_count": 2,
    "weight_grams": 1.24,
    "expected_weight_grams": 1.20,
    "verification": "PASSED"
  }
}
```

**Heartbeat (every 60 seconds):**

```json
{
  "device_id": "SMD-100-CH-001234",
  "timestamp": "2026-02-10T08:01:00Z",
  "battery_level": 85,
  "charging": true,
  "wifi_rssi": -55,
  "firmware_version": "1.2.0",
  "temperature_c": 22.5,
  "humidity_pct": 45,
  "uptime_seconds": 345600,
  "slots": [
    {"slot": 1, "medication": "Aspirin 100mg", "pills_remaining": 45, "days_remaining": 45},
    {"slot": 2, "medication": "Lisinopril 10mg", "pills_remaining": 30, "days_remaining": 30},
    {"slot": 3, "medication": "Metformin 500mg", "pills_remaining": 28, "days_remaining": 14},
    {"slot": 4, "medication": null, "pills_remaining": 0, "days_remaining": 0}
  ]
}
```

---

## 3. SMD-100 Home Device — Deep Dive

### 3.1 System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMD-100 HOME DEVICE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │   AC ADAPTER    │     │  POWER MGMT     │     │    BATTERY      │        │
│  │   100-240V AC   │     │  BQ24195 +      │◀───▶│   2× 18650      │        │
│  │   → 12V/2A DC   │────▶│  TPS62150       │     │   7.4V 5000mAh  │        │
│  │   Type J (CH)   │     │  AP2112K        │     │   48h backup     │        │
│  └─────────────────┘     └────────┬────────┘     └─────────────────┘        │
│                                   │                                          │
│                          ┌────────┴────────┐                                │
│                          │   3.3V / 5V     │                                │
│                          │   Power Rails   │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│  ┌───────────────────────────────┼───────────────────────────────┐          │
│  │                               ▼                               │          │
│  │                    ┌─────────────────────┐                    │          │
│  │                    │   ESP32-S3-WROOM-1  │                    │          │
│  │                    │   N16R8             │                    │          │
│  │                    │   Dual-core 240MHz  │                    │          │
│  │                    │   512KB SRAM        │                    │          │
│  │                    │   16MB Flash        │                    │          │
│  │                    │   8MB PSRAM         │                    │          │
│  │                    │   WiFi 2.4/5 GHz   │                    │          │
│  │                    │   BLE 5.0           │                    │          │
│  │                    │   HW Crypto (AES)   │                    │          │
│  │                    └──────────┬──────────┘                    │          │
│  │                               │                               │          │
│  │    ┌──────────────┬──────────┼──────────┬──────────────┐     │          │
│  │    ▼              ▼          ▼          ▼              ▼     │          │
│  │ ┌──────┐    ┌──────────┐ ┌──────┐  ┌──────────┐  ┌───────┐  │          │
│  │ │DISP  │    │  MOTORS  │ │SENSOR│  │  AUDIO   │  │STORAGE│  │          │
│  │ │4.3"  │    │ 10×28BYJ │ │ HUB  │  │MAX98357A │  │SD Card│  │          │
│  │ │TFT   │    │ 1×SG90   │ │      │  │ 3.2W Spk │  │16GB   │  │          │
│  │ │Touch  │    │ ULN2003A │ │      │  │ I2S Bus  │  │       │  │          │
│  │ │GT911  │    │ MCP23017 │ │      │  │          │  │       │  │          │
│  │ └──────┘    └──────────┘ └──────┘  └──────────┘  └───────┘  │          │
│  │                                                              │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│  SENSOR HUB DETAIL:                                                         │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │  • 10× Optical Pill Counters — TCPT1300X01 (Vishay)          │          │
│  │       Infrared transmissive sensor, 3mm gap, counts pills    │          │
│  │                                                               │          │
│  │  • 10× Hall Effect Position Sensors — A3144 (Allegro)        │          │
│  │       Detects carousel position via magnets on gear teeth     │          │
│  │                                                               │          │
│  │  • 1× Load Cell — TAL220 1kg + HX711 24-bit ADC             │          │
│  │       Weighs dispensed pills for double-verification          │          │
│  │       Resolution: 0.1 gram                                    │          │
│  │                                                               │          │
│  │  • 1× Temperature/Humidity — SHT40-AD1B (Sensirion)          │          │
│  │       Monitors medication storage conditions                  │          │
│  │       Accuracy: ±0.2°C, ±1.8% RH                             │          │
│  │                                                               │          │
│  │  • 1× PIR Motion Sensor — AM312 (Mini, 10mm)                 │          │
│  │       Detects patient approach, wakes display                 │          │
│  │       Range: 3-5m, ultra-low power 20µA                       │          │
│  │                                                               │          │
│  │  • 1× Reed Switch + Magnet (Door/Tray sensor)                │          │
│  │       Detects if enclosure is opened or tray removed          │          │
│  │                                                               │          │
│  │  • 1× Ambient Light Sensor — BH1750FVI (ROHM)               │          │
│  │       Auto-adjusts display brightness based on room light     │          │
│  │       Range: 1-65535 lux, I2C bus                             │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Physical Design

```
    FRONT VIEW:                              REAR VIEW:
    ┌────────────────────────────┐           ┌────────────────────────────┐
    │  ┌──────────────────────┐  │           │                            │
    │  │                      │  │           │  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │
    │  │     4.3" Display     │  │           │       (Ventilation)        │
    │  │     Capacitive Touch │  │           │                            │
    │  │     800 × 480 px     │  │           │  ┌──────┐ ┌────┐ ┌─────┐  │
    │  │                      │  │           │  │DC 12V│ │USB │ │Reset│  │
    │  └──────────────────────┘  │           │  │Barrel│ │Mini│ │ Btn │  │
    │                            │           │  └──────┘ └────┘ └─────┘  │
    │  🔴  🟢  🔵  (Status LEDs) │           │                            │
    │                            │           └────────────────────────────┘
    │  ┌──────────────────────┐  │
    │  │    OUTPUT TRAY       │  │           TOP VIEW:
    │  │    (Pull-out, with   │  │           ┌────────────────────────────┐
    │  │     load cell)       │  │           │  ┌──┐┌──┐┌──┐┌──┐┌──┐    │
    │  └──────────────────────┘  │           │  │S1││S2││S3││S4││S5│    │
    │                            │           │  └──┘└──┘└──┘└──┘└──┘    │
    └────────────────────────────┘           │  ┌──┐┌──┐┌──┐┌──┐┌──┐    │
                                             │  │S6││S7││S8││S9││10│    │
    305mm wide × 254mm tall × 203mm deep     │  └──┘└──┘└──┘└──┘└──┘    │
    Weight: 1.6 kg                           │    (10 Medication Slots)  │
                                             └────────────────────────────┘
```

### 3.3 Key Features Explained

| Feature | What It Does | Why It Matters |
|:--------|:-------------|:---------------|
| **10 medication slots** | Each holds 30 pills (90 days at 1/day) | Handles complex regimens (polypharmacy) |
| **Dual verification** | Optical count + weight check | 99.9% accuracy, catches jams/errors |
| **48-hour battery backup** | Keeps working during power outages | Swiss homes occasionally lose power |
| **Voice prompts (4 languages)** | FR, DE, IT, EN audio alerts | Serves all Swiss language regions |
| **Auto-brightness display** | Adjusts to room lighting | Easy to read day/night for elderly |
| **Motion-wake screen** | PIR sensor detects approach | No need to touch — just walk up |
| **Temperature monitoring** | Alerts if storage temp unsafe | Some medications are heat-sensitive |
| **Caregiver alerts** | Escalation if dose missed | Peace of mind for remote family |
| **Offline operation** | Stores up to 1000 events locally | Works without internet for days |
| **OTA firmware updates** | Updates over WiFi automatically | No service visits needed |

---

## 4. SMD-200 Travel Device — Deep Dive

### 4.1 System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SMD-200 TRAVEL DEVICE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌────────────────┐     ┌───────────────┐            │
│  │ Li-Po Battery │     │  ESP32-S3-MINI │     │   SIM7080G    │            │
│  │ 3.7V 3000mAh  │────▶│  Single-core   │────▶│   LTE Cat-M1  │            │
│  │ + PCM (BMS)   │     │  160MHz        │     │   NB-IoT      │            │
│  │ 7 day life    │     │  4MB Flash     │     │   GNSS (GPS)  │            │
│  └───────────────┘     │  2MB PSRAM     │     │   50+ countries│            │
│        │               └────────┬───────┘     └───────────────┘            │
│        │ USB-C                  │                                           │
│        ▼ (5V/2A)               │                                           │
│  ┌───────────────┐              │                                           │
│  │ TP4056 Charge │              │                                           │
│  │ IC + DW01     │              │                                           │
│  │ Protection    │              │                                           │
│  └───────────────┘              │                                           │
│                                 │                                           │
│      ┌──────────────────────────┼──────────────────────────┐               │
│      │                          │                          │               │
│      ▼                          ▼                          ▼               │
│ ┌──────────┐            ┌──────────────┐           ┌──────────────┐        │
│ │ 2.4"OLED │            │ 4× SG90      │           │ Sensors      │        │
│ │ SSD1306  │            │ Micro Servos │           │ • 4× Optical │        │
│ │ 128×64   │            │ Gate control │           │ • Buzzer     │        │
│ │ I2C Bus  │            │              │           │ • Vibration  │        │
│ └──────────┘            └──────────────┘           │ • 2× Buttons │        │
│                                                    └──────────────┘        │
│                                                                              │
│  CONNECTIVITY:                                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │  • WiFi 2.4 GHz — Home/hotel networks                       │          │
│  │  • BLE 5.0 — Sync with phone app                            │          │
│  │  • LTE Cat-M1 — 19 EU frequency bands                       │          │
│  │       B1/B3/B5/B8/B12/B13/B14/B18/B19/B20/B25/B26/B27      │          │
│  │       B28/B66/B71/B85 — works in 50+ countries              │          │
│  │  • NB-IoT — Ultra-low-power fallback                        │          │
│  │  • GNSS — GPS/GLONASS/Galileo/BeiDou for location           │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Travel Mode — How It Works

```
HOME DEVICE                                    TRAVEL DEVICE
┌─────────────────┐                            ┌─────────────────┐
│                 │  1. USER TAPS              │                 │
│  "Activate      │  "TRAVEL MODE"             │  Waiting for    │
│   Travel Mode"  │ ─────────────────────────▶ │  transfer...    │
│                 │                            │                 │
│  2. Transfers   │  BLE Pairing               │  3. Receives    │
│  medication     │ ◀────────────────────────▶ │  schedule for   │
│  schedule for   │  Schedule + Med Data       │  selected       │
│  selected slots │                            │  medications    │
│                 │                            │                 │
│  4. Home device │                            │  5. Travel      │
│  pauses those   │                            │  device now     │
│  slots          │                            │  active!        │
└─────────────────┘                            └─────────────────┘

WHILE TRAVELING:
┌─────────────────────────────────────────────────────────────────┐
│  • Device operates independently for up to 14 days             │
│  • Uses LTE Cat-M1 for cloud sync (if available)              │
│  • Stores events offline if no signal (up to 1000 events)     │
│  • GPS tracks location (privacy: only with user consent)       │
│  • Battery lasts 7 days with normal use                        │
│  • Buzzer + vibration alerts (no speaker to save battery)      │
└─────────────────────────────────────────────────────────────────┘

RETURNING HOME:
┌─────────────────┐                            ┌─────────────────┐
│                 │  6. USER DEACTIVATES       │                 │
│  Home device    │  TRAVEL MODE               │  "Sync &        │
│  resumes all    │ ◀────────────────────────▶ │   Return"       │
│  slots          │  BLE Sync                  │                 │
│                 │                            │  7. Sends all   │
│  8. Reconciles  │  Travel logs +             │  offline events │
│  all doses      │  remaining inventory       │  to cloud       │
│  during travel  │                            │                 │
└─────────────────┘                            └─────────────────┘
```

### 4.3 Cellular Connectivity Details (SIM7080G)

| Specification | Detail |
|:-------------|:-------|
| **Module** | SIMCom SIM7080G |
| **Networks** | LTE Cat-M1, Cat-NB1, NB-IoT |
| **EU Bands** | B1/B3/B5/B8/B20/B28 (primary), B12/B13/B14/B18/B19/B25/B26/B27/B66/B71/B85 |
| **Data Rate** | 589 kbps down / 1119 kbps up (Cat-M1) |
| **GNSS** | GPS, GLONASS, BeiDou, Galileo |
| **Interface** | UART to ESP32 (115200 baud, AT commands) |
| **Voltage** | 2.7–4.8V (direct from Li-Po) |
| **Idle Current** | 7 mA |
| **TX Current** | 400 mA peak |
| **Package** | LCC+LGA (17.6 × 15.7 × 2.4 mm) |
| **Certifications** | CE/RED, FCC, GCF, AT&T, Verizon, T-Mobile |
| **Protocols** | TCP/UDP, HTTP/S, MQTT, CoAP, TLS/DTLS, LWM2M |
| **SIM** | Nano SIM (we use 1NCE IoT SIM: €10 for 10 years / 500MB) |

---

## 5. Brain of the Device — ESP32-S3 MCU

### 5.1 Why We Chose the ESP32-S3

The ESP32-S3 is the central microcontroller (MCU) — the "brain" — of both devices. We chose it after evaluating 4 options:

| Criteria | ESP32-S3 (Chosen) | STM32F407 + ESP32-C3 | nRF52840 + ESP32-C3 | Raspberry Pi Pico W |
|:---------|:-------------------|:---------------------|:---------------------|:--------------------|
| **Price** | $5.50 (single chip) | $8.50 (two chips) | $14 (two chips) | $4 |
| **WiFi + BLE** | Built-in | Separate module | Separate module | Built-in (basic) |
| **CPU** | Dual-core 240MHz | 168MHz | 64MHz | Dual-core 133MHz |
| **RAM** | 512KB + 8MB PSRAM | 192KB | 256KB | 264KB |
| **Flash** | 16MB | 1MB (needs external) | 1MB | 2MB |
| **Display Support** | Native LCD controller | FSMC | No native | No native |
| **Hardware Crypto** | AES, SHA, RSA | AES, SHA | AES, ECB | None |
| **USB** | OTG (built-in) | OTG | No | Yes |
| **Deep Sleep** | 10µA | 2µA | 0.4µA | 0.18mA |
| **Medical Variants** | No | Yes (ISO 13485) | No | No |
| **Community** | Excellent | Good | Good | Excellent |
| **Verdict** | **Best balance** | Future if medical cert needed | Too complex | Too limited |

### 5.2 ESP32-S3-WROOM-1-N16R8 Specifications

| Parameter | Value |
|:----------|:------|
| **Chip** | ESP32-S3 (Xtensa LX7 dual-core) |
| **Module** | ESP32-S3-WROOM-1-N16R8 |
| **Clock** | Up to 240 MHz |
| **SRAM** | 512 KB |
| **Flash** | 16 MB (Quad SPI) |
| **PSRAM** | 8 MB (Octal SPI) |
| **GPIO** | 45 programmable pins |
| **ADC** | 20 channels, 12-bit |
| **PWM (LEDC)** | 8 channels |
| **SPI** | 4 interfaces |
| **I2C** | 2 interfaces |
| **I2S** | 2 interfaces (for audio) |
| **UART** | 3 interfaces |
| **USB** | OTG support (GPIO19/20) |
| **WiFi** | 802.11 b/g/n, 2.4 GHz |
| **Bluetooth** | BLE 5.0 |
| **Security** | AES-128/256, SHA, RSA, HMAC, Digital Signature |
| **Operating Voltage** | 3.0–3.6V (3.3V typical) |
| **Package** | 25.5 × 18.0 mm module |
| **Price** | $5.50 (1K qty from DigiKey) |

**Why 16MB Flash + 8MB PSRAM:**

```
Flash Memory Layout (16MB):
┌──────────────────────────────────────────────────────────────┐
│ Bootloader (64KB) │ Partition Table (8KB) │ NVS (24KB)       │
├──────────────────────────────────────────────────────────────┤
│ Factory Firmware (2MB) │ OTA Slot A (2MB) │ OTA Slot B (2MB) │
├──────────────────────────────────────────────────────────────┤
│ SPIFFS Storage (1.5MB — audio files, logs, offline events)   │
├──────────────────────────────────────────────────────────────┤
│ Free (8.4MB — room for growth)                               │
└──────────────────────────────────────────────────────────────┘

PSRAM Usage (8MB):
┌──────────────────────────────────────────────────────────────┐
│ Display Framebuffer #1 (800×480×2 = 768KB)                   │
├──────────────────────────────────────────────────────────────┤
│ Display Framebuffer #2 (768KB — double buffering)            │
├──────────────────────────────────────────────────────────────┤
│ LVGL Rendering Buffer (200KB)                                │
├──────────────────────────────────────────────────────────────┤
│ Audio Buffer (128KB — WAV playback)                          │
├──────────────────────────────────────────────────────────────┤
│ HTTP Response Buffer (64KB)                                  │
├──────────────────────────────────────────────────────────────┤
│ Offline Event Queue (512KB — ~1000 events)                   │
├──────────────────────────────────────────────────────────────┤
│ Free (5.6MB)                                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Power System — How It Stays Alive

### 6.1 Power Architecture

```
AC WALL OUTLET (100-240V)
       │
       ▼
┌──────────────────┐
│  AC/DC ADAPTER   │  Mean Well GST25E12-P1J
│  Input: 100-240V │  CHF 12 per unit
│  Output: 12V/2A  │  CE/UL/GS certified
│  24W, >85% eff.  │  Swiss Type J plug + EU adapter
│  5.5×2.1mm barrel│
└────────┬─────────┘
         │
         ▼ 12V DC
┌─────────────────────────────────────────────────────────┐
│  BQ24195 — POWER PATH CONTROLLER (Texas Instruments)    │
│                                                          │
│  What it does:                                           │
│  • Manages power from AC adapter AND battery             │
│  • Automatically switches between AC and battery         │
│  • Charges battery when AC is connected                  │
│  • Provides I2C status (battery %, charging state)       │
│  • Thermal management (reduces charge if hot)            │
│                                                          │
│  Key specs: Input 4.35-17V, Charge up to 2.1A           │
│             QFN-24 package (4×4mm), $3.50                │
│                                                          │
│  AC Connected → Powers system + charges battery          │
│  AC Lost → Seamlessly switches to battery (0ms delay)    │
└────┬───────────────────────────────────────┬────────────┘
     │ VSYS (4.5-12V)                       │ BAT (7.4V)
     │                                      │
     ▼                                      ▼
┌──────────────┐                    ┌──────────────────┐
│  TPS62150    │                    │  2× 18650 CELLS  │
│  Buck to 5V  │                    │  Samsung 25R      │
│  95% eff.    │                    │  2500mAh each     │
│  1A output   │                    │  Series (2S1P)    │
│  QFN-16      │                    │  = 7.4V, 5000mAh │
│  $1.80       │                    │  $8 total          │
└──────┬───────┘                    │                    │
       │ 5V                         │  Protected by:     │
       │                            │  • DW01A IC        │
       ├──────────────┐             │  • Overvoltage 8.4V│
       │              │             │  • Undervoltage 6V │
       ▼              ▼             │  • Overcurrent 5A  │
┌──────────┐   ┌──────────┐        │  • Short circuit   │
│ AP2112K  │   │ Direct   │        │  • Cell balancing   │
│ LDO 3.3V │   │ 5V rail  │        └──────────────────┘
│ 600mA    │   │          │
│ SOT-25   │   │ Motors   │
│ $0.25    │   │ Sensors  │
└────┬─────┘   │ Audio    │
     │         │ USB      │
     ▼         └──────────┘
  3.3V rail
  ESP32-S3
  Display logic
  SD card
```

### 6.2 Power Consumption Budget

| Component | Active (mA) | Sleep (mA) | Notes |
|:----------|------------:|-----------:|:------|
| ESP32-S3 | 240 | 0.01 | WiFi TX peak |
| Display (4.3" TFT) | 150 | 0 | Backlight at 50% |
| Motors (1 active) | 200 | 0 | During dispense only |
| All sensors | 20 | 5 | I2C polling |
| Audio amplifier | 300 | 0 | Peak during alert |
| LEDs, misc | 30 | 5 | Status indicators |
| **Total** | **940** | **10** | |

**Battery Life Calculation:**

```
Standby (screen off, WiFi connected):
  5000mAh ÷ 20mA = 250 hours ≈ 10 days

With 4 dispenses/day (each ~30 seconds active):
  Active time:  4 × 30s = 120s = 2 minutes/day
  Active power: 940mA × 2min/60 = 31.3 mAh/day
  Standby:      20mA × 23.97h = 479.4 mAh/day
  Total daily:  510.7 mAh/day
  Battery life: 5000 ÷ 510.7 ≈ 9.8 days

With screen waking (motion sensor), 10 min/day:
  Display:      150mA × 10min/60 = 25 mAh/day
  Adjusted:     535.7 mAh/day
  Battery life: 5000 ÷ 535.7 ≈ 9.3 days

✓ Easily meets 48-hour backup target
✓ Actually lasts ~4× longer than advertised
```

---

## 7. Dispensing Mechanism — How Pills Come Out

### 7.1 Mechanical Design

```
                    CAROUSEL TOP VIEW (10 Slots)

                         ┌─────┐
                     ┌───┤Slot1├───┐
                    ┌┤   └─────┘   ├┐
                   ┌┤│             │├┐
              Slot10│ │     ●     │ │Slot2
                   └┤│  Motor    │├┘
                    └┤  Shaft    ├┘
                     │ (28BYJ-48)│
                Slot9├─┐       ┌─┤Slot3
                     │ │       │ │
                     │ │   ▼   │ │         ← Output Chute
                Slot8├─┤ Gate  ├─┤Slot4
                     │ │(SG90) │ │
                     │ └───────┘ │
                Slot7├─┐       ┌─┤Slot5
                     └─┤ Slot6 ├─┘
                       └───────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Output Tray │
                    │ (Load Cell) │
                    │  TAL220 1kg │
                    └─────────────┘


                    SIDE VIEW (Cross Section)

                    ┌───────────────────┐
                    │    Pill Storage   │     Each slot holds
                    │    ○ ○ ○ ○ ○      │     up to 30 pills
                    │    ○ ○ ○ ○ ○      │     (max 20mm diameter)
                    │    ○ ○ ○ ○ ○      │
                    ├───────────────────┤
                    │ Gate (SG90 Servo) │◀── Opens: 90°→180°
                    │ Opens to release  │    Closes: 180°→0°
                    ├───────────────────┤
                    │ TCPT1300 Optical  │◀── IR beam across chute
                    │ Sensor (counts    │    Pill breaks beam = count
                    │ each pill)        │    Resolution: single pill
                    │     │             │
                    │     ▼             │
                    │ Output Chute      │    Gravity-fed
                    │     │             │
                    │     ▼             │
                    ├───────────────────┤
                    │ HX711 + Load Cell │◀── Weighs pills in tray
                    │ Output Tray       │    Resolution: 0.1g
                    └───────────────────┘
```

### 7.2 Motors Used

**Carousel Motor: 28BYJ-48 Stepper**

| Parameter | Value |
|:----------|:------|
| Type | 5-wire unipolar stepper |
| Voltage | 5V DC |
| Steps/Revolution | 2048 (half-step mode) |
| Step Angle | 0.088° (5.625°/64 gear ratio) |
| Holding Torque | 34.3 mN·m |
| Max Speed | 15 RPM |
| Noise | Very low (important for home use) |
| Weight | 30g |
| Price | $1.50–$2.00 |
| **Why chosen** | Cheap, quiet, precise, widely available |

**Gate Servo: SG90 Micro Servo**

| Parameter | Value |
|:----------|:------|
| Type | Micro servo, 180° rotation |
| Torque | 1.8 kg·cm @ 5V |
| Speed | 0.1 seconds per 60° |
| Control | PWM at 50Hz (1ms=0°, 1.5ms=90°, 2ms=180°) |
| Voltage | 4.8–6V |
| Price | $1.50–$2.00 |
| **Why chosen** | Tiny, fast, simple PWM control |

**Motor Driver: ULN2003A (Darlington Array)**

| Parameter | Value |
|:----------|:------|
| Channels | 7 Darlington pairs per IC |
| Output Current | 500mA per channel |
| Input | 3.3V or 5V logic compatible |
| Package | DIP-16 or SOIC-16 |
| Price | $0.30 |
| Quantity needed | 7 ICs (for 10 motors) |
| **Why chosen** | Perfect match for 28BYJ-48, built-in flyback diodes |

### 7.3 Dispensing Code (C / ESP-IDF)

Here is the actual dispensing function that runs on the ESP32-S3:

```c
/**
 * Dispense medication from a specific slot.
 * 
 * This is the core function that:
 * 1. Rotates the carousel to the correct slot
 * 2. Verifies position with Hall effect sensor
 * 3. Opens the gate servo
 * 4. Counts pills with optical sensor
 * 5. Closes the gate
 * 6. Verifies weight with load cell
 * 7. Sends event to cloud API
 * 
 * @param slot       Slot number (1-10)
 * @param pill_count Number of pills to dispense
 * @return ESP_OK on success, error code on failure
 */
esp_err_t dispense_medication(uint8_t slot, uint8_t pill_count) {
    ESP_LOGI("DISPENSE", "Starting: slot=%d, count=%d", slot, pill_count);
    
    // === STEP 1: Rotate carousel to target slot ===
    // Calculate shortest path (CW or CCW)
    esp_err_t ret = motor_move_to_slot(slot);
    if (ret != ESP_OK) {
        ESP_LOGE("DISPENSE", "Carousel rotation failed");
        send_event("DEVICE_ERROR", "carousel_rotation_failed");
        return ret;
    }
    vTaskDelay(pdMS_TO_TICKS(500));  // Settle time
    
    // === STEP 2: Verify position with Hall sensor ===
    if (!verify_carousel_position(slot)) {
        ESP_LOGE("DISPENSE", "Position verification failed for slot %d", slot);
        send_event("DEVICE_ERROR", "position_verification_failed");
        return ESP_ERR_INVALID_STATE;
    }
    
    // === STEP 3: Record tray weight before dispensing ===
    loadcell_reading_t before_weight;
    sensor_read_loadcell(&before_weight);
    
    // === STEP 4: Open gate servo ===
    motor_gate_open();  // Servo to 180° (open position)
    vTaskDelay(pdMS_TO_TICKS(200));  // Let gate fully open
    
    // === STEP 5: Count pills via optical sensor ===
    uint8_t counted = 0;
    uint32_t timeout = xTaskGetTickCount() + pdMS_TO_TICKS(5000);
    bool last_state = false;
    
    while (counted < pill_count && xTaskGetTickCount() < timeout) {
        bool current = sensor_read_optical(slot);  // Read IR sensor
        
        // Count on rising edge (pill passes through beam)
        if (current && !last_state) {
            counted++;
            ESP_LOGD("DISPENSE", "Pill %d/%d counted", counted, pill_count);
        }
        last_state = current;
        vTaskDelay(pdMS_TO_TICKS(10));  // 10ms debounce
    }
    
    // === STEP 6: Close gate ===
    motor_gate_close();  // Servo to 0° (closed position)
    vTaskDelay(pdMS_TO_TICKS(200));
    
    // === STEP 7: Verify with load cell ===
    vTaskDelay(pdMS_TO_TICKS(500));  // Let pills settle
    loadcell_reading_t after_weight;
    sensor_read_loadcell(&after_weight);
    
    float dispensed_weight = after_weight.weight_grams - before_weight.weight_grams;
    float expected_weight = pill_count * get_pill_weight(slot);
    float tolerance = expected_weight * 0.15;  // 15% tolerance
    
    bool weight_ok = fabs(dispensed_weight - expected_weight) < tolerance;
    
    // === STEP 8: Handle results ===
    if (counted < pill_count) {
        ESP_LOGW("DISPENSE", "JAM: Expected %d pills, got %d", pill_count, counted);
        
        // Build event data
        cJSON *data = cJSON_CreateObject();
        cJSON_AddNumberToObject(data, "slot", slot);
        cJSON_AddNumberToObject(data, "expected", pill_count);
        cJSON_AddNumberToObject(data, "actual", counted);
        api_send_event("JAM_DETECTED", data);
        cJSON_Delete(data);
        
        // Play error sound
        audio_play_alert(ALERT_JAM);
        
        return ESP_ERR_TIMEOUT;
    }
    
    if (!weight_ok) {
        ESP_LOGW("DISPENSE", "Weight mismatch: got %.1fg, expected %.1fg",
                 dispensed_weight, expected_weight);
    }
    
    // === STEP 9: Send DOSE_DISPENSED event ===
    cJSON *data = cJSON_CreateObject();
    cJSON_AddNumberToObject(data, "slot", slot);
    cJSON_AddStringToObject(data, "medication", get_medication_name(slot));
    cJSON_AddNumberToObject(data, "scheduled_count", pill_count);
    cJSON_AddNumberToObject(data, "dispensed_count", counted);
    cJSON_AddNumberToObject(data, "weight_grams", dispensed_weight);
    cJSON_AddNumberToObject(data, "expected_weight_grams", expected_weight);
    cJSON_AddStringToObject(data, "verification", weight_ok ? "PASSED" : "WARNING");
    
    api_send_event("DOSE_DISPENSED", data);
    cJSON_Delete(data);
    
    // === STEP 10: Update local inventory ===
    update_inventory(slot, -counted);
    
    // Play success sound
    audio_play_alert(ALERT_DOSE_READY);
    
    // Update display
    display_show_dose_ready(slot, get_medication_name(slot), counted);
    
    ESP_LOGI("DISPENSE", "Complete: %d pills dispensed from slot %d", counted, slot);
    return ESP_OK;
}
```

---

## 8. Sensors — How It Sees and Feels

### 8.1 Complete Sensor Map

| Sensor | Part | What It Detects | Interface | Qty | Unit Cost |
|:-------|:-----|:----------------|:----------|----:|----------:|
| **Pill Counter** | TCPT1300X01 (Vishay) | Each pill passing through chute | GPIO (digital) | 10 | $0.80 |
| **Position Sensor** | A3144 Hall Effect (Allegro) | Carousel position via magnets | GPIO (digital) | 10 | $0.30 |
| **Weight Sensor** | TAL220 1kg + HX711 ADC | Weight of pills in output tray | 2-wire serial | 1 | $5.00 |
| **Temperature** | SHT40-AD1B (Sensirion) | Storage temp ±0.2°C | I2C (0x44) | 1 | $2.50 |
| **Humidity** | SHT40-AD1B (same chip) | Storage humidity ±1.8% RH | I2C (0x44) | 1 | (incl.) |
| **Motion** | AM312 Mini PIR | Patient approaching device | GPIO (digital) | 1 | $1.50 |
| **Door/Tray** | Reed Switch + Magnet | Enclosure opened / tray removed | GPIO (digital) | 1 | $0.30 |
| **Ambient Light** | BH1750FVI (ROHM) | Room brightness (1-65535 lux) | I2C (0x23) | 1 | $1.00 |

### 8.2 How the Optical Pill Counter Works

```
HOW TCPT1300X01 COUNTS PILLS:

        5V                          5V
         │                           │
        ┌┴┐                         ┌┴┐
        │ │ 100Ω                    │ │ 10K
        │ │ (limits IR LED current) │ │ (pull-up resistor)
        └┬┘                         └┬┘
         │                           │
         ▼                           ├──────▶ GPIO (to ESP32)
    ┌─────────┐                      │
    │ IR LED  │   3mm GAP  ┌─────────┐│
    │ (950nm) │────────────│ Photo-  ├┘
    │  Emits  │     ↑      │ transistor
    │ infrared│    PILL    │ (NPN)   │
    │  light  │   PASSES   │ Detects │
    └─────────┘   HERE     │ IR light│
         │                 └────┬────┘
         │                      │
        GND                    GND

SIGNAL BEHAVIOR:
─────────────────────────────────────────────────────────
Normal (no pill):  IR passes through  →  GPIO = HIGH (1)
Pill passing:      IR blocked by pill →  GPIO = LOW  (0)
─────────────────────────────────────────────────────────

TIME DIAGRAM (3 pills dispensed):

GPIO │ ────┐    ┌──┐    ┌──┐    ┌──┐    ┌─────
     │     │    │  │    │  │    │  │    │
     │     └────┘  └────┘  └────┘  └────┘
     │     pill1   pill2   pill3
     └─────────────────────────────────────── time

Count: Rising edges = 3 pills ✓
```

### 8.3 How the Load Cell Verifies

```
LOAD CELL (TAL220) + HX711 ADC:

What it does:
  After pills are dispensed into the output tray, the load cell
  measures their total weight. This provides a SECOND verification
  (in addition to optical counting) that the correct number of
  pills were dispensed.

Example:
  Metformin 500mg tablet weighs ~0.6 grams
  2 tablets expected = 1.2 grams ±15% tolerance
  Load cell reads: 1.24 grams → PASSED ✓

  If load cell reads: 0.62 grams → Only 1 pill! → WARNING

How HX711 reads the load cell:

  Load Cell (4-wire Wheatstone Bridge)     HX711 (24-bit ADC)
  ─────────────────────────────────        ──────────────────
  Red (Excitation+)    ──────────────────▶ E+
  Black (Excitation-)  ──────────────────▶ E-
  White (Signal-)      ──────────────────▶ A-
  Green (Signal+)      ──────────────────▶ A+

  HX711 outputs 24-bit digital value via 2-wire protocol:
  DOUT ──────────────▶ ESP32 GPIO32  (data)
  SCK  ◀──────────────  ESP32 GPIO33 (clock)

  Resolution: 0.1 grams (24-bit ADC on 1kg cell)
  Sample rate: 10 or 80 samples per second
```

### 8.4 Sensor Reading Code

```c
/**
 * Read SHT40 temperature and humidity sensor.
 * Uses I2C bus at address 0x44.
 * High-precision mode (command 0xFD).
 */
esp_err_t sensor_read_sht40(sht40_reading_t *reading) {
    if (reading == NULL) return ESP_ERR_INVALID_ARG;
    
    // Send "measure high precision" command
    uint8_t cmd = 0xFD;
    i2c_master_transmit(sht40_handle, &cmd, 1, 100);
    
    // Wait for measurement (10ms for high precision)
    vTaskDelay(pdMS_TO_TICKS(10));
    
    // Read 6 bytes: [temp_MSB, temp_LSB, temp_CRC, hum_MSB, hum_LSB, hum_CRC]
    uint8_t data[6];
    i2c_master_receive(sht40_handle, data, 6, 100);
    
    // Convert temperature: -45 + 175 × (raw / 65535)
    uint16_t t_raw = (data[0] << 8) | data[1];
    reading->temperature_c = -45.0f + 175.0f * ((float)t_raw / 65535.0f);
    
    // Convert humidity: -6 + 125 × (raw / 65535), clamped to 0-100
    uint16_t h_raw = (data[3] << 8) | data[4];
    reading->humidity_percent = -6.0f + 125.0f * ((float)h_raw / 65535.0f);
    if (reading->humidity_percent < 0) reading->humidity_percent = 0;
    if (reading->humidity_percent > 100) reading->humidity_percent = 100;
    
    return ESP_OK;
}

/**
 * Read HX711 24-bit value (load cell).
 * Bit-banged protocol: pulse SCK, read DOUT.
 */
static int32_t hx711_read_raw(void) {
    // Wait for DOUT to go LOW (data ready)
    uint32_t timeout = 0;
    while (gpio_get_level(PIN_HX711_DOUT) && timeout < 100) {
        vTaskDelay(pdMS_TO_TICKS(1));
        timeout++;
    }
    if (timeout >= 100) return 0;  // Timeout error
    
    // Read 24 bits, MSB first
    int32_t value = 0;
    for (int i = 0; i < 24; i++) {
        gpio_set_level(PIN_HX711_SCK, 1);     // Clock pulse HIGH
        esp_rom_delay_us(1);                    // 1µs hold
        value = (value << 1) | gpio_get_level(PIN_HX711_DOUT);  // Read bit
        gpio_set_level(PIN_HX711_SCK, 0);     // Clock pulse LOW
        esp_rom_delay_us(1);
    }
    
    // 25th pulse = gain 128, channel A
    gpio_set_level(PIN_HX711_SCK, 1);
    esp_rom_delay_us(1);
    gpio_set_level(PIN_HX711_SCK, 0);
    
    // Sign-extend 24-bit to 32-bit
    if (value & 0x800000) value |= 0xFF000000;
    
    return value;
}
```

---

## 9. Display & User Interface

### 9.1 Home Device Display (4.3" TFT)

| Parameter | Value |
|:----------|:------|
| Type | TFT LCD with IPS viewing angles |
| Size | 4.3" diagonal (105.5 × 67.2 mm active) |
| Resolution | 800 × 480 pixels |
| Interface | RGB888 (16-bit, parallel) — native ESP32-S3 LCD controller |
| Touch | Capacitive, 5-point multi-touch (GT911 controller, I2C) |
| Backlight | LED, PWM dimmable via MOSFET |
| Brightness | 400 cd/m² |
| Viewing Angle | 170° horizontal / 170° vertical |
| Connector | 40-pin FFC, 0.5mm pitch |
| Refresh Rate | 60 FPS (smooth animations) |
| Price | $28 (Waveshare) |

**Why RGB interface (not SPI):**
- 60 FPS vs 10-15 FPS for SPI displays
- Smooth UI animations for elderly users
- ESP32-S3 has native LCD controller (no CPU overhead, DMA transfer)
- Double-buffered rendering (no screen tearing)

### 9.2 UI Framework: LVGL

We use **LVGL (Light and Versatile Graphics Library)** for the touchscreen UI:

| Feature | Detail |
|:--------|:-------|
| Library | LVGL v8.3 or v9.0 |
| Color Depth | 16-bit (RGB565) |
| Font | Montserrat 24px + 32px (large, readable for elderly) |
| Theme | High-contrast dark theme |
| Rendering | Double-buffered, DMA transfer to display |
| Input | Capacitive touch via GT911 (I2C) |

**Screen Examples:**

```
┌──────────────────────────────────────────────────────────┐
│  HOME SCREEN                                    09:00 AM │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │      Good Morning, Hans! 🌞                        │  │
│  │                                                    │  │
│  │      Time to take your morning medications:        │  │
│  │                                                    │  │
│  │      ● Metformin 500mg — 2 tablets                 │  │
│  │      ● Lisinopril 10mg — 1 tablet                  │  │
│  │      ● Aspirin 100mg — 1 tablet                    │  │
│  │                                                    │  │
│  │              ┌──────────────────┐                   │  │
│  │              │   DISPENSE NOW   │                   │  │
│  │              │   (touch here)   │                   │  │
│  │              └──────────────────┘                   │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Battery: ████████░░ 85%  │  WiFi: ████ Strong          │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Audio System — Alerts & Voice

### 10.1 Audio Hardware (Home Device)

| Component | Part | Specification |
|:----------|:-----|:-------------|
| **Amplifier** | MAX98357AETE+ (Analog Devices) | I2S Class D, 3.2W @ 4Ω |
| **Speaker** | CUI CMS-403288-078 (40mm) | 8Ω, 2W, 85dB SPL |
| **Interface** | I2S (3 wires from ESP32-S3) | BCLK, LRCK, DOUT |

**Why MAX98357A:**
- No external DAC/codec needed — I2S direct from ESP32
- Filterless Class D (no output inductor needed)
- 92% power efficiency
- Built-in gain control (pin-selectable: 3/6/9/12/15 dB)
- Tiny 3×3mm QFN package, $2.50

### 10.2 Audio Wiring

```
ESP32-S3                    MAX98357A               Speaker (8Ω, 2W)
──────────                  ──────────              ─────────────────
GPIO17 (I2S_BCLK) ────────▶ BCLK
GPIO18 (I2S_LRCK) ────────▶ LRCLK
GPIO15 (I2S_DOUT) ────────▶ DIN

                            GAIN ───▶ GND (15dB gain)
                            SD ─────▶ 3.3V (always enabled)
                            VDD ────▶ 5V
                            GND ────▶ GND
                            OUT+ ───────────────────▶ Speaker +
                            OUT- ───────────────────▶ Speaker -

Capacitors: 10µF + 100nF on VDD pin (close to chip)
```

### 10.3 Audio Files

| Alert | File | Duration | Languages |
|:------|:-----|:---------|:----------|
| Medication reminder | `reminder_XX.wav` | 3 seconds | FR, DE, IT, EN |
| Dose ready | `dose_ready_XX.wav` | 2 seconds | FR, DE, IT, EN |
| Dose missed warning | `missed_XX.wav` | 5 seconds | FR, DE, IT, EN |
| Refill needed | `refill_XX.wav` | 3 seconds | FR, DE, IT, EN |
| Error alert | `error_XX.wav` | 2 seconds | FR, DE, IT, EN |
| Startup chime | `startup.wav` | 1.5 seconds | Universal |
| Button press | `click.wav` | 0.1 seconds | Universal |

**Total audio storage: ~5 MB** (16-bit WAV, 16kHz mono)
Stored on SPIFFS partition or SD card.

### 10.4 I2S Audio Code

```c
// ESP-IDF I2S configuration for MAX98357A
i2s_config_t i2s_config = {
    .mode = I2S_MODE_MASTER | I2S_MODE_TX,
    .sample_rate = 16000,                        // 16kHz for voice
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT, // Mono speaker
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .dma_buf_count = 8,                          // DMA buffer count
    .dma_buf_len = 1024,                         // Samples per buffer
    .use_apll = false,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1
};

i2s_pin_config_t pin_config = {
    .bck_io_num = GPIO_NUM_17,   // Bit clock
    .ws_io_num = GPIO_NUM_18,    // Word select (LRCK)
    .data_out_num = GPIO_NUM_15, // Data out
    .data_in_num = I2S_PIN_NO_CHANGE
};

// Initialize I2S
i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
i2s_set_pin(I2S_NUM_0, &pin_config);
```

---

## 11. Connectivity — WiFi, Cellular, Bluetooth

### 11.1 WiFi (Both Devices)

| Parameter | Value |
|:----------|:------|
| Standard | 802.11 b/g/n |
| Frequency | 2.4 GHz (Home also supports 5 GHz) |
| Security | WPA2/WPA3 |
| Antenna | PCB trace antenna (onboard ESP32-S3 module) |
| Range | ~30m indoor (typical Swiss apartment) |
| Usage | Primary connectivity for Home device |

### 11.2 Bluetooth Low Energy (Both Devices)

| Parameter | Value |
|:----------|:------|
| Standard | BLE 5.0 |
| Usage | Device setup, travel mode sync, phone pairing |
| Range | ~10m |
| Power | Very low (suitable for battery operation) |

### 11.3 Cellular LTE (Travel Device Only)

| Parameter | Value |
|:----------|:------|
| Module | SIM7080G (SIMCom) |
| Networks | LTE Cat-M1, Cat-NB1, NB-IoT |
| Bands | 19 LTE-FDD bands (full EU + US coverage) |
| Data Rate | 589 kbps DL / 1119 kbps UL |
| SIM Provider | 1NCE (€10 for 10 years, 500MB — IoT optimized) |
| Coverage | 50+ countries (global roaming) |
| Protocols | MQTT (preferred), HTTPS, TCP/UDP |
| GNSS | GPS, GLONASS, BeiDou, Galileo |
| Usage | Backup connectivity when no WiFi available |

### 11.4 Offline Operation

| Scenario | What Happens |
|:---------|:-------------|
| WiFi/LTE down | Device continues dispensing normally using local schedule |
| Events stored | Up to 1000 events stored in flash memory (FIFO queue) |
| Connectivity restored | All stored events synced to cloud in order |
| Schedule update needed | Last-received schedule continues; updated when back online |
| Maximum offline | 14 days (limited by local storage and schedule cache) |

---

## 12. Cloud Communication — API & Events

### 12.1 API Endpoints

| Action | Method | Endpoint | Auth |
|:-------|:-------|:---------|:-----|
| Register device | POST | `/v1/devices/register` | Device certificate |
| Send heartbeat | POST | `/v1/devices/{id}/heartbeat` | Bearer token |
| Send event | POST | `/v1/events` | Bearer token |
| Get schedule | GET | `/v1/devices/{id}/schedule` | Bearer token |
| Confirm schedule | POST | `/v1/devices/{id}/schedule/confirm` | Bearer token |
| Check firmware | GET | `/v1/devices/{id}/firmware` | Bearer token |
| Download firmware | GET | `/v1/firmware/{version}` | Bearer token |

### 12.2 Communication Protocol

```
DEVICE                                    CLOUD (Azure Switzerland)
──────                                    ──────────────────────────

  Boot ──────── POST /devices/register ─────▶  Create device record
       ◀─────── 201 {device_token, refresh} ──  Issue JWT token

  Every 60s ─── POST /heartbeat ────────────▶  Update device status
              ◀─── 200 {commands: [...]} ──────  Optional remote commands

  On dispense ─ POST /events ───────────────▶  Record event
              ◀─── 202 Accepted ───────────────

  On boot ──── GET /schedule ───────────────▶  Fetch latest schedule
             ◀─── 200 {schedule, version} ──── Cache locally

  Periodically  GET /firmware ──────────────▶  Check for updates
              ◀─── 200 {version, url, hash} ──  Download if newer

  ALL TRAFFIC: HTTPS (TLS 1.3)
  ALL DATA:    Encrypted AES-256 at rest
  DATA CENTER: Azure Switzerland North (Zurich)
  COMPLIANCE:  GDPR, Swiss nDSG
```

### 12.3 API Client Code

```c
/**
 * Send an event to the cloud API.
 * If offline, stores event locally for later sync.
 */
esp_err_t api_send_event(const char *event_type, cJSON *data) {
    // Build event JSON
    cJSON *body = cJSON_CreateObject();
    cJSON_AddStringToObject(body, "event", event_type);
    cJSON_AddStringToObject(body, "device_id", device_id);
    
    // Add ISO 8601 timestamp
    time_t now;
    time(&now);
    char timestamp[32];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
    cJSON_AddStringToObject(body, "timestamp", timestamp);
    
    if (data) {
        cJSON_AddItemToObject(body, "data", cJSON_Duplicate(data, true));
    }
    
    // Check connectivity
    if (!wifi_is_connected()) {
        // Store locally for later sync
        store_offline_event(body);
        cJSON_Delete(body);
        ESP_LOGW("API", "Offline — event stored locally: %s", event_type);
        return ESP_OK;
    }
    
    // Send via HTTPS
    char *body_str = cJSON_PrintUnformatted(body);
    
    esp_http_client_config_t config = {
        .url = API_BASE_URL "/events",
        .method = HTTP_METHOD_POST,
        .timeout_ms = 30000,
        .crt_bundle_attach = esp_crt_bundle_attach,  // TLS certificate
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    // Auth header
    char auth[600];
    snprintf(auth, sizeof(auth), "Bearer %s", device_token);
    esp_http_client_set_header(client, "Authorization", auth);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_header(client, "X-Device-ID", device_id);
    esp_http_client_set_post_field(client, body_str, strlen(body_str));
    
    esp_err_t err = esp_http_client_perform(client);
    int status = esp_http_client_get_status_code(client);
    
    if (err == ESP_OK && (status == 200 || status == 202)) {
        ESP_LOGI("API", "Event sent: %s", event_type);
    } else {
        ESP_LOGE("API", "Event failed (HTTP %d) — storing locally", status);
        store_offline_event(body);
    }
    
    esp_http_client_cleanup(client);
    cJSON_Delete(body);
    free(body_str);
    return err;
}
```

---

## 13. Firmware Architecture & Code

### 13.1 Software Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Schedule │ │   UI     │ │ API Sync │ │ Settings │ │   OTA    │      │
│  │ Manager  │ │ Manager  │ │ Client   │ │ Manager  │ │ Updater  │      │
│  │          │ │ (LVGL)   │ │ (HTTPS)  │ │ (NVS)   │ │          │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                          MIDDLEWARE LAYER                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Event   │ │  Task    │ │  Queue   │ │  Timer   │ │  NVS     │      │
│  │  Bus     │ │  Manager │ │  Manager │ │  Service │ │  Storage │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                            DRIVER LAYER                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Motor   │ │ Display  │ │  Sensor  │ │  WiFi    │ │  Audio   │      │
│  │  Driver  │ │  Driver  │ │  Driver  │ │  Driver  │ │  Driver  │      │
│  │ (stepper │ │ (LVGL +  │ │ (I2C +   │ │ (STA +   │ │ (I2S +   │      │
│  │  servo)  │ │  RGB LCD)│ │  GPIO)   │ │  mDNS)   │ │  WAV)    │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │            │             │
├───────┴────────────┴────────────┴────────────┴────────────┴─────────────┤
│                              HAL LAYER                                   │
│                           ESP-IDF v5.1+                                 │
│                           FreeRTOS (dual-core)                          │
│                           Hardware Crypto Engine                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 FreeRTOS Task Layout

| Task | CPU Core | Priority | Stack | What It Does |
|:-----|:--------:|:--------:|------:|:-------------|
| `main_task` | 0 | 5 | 4KB | System init, health monitoring |
| `wifi_task` | 1 | 5 | 4KB | WiFi connection, reconnection |
| `ui_task` | 1 | 4 | 8KB | LVGL rendering (needs big stack) |
| `dispense_task` | 0 | 6 | 4KB | Motor control (highest priority) |
| `sensor_task` | 0 | 3 | 2KB | Periodic sensor readings |
| `audio_task` | 0 | 4 | 4KB | WAV file playback |
| `heartbeat_task` | 0 | 3 | 4KB | 60-second API heartbeat |
| `schedule_task` | 0 | 5 | 4KB | Check schedule every second |

### 13.3 Main Application Entry Point

```c
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs_flash.h"

#include "motor_driver.h"
#include "sensor_driver.h"
#include "display_driver.h"
#include "audio_driver.h"
#include "wifi_service.h"
#include "api_client.h"
#include "schedule_service.h"
#include "dispense_service.h"

static const char *TAG = "MAIN";

void app_main(void) {
    ESP_LOGI(TAG, "=== Smart Medication Dispenser v1.0 ===");
    ESP_LOGI(TAG, "Firmware built: %s %s", __DATE__, __TIME__);
    
    // === Phase 1: Core initialization ===
    ESP_LOGI(TAG, "Phase 1: Core init...");
    
    // Initialize Non-Volatile Storage (saves settings, calibration, WiFi creds)
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    // === Phase 2: Hardware drivers ===
    ESP_LOGI(TAG, "Phase 2: Hardware init...");
    ESP_ERROR_CHECK(motor_driver_init());    // Stepper + servo
    ESP_ERROR_CHECK(sensor_driver_init());   // All sensors (I2C, GPIO)
    ESP_ERROR_CHECK(display_driver_init());  // 4.3" TFT + LVGL
    ESP_ERROR_CHECK(audio_driver_init());    // I2S + MAX98357A
    
    // === Phase 3: Services ===
    ESP_LOGI(TAG, "Phase 3: Services init...");
    ESP_ERROR_CHECK(wifi_service_init());
    ESP_ERROR_CHECK(api_client_init());
    ESP_ERROR_CHECK(schedule_service_init());
    ESP_ERROR_CHECK(dispense_service_init());
    
    // === Phase 4: Connect & sync ===
    ESP_LOGI(TAG, "Phase 4: Connecting...");
    wifi_connect();          // Non-blocking, retries in background
    motor_home();            // Find carousel home position
    audio_play_startup();    // Startup chime
    
    // === Phase 5: Start FreeRTOS tasks ===
    ESP_LOGI(TAG, "Phase 5: Starting tasks...");
    
    xTaskCreatePinnedToCore(heartbeat_task, "heartbeat", 4096, NULL, 3, NULL, 0);
    xTaskCreatePinnedToCore(schedule_task, "schedule", 4096, NULL, 5, NULL, 0);
    xTaskCreatePinnedToCore(ui_task, "ui", 8192, NULL, 4, NULL, 1);
    
    ESP_LOGI(TAG, "=== Startup complete! ===");
    
    // Main loop: system health monitoring
    while (1) {
        // Check environmental conditions
        sht40_reading_t env;
        if (sensor_read_sht40(&env) == ESP_OK) {
            if (env.temperature_c > 35 || env.temperature_c < 10) {
                ESP_LOGW(TAG, "Temp out of range: %.1f°C", env.temperature_c);
                api_send_event("TEMPERATURE_ALERT", NULL);
            }
        }
        
        // Check motion for screen wake
        if (sensor_read_motion()) {
            display_wake();
        }
        
        // Check heap for memory leaks
        size_t free_heap = heap_caps_get_free_size(MALLOC_CAP_DEFAULT);
        if (free_heap < 50000) {
            ESP_LOGW(TAG, "Low memory: %d bytes free", free_heap);
        }
        
        vTaskDelay(pdMS_TO_TICKS(1000));  // Check every second
    }
}
```

---

## 14. Security & Encryption

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Transport** | TLS 1.3 (HTTPS) | All API communication encrypted |
| **Authentication** | JWT Bearer Token (OAuth 2.0) | Device identity verification |
| **Device Identity** | X.509 certificate (factory-provisioned) | Unique per device |
| **Data at Rest** | AES-256 encryption | Local event storage encrypted |
| **Hardware Crypto** | ESP32-S3 crypto engine | AES, SHA, RSA acceleration |
| **OTA Updates** | Signed firmware (RSA-2048) | Prevents malicious firmware |
| **Data Location** | Azure Switzerland North (Zurich) | Swiss data residency |
| **Compliance** | GDPR + Swiss nDSG | Data protection regulations |

### 14.1 How Device Authentication Works

```
FACTORY:
  1. Generate unique X.509 certificate per device
  2. Flash certificate into NVS (protected partition)
  3. Register device public key in cloud database

FIRST BOOT:
  1. Device presents X.509 certificate to API
  2. API verifies certificate against registered public key
  3. API issues JWT device_token (24h validity) + refresh_token (30d)
  4. Device stores tokens in NVS

ONGOING:
  1. Every API call includes: Authorization: Bearer <device_token>
  2. Token refreshed automatically before expiry
  3. If refresh fails → device re-authenticates with certificate
```

---

## 15. Bill of Materials & Costs

### 15.1 SMD-100 Home Device — Complete BOM

| Ref | Component | Manufacturer | Part Number | Qty | Unit | Total |
|:----|:----------|:-------------|:------------|----:|-----:|------:|
| U1 | MCU Module | Espressif | ESP32-S3-WROOM-1-N16R8 | 1 | $5.50 | $5.50 |
| U2 | Power Path IC | TI | BQ24195RGER | 1 | $3.50 | $3.50 |
| U3 | Buck Regulator 5V | TI | TPS62150RGTR | 1 | $1.80 | $1.80 |
| U4 | LDO 3.3V | Diodes Inc | AP2112K-3.3TRG1 | 2 | $0.25 | $0.50 |
| U5-11 | Motor Driver | TI | ULN2003AN | 7 | $0.30 | $2.10 |
| U12 | Audio Amplifier | Maxim | MAX98357AETE+ | 1 | $2.50 | $2.50 |
| U13 | Load Cell ADC | Avia | HX711 | 1 | $0.80 | $0.80 |
| U14 | Temp/Humidity | Sensirion | SHT40-AD1B | 1 | $2.50 | $2.50 |
| U15 | Light Sensor | ROHM | BH1750FVI | 1 | $1.00 | $1.00 |
| U16 | I/O Expander | Microchip | MCP23017-E/SO | 1 | $1.50 | $1.50 |
| LCD1 | Display | Waveshare | 4.3" RGB LCD + GT911 | 1 | $28.00 | $28.00 |
| M1-10 | Stepper Motors | Generic | 28BYJ-48 5V | 10 | $1.50 | $15.00 |
| M11 | Gate Servo | TowerPro | SG90 | 1 | $2.00 | $2.00 |
| LS1 | Speaker | CUI | CMS-403288-078 | 1 | $1.50 | $1.50 |
| Q1-10 | Optical Sensor | Vishay | TCPT1300X01 | 10 | $0.80 | $8.00 |
| Q11-20 | Hall Sensor | Allegro | A3144 | 10 | $0.30 | $3.00 |
| PIR1 | Motion | Generic | AM312 | 1 | $1.50 | $1.50 |
| SW1 | Reed Switch | Generic | N/A | 1 | $0.30 | $0.30 |
| LC1 | Load Cell | Generic | TAL220 1kg | 1 | $3.00 | $3.00 |
| BAT | Battery | Samsung | INR18650-25R (×2) | 1 | $8.00 | $8.00 |
| BAT-H | Battery Holder | Keystone | 1042 (2×18650) | 1 | $2.00 | $2.00 |
| PSU | AC Adapter | Mean Well | GST25E12-P1J | 1 | $12.00 | $12.00 |
| PCB1 | Main PCB | JLCPCB | 4-layer, 150×100mm | 1 | $8.00 | $8.00 |
| PCB2 | Motor Board | JLCPCB | 2-layer, 80×60mm | 1 | $3.00 | $3.00 |
| ENC | Enclosure | Custom | ABS injection molded | 1 | $22.00 | $22.00 |
| — | Passives | Various | Caps, resistors, etc. | 1 | $5.00 | $5.00 |
| — | Connectors | Various | JST, FFC, barrel | 1 | $4.00 | $4.00 |
| — | SD Card | SanDisk | 16GB | 1 | $5.00 | $5.00 |
| — | Packaging | Custom | Box, manual, cables | 1 | $6.00 | $6.00 |
| | **TOTAL COGS** | | | | | **$159.00** |

### 15.2 Volume Pricing Projection

| Volume | Components | PCBs | Enclosure | Assembly | Packaging | **Total COGS** |
|-------:|-----------:|-----:|----------:|---------:|----------:|---------------:|
| 100 | $90 | $11 | $22 | $15 | $8 | **$146** |
| 1,000 | $75 | $8 | $18 | $12 | $6 | **$119** |
| 10,000 | $62 | $5 | $14 | $10 | $4 | **$95** |

### 15.3 Target Margins

| Volume | COGS | Retail Price | Gross Margin |
|-------:|-----:|------------:|:-------------|
| 100 units | $146 (CHF 140) | CHF 409 | 66% |
| 1,000 units | $119 (CHF 114) | CHF 409 | 72% |
| 10,000 units | $95 (CHF 91) | CHF 409 | 78% |

---

## 16. PCB Design & Manufacturing

### 16.1 PCB Specifications

| Parameter | Main Board (SMD-100) | Motor Board | Travel Board (SMD-200) |
|:----------|:---------------------|:------------|:-----------------------|
| Size | 150 × 100 mm | 80 × 60 mm | 80 × 60 mm |
| Layers | 4 | 2 | 4 |
| Thickness | 1.6 mm | 1.6 mm | 1.2 mm |
| Copper | 1 oz (all layers) | 1 oz | 1 oz |
| Surface | ENIG (gold) | HASL | ENIG |
| Min trace | 0.15 mm (6 mil) | 0.2 mm | 0.15 mm |
| Min space | 0.15 mm (6 mil) | 0.2 mm | 0.15 mm |
| Via drill | 0.2 mm | 0.3 mm | 0.2 mm |

### 16.2 4-Layer Stack

```
┌─────────────────────────────────────────────┐
│ Layer 1 (Top): Signal + Components          │  1.0 oz copper
├─────────────────────────────────────────────┤  0.2mm prepreg
│ Layer 2: Solid Ground Plane                 │  1.0 oz copper
├─────────────────────────────────────────────┤  1.0mm core
│ Layer 3: Power Planes (3.3V, 5V, 12V)       │  1.0 oz copper
├─────────────────────────────────────────────┤  0.2mm prepreg
│ Layer 4 (Bottom): Signal + Components       │  1.0 oz copper
└─────────────────────────────────────────────┘
Total: ~1.6mm
```

### 16.3 PCB Manufacturers

| Supplier | Location | MOQ | 4-Layer Price | Quality | Lead Time |
|:---------|:---------|----:|--------------:|:--------|:----------|
| **JLCPCB** | China | 5 | $8 | Good | 3-5 days |
| **PCBWay** | China | 5 | $10 | Good | 5-7 days |
| **Eurocircuits** | Belgium | 1 | $80 | Excellent | 5-7 days |
| **Wurth** | Germany | 10 | $60 | Excellent | 7-10 days |

**Strategy:** JLCPCB for prototypes → Eurocircuits for CE-certified production.

---

## 17. Enclosure & Industrial Design

### 17.1 Design Requirements

| Requirement | Specification |
|:------------|:-------------|
| Material | ABS plastic (medical grade, UL94 V-0) |
| Color | White (clean, medical aesthetic) |
| Finish | Matte texture (hides fingerprints) |
| IP Rating | IP22 (protection against fingers and dripping water) |
| Ventilation | Rear ventilation slots (passive cooling) |
| Access | Top-loading pill slots, front pull-out tray |
| Display | Flush-mounted 4.3" window with foam gasket |
| Buttons | Rear: reset, USB-B mini |
| Feet | 4× rubber anti-slip pads |

### 17.2 Manufacturing

| Phase | Method | Cost per Unit | MOQ | Tooling | Lead Time |
|:------|:-------|:-------------|----:|--------:|:----------|
| Prototype | 3D print (SLS/FDM) | $50-80 | 1 | $0 | 3-5 days |
| Pilot (50-100) | Silicone molding | $30-40 | 10 | $2,000 | 2-3 weeks |
| Production (1K+) | Injection molding | $14-22 | 500 | $5,000-8,000 | 4-6 weeks |

---

## 18. Regulatory & Compliance

### 18.1 Device Classification

| Jurisdiction | Classification | Regulation | Rationale |
|:-------------|:---------------|:-----------|:----------|
| **EU** | Class IIa | MDR 2017/745 | Active device, non-invasive, software as medical device |
| **Switzerland** | Class IIa | MedDO (aligned with MDR) | Swiss mutual recognition |

### 18.2 Standards We Must Meet

| Standard | Title | Covers |
|:---------|:------|:-------|
| **IEC 62304** | Medical device software lifecycle | Software development process |
| **IEC 60601-1** | General safety for medical electrical equipment | Electrical safety |
| **IEC 60601-1-2** | EMC requirements | Electromagnetic compatibility |
| **IEC 62366** | Usability engineering | User interface design |
| **ISO 14971** | Risk management | Hazard analysis |
| **ISO 13485** | Quality management systems | Manufacturing QMS |
| **EN 55032** | EMC emissions | Radiated & conducted emissions |
| **EN 55035** | EMC immunity | Immunity to interference |

### 18.3 Certification Timeline & Budget

| Step | Duration | Cost (CHF) |
|:-----|:---------|:-----------|
| ISO 13485 QMS implementation | 4-6 months | 45,000 |
| Technical documentation (design dossier) | 3-4 months | 65,000 |
| Testing (IEC 60601, EMC, safety) | 3-4 months | 55,000 |
| Clinical evaluation (literature) | 2-3 months | 25,000 |
| Notified Body audit (TUV SUD / BSI) | 2-3 months | 40,000 |
| Swissmedic notification (post-CE) | 3-4 months | 18,000 |
| Consultants & contingency | — | 49,000 |
| **Total** | **12-14 months** | **CHF 297,000** |

---

## 19. Testing & Quality Assurance

### 19.1 Production Test Checklist (per unit, 5 minutes)

| # | Test | Expected | Pass Criteria |
|:-:|:-----|:---------|:--------------|
| 1 | Power on | Boots in <10s | Serial output visible |
| 2 | 5V rail | 5.0V ±2% | Measure with DMM |
| 3 | 3.3V rail | 3.3V ±2% | Measure with DMM |
| 4 | WiFi | Connects to test AP | <30 seconds |
| 5 | Display | All pixels light up | No dead pixels |
| 6 | Touch | 4 corners + center | All responsive |
| 7 | Motors 1-10 | All rotate smoothly | No grinding/stalling |
| 8 | Gate servo | Opens and closes | Full range |
| 9 | Optical sensors 1-10 | Detect obstruction | All trigger |
| 10 | Load cell | 50g weight = 50g ±5g | Calibrated |
| 11 | Temperature | Reads ambient ±2°C | Compare to reference |
| 12 | Audio | 1kHz tone plays | Clear, >80dB |
| 13 | PIR motion | Hand wave triggers | <3m range |
| 14 | Door switch | Open/close detects | Both states |
| 15 | API heartbeat | Received on server | Check dashboard |
| 16 | Battery backup | Unplug AC, runs | >10 min test |

### 19.2 Burn-In Test (24 hours per batch)

| Phase | Duration | Conditions |
|:------|:---------|:-----------|
| Normal operation | 8 hours | 25°C, dispense every 30 min |
| Thermal stress | 8 hours | 40°C, continuous operation |
| Cycle test | 8 hours | Dispense every 10 min, WiFi on/off |

---

## 20. Prototyping Roadmap

| Phase | Duration | Goal | Deliverable | Cost |
|:------|:---------|:-----|:------------|:-----|
| **Phase 1: Breadboard** | 2 weeks | Prove concept works | Motor + sensor on breadboard | CHF 200 |
| **Phase 2: Dev boards** | 4 weeks | Write all firmware | ESP32-S3 DevKit + peripherals | CHF 500 |
| **Phase 3: Custom PCB v1** | 4 weeks | Integration test | First PCB prototype (5 units) | CHF 2,000 |
| **Phase 4: PCB v2 (fixes)** | 2 weeks | Fix issues from v1 | Revised PCB (10 units) | CHF 1,500 |
| **Phase 5: Pilot build** | 4 weeks | DFM validation | 50 units for beta testing | CHF 15,000 |
| **Phase 6: Production** | Ongoing | Scale manufacturing | Mass production (500+ units) | Per unit |

**Development Board for Getting Started:**

| Board | MCU | Display | Price | Use For |
|:------|:----|:--------|------:|:--------|
| ESP32-S3-DevKitC-1 | ESP32-S3 | None | $10 | Firmware development |
| ESP32-S3-LCD-EV-Board | ESP32-S3 | 4.3" LCD | $60 | Display + UI development |
| WT32-SC01 Plus | ESP32-S3 | 3.5" LCD | $35 | Compact UI testing |

---

## Appendix A: Complete GPIO Pin Mapping (SMD-100)

| GPIO | Function | Direction | Bus | Notes |
|:-----|:---------|:----------|:----|:------|
| 0 | BOOT / Confirm button | Input | — | Pull-up, dual-purpose |
| 1-5 | LCD R0-R4 (Red) | Output | RGB | 5-bit red channel |
| 6-11 | LCD G0-G5 (Green) | Output | RGB | 6-bit green channel |
| 12-16 | LCD B0-B4 (Blue) | Output | RGB | 5-bit blue channel |
| 17 | I2S BCLK (Audio) | Output | I2S | Bit clock to MAX98357A |
| 18 | I2S LRCK (Audio) | Output | I2S | Word select |
| 15 | I2S DOUT (Audio) | Output | I2S | Audio data |
| 19 | USB D+ | Bidir | USB | OTG / programming |
| 20 | USB D- | Bidir | USB | OTG / programming |
| 21 | LCD HSYNC | Output | RGB | Horizontal sync |
| 22-25 | LCD VSYNC/DE/CLK | Output | RGB | Display timing |
| 26 | PIR Motion | Input | GPIO | AM312 output |
| 27 | Reed Switch (Door) | Input | GPIO | Pull-up, active LOW |
| 32 | HX711 DOUT | Input | Serial | Load cell data |
| 33 | HX711 SCK | Output | Serial | Load cell clock |
| 34 | Cancel Button | Input | GPIO | Pull-up |
| 35-37 | SD Card | Mixed | SPI | CLK, CMD, DATA0 |
| 38-39 | Touch SDA/SCL | Mixed | I2C | GT911 touch controller |
| 40-41 | Touch INT/RST | Mixed | GPIO | Touch interrupt + reset |
| 42 | Backlight PWM | Output | LEDC | Display brightness |
| 43 | Gate Servo | Output | LEDC | PWM 50Hz for SG90 |
| 44 | I2C SDA (Sensors) | Bidir | I2C | Shared sensor bus |
| 45-46 | I2C SCL + SD CLK | Mixed | I2C/SPI | Shared |
| 48 | WS2812B LED Data | Output | RMT | Status LED strip |

**I/O Expander (MCP23017 at I2C 0x20):**
- GPA0-7: Motor control lines for motors 1-4 (4 pins each)
- GPB0-7: Motor control lines for motors 5-8 (4 pins each)
- Remaining motors (9-10) on additional MCP23017 or direct ESP32 GPIO

---

## Appendix B: Supplier Quick Reference

| Component | Preferred Supplier | Backup Supplier | Lead Time |
|:----------|:-------------------|:----------------|:----------|
| ESP32-S3 modules | DigiKey / Mouser | LCSC / Espressif direct | 1-3 days / 4-6 weeks |
| TI Power ICs | DigiKey / Mouser | Arrow | 1-3 days |
| Sensirion SHT40 | DigiKey | Mouser | 1-3 days |
| 28BYJ-48 Motors | AliExpress | Amazon | 7-21 days |
| Displays | Waveshare | Buydisplay | 5-7 days |
| PCBs (prototype) | JLCPCB | PCBWay | 3-5 days |
| PCBs (production) | Eurocircuits (BE) | Wurth (DE) | 5-10 days |
| Enclosures (proto) | Protolabs / Xometry | — | 3-5 days |
| Enclosures (production) | HLH Prototypes / Alibaba | — | 4-6 weeks |
| 18650 Batteries | Nkon.nl (EU) | IMRbatteries.com | 3-7 days |
| SIM7080G | LCSC | DigiKey | 7-14 days |

---

## Revision History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release (basic overview) |
| 2.0 | Feb 2026 | Added event formats, API endpoints |
| 3.0 | Feb 2026 | Complete rewrite with full hardware deep-dive, schematics, code examples, BOM, PCB design, regulatory details, testing procedures, and supplier information |

---

*This document is confidential and intended for the engineering team, investors, and regulatory partners of Smart Medication Dispenser AG. All specifications are based on current designs and are subject to change during development.*

**Contact:** hardware@smartdispenser.ch | firmware@smartdispenser.ch
**Location:** Innovation Park EPFL, Lausanne, Switzerland
