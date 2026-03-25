# System Overview — What Our Platform Does

**Smart Medication Dispenser Platform — Complete System Explanation**

**Date:** February 2026 | **Version:** 1.0

---

## Table of Contents

| # | Section |
|:-:|:--------|
| 1 | [What We Built](#1-what-we-built) |
| 2 | [The Problem We Solve](#2-the-problem-we-solve) |
| 3 | [How It Works — The Big Picture](#3-how-it-works--the-big-picture) |
| 4 | [The Five Components](#4-the-five-components) |
| 5 | [End-to-End User Journeys](#5-end-to-end-user-journeys) |
| 6 | [Technical Architecture](#6-technical-architecture) |
| 7 | [What Makes Us Different](#7-what-makes-us-different) |
| 8 | [Current Status & What's Built](#8-current-status--whats-built) |

---

## 1. What We Built

We built an **intelligent medication management platform** — a complete ecosystem that ensures patients take the right medication, at the right time, every time.

The system has five connected components:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                  SMART MEDICATION DISPENSER PLATFORM                              │
│                     Designed in Lausanne, Switzerland                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│        ┌──────────┐    ┌──────────┐    ┌──────────────────────────┐             │
│        │ SMD-100  │    │ SMD-200  │    │    CLOUD PLATFORM        │             │
│        │ HOME     │    │ TRAVEL   │    │    (The Brain)           │             │
│        │ DEVICE   │    │ DEVICE   │    │                          │             │
│        │          │    │          │    │  ┌─────────────────────┐ │             │
│        │ 10 slots │    │ 4 slots  │    │  │ ASP.NET Core 8 API │ │             │
│        │ WiFi     │    │ LTE+WiFi │    │  │ PostgreSQL         │ │             │
│        │ 48h batt │    │ 7-day    │    │  │ Azure Switzerland  │ │             │
│        │          │    │ battery  │    │  └─────────────────────┘ │             │
│        └─────┬────┘    └─────┬────┘    └────────────┬─────────────┘             │
│              │               │                      │                           │
│              └───────────────┼──────────────────────┘                           │
│                              │                                                   │
│              ┌───────────────┼───────────────┐                                  │
│              │               │               │                                  │
│        ┌─────┴────┐   ┌─────┴────┐   ┌──────┴─────┐                           │
│        │ MOBILE   │   │ WEB      │   │ CAREGIVER  │                           │
│        │ APP      │   │ PORTAL   │   │ ALERTS     │                           │
│        │          │   │          │   │            │                           │
│        │ Patient  │   │ Caregiver│   │ Missed dose│                           │
│        │ iOS +    │   │ React +  │   │ Low stock  │                           │
│        │ Android  │   │ TypeScript│  │ Device     │                           │
│        └──────────┘   └──────────┘   │ errors     │                           │
│                                      └────────────┘                           │
│                                                                                  │
│  USERS:  Patient  |  Caregiver  |  Admin                                        │
│  DATA:   Swiss-hosted (Azure Zurich)  |  GDPR + nDSG compliant                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**In one sentence:** We are a cloud-first medication management platform where the intelligence lives in the cloud, and physical devices, mobile apps, and web portals all connect to it as endpoints — so your medications follow you, not the other way around.

---

## 2. The Problem We Solve

### The Numbers

| Fact | Data |
|:-----|:-----|
| Patients who forget or mismanage medications | 50% (WHO) |
| Annual deaths in Europe from non-adherence | 200,000 |
| Annual cost to European healthcare | €125 billion |
| Swiss elderly (65+) taking 5+ daily medications | 41% |
| Swiss elderly (65+) living alone | 38% |
| Informal caregivers in Switzerland | 600,000 |
| Caregivers experiencing burnout | 35% |

### Who Suffers

| Person | Their Problem |
|:-------|:-------------|
| **Elderly patient** | Forgets medications, confused by complex schedules, no help at home |
| **Adult child / caregiver** | Worries constantly, calls daily, drives 45 minutes to check on parent |
| **Doctor** | Prescribed treatment isn't working because patient isn't actually taking it |
| **Insurer** | Pays for hospitalizations that could have been prevented |

### Why Current Solutions Fail

| Solution | What's Wrong |
|:---------|:-------------|
| Pill organizers | No reminders, no tracking, no caregiver visibility |
| Phone alarms | Easy to dismiss, no confirmation, no inventory tracking |
| Family check-ins | Intrusive, unreliable, not scalable |
| Existing smart dispensers | Device-centric (no travel), expensive, closed ecosystem, poor integrations |

---

## 3. How It Works — The Big Picture

### 3.1 The Core Flow

Every day, this is what happens:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     A DAY IN THE LIFE                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ☀️ 8:00 AM — MORNING DOSE                                               │
│  ┌──────────┐     ┌──────────────┐     ┌───────────────┐                │
│  │ Schedule │────▶│ Device beeps │────▶│ Carousel      │                │
│  │ triggers │     │ + voice alert│     │ rotates to    │                │
│  │          │     │ + push notif │     │ correct slot  │                │
│  └──────────┘     └──────────────┘     └───────┬───────┘                │
│                                                 │                        │
│                                                 ▼                        │
│                                        ┌───────────────┐                │
│                                        │ Gate opens,   │                │
│                                        │ pills drop,   │                │
│                                        │ optical sensor │                │
│                                        │ counts each   │                │
│                                        │ pill           │                │
│                                        └───────┬───────┘                │
│                                                 │                        │
│                                                 ▼                        │
│                                        ┌───────────────┐                │
│                                        │ Load cell     │                │
│                                        │ verifies      │                │
│                                        │ correct weight│                │
│                                        └───────┬───────┘                │
│                                                 │                        │
│                                                 ▼                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  CLOUD receives DOSE_DISPENSED event                               │  │
│  │  → Updates patient record                                         │  │
│  │  → Sends push notification to patient's phone                     │  │
│  │  → Updates web portal for caregiver                               │  │
│  │  → Decrements inventory count                                     │  │
│  │  → Starts 60-minute confirmation timer                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  📱 Patient taps "Confirm" on phone (or device detects pills removed)    │
│  → Cloud records confirmation → Caregiver sees ✅ on dashboard           │
│                                                                           │
│  ⚠️ If patient doesn't confirm within 60 minutes:                        │
│  → Cloud marks dose as MISSED                                            │
│  → Alert sent to patient (phone + device)                                │
│  → Alert sent to caregiver (push + email)                                │
│  → Webhook triggers external systems                                     │
│                                                                           │
│  🔄 This repeats for every scheduled dose throughout the day              │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 The Dose Lifecycle

Every medication dose goes through this lifecycle:

```
PENDING → DISPENSED → CONFIRMED (taken)
                  └→ MISSED (not taken within 60 min)
                  └→ DELAYED (patient chose to delay)
```

| Status | Meaning | Color | What Happens |
|:-------|:--------|:------|:-------------|
| **Pending** | Scheduled but not yet dispensed | Yellow | Waiting for scheduled time |
| **Dispensed** | Pills released from device | Blue | Waiting for patient to take them |
| **Confirmed** | Patient confirmed intake | Green | Inventory decremented, logged |
| **Missed** | 60 minutes passed, no confirmation | Red | Alerts sent to patient + caregiver |
| **Delayed** | Patient chose to snooze | Orange | New reminder scheduled |

---

## 4. The Five Components

### 4.1 SMD-100 Home Device

**What:** A countertop automated pill dispenser for daily home use.

```
    ┌────────────────────────────┐
    │  ┌──────────────────────┐  │
    │  │                      │  │
    │  │     4.3" Touchscreen │  │    KEY SPECS:
    │  │     (800 × 480)      │  │    • 10 medication slots
    │  │     Voice prompts    │  │    • 30 pills per slot (90-day supply)
    │  │     FR/DE/IT/EN      │  │    • Dual verification (optical + weight)
    │  │                      │  │    • 48-hour battery backup
    │  └──────────────────────┘  │    • WiFi + Bluetooth
    │                            │    • Temperature/humidity monitoring
    │  🔴 🟢 🔵 (Status LEDs)  │    • Motion-wake screen
    │                            │    • Voice alerts in 4 languages
    │  ┌──────────────────────┐  │    • Offline operation (up to 14 days)
    │  │    OUTPUT TRAY       │  │    • OTA firmware updates
    │  │    (with load cell)  │  │
    │  └──────────────────────┘  │    Size: 305 × 203 × 254 mm
    │                            │    Weight: 1.6 kg
    └────────────────────────────┘    Power: AC + battery backup
```

**How dispensing works:**

| Step | What Happens | Time | Sensor |
|:----:|:-------------|:-----|:-------|
| 1 | Carousel rotates to correct medication slot | 500ms | Hall effect sensor confirms position |
| 2 | Gate servo opens | 200ms | — |
| 3 | Pills fall through chute, counted by infrared sensor | <5 sec | TCPT1300 optical counter |
| 4 | Gate closes | 200ms | — |
| 5 | Load cell weighs dispensed pills | 1 sec | HX711 + TAL220 (0.1g resolution) |
| 6 | Event sent to cloud | Immediate | WiFi HTTPS |

**Accuracy:** 99.9% correct pill count (dual verification: optical count + weight check).

### 4.2 SMD-200 Travel Device

**What:** A portable pill dispenser for patients who travel or are away from home.

```
    ┌──────────────────┐
    │  ┌────────────┐  │         KEY SPECS:
    │  │ 2.4" OLED  │  │         • 4 medication slots
    │  │ 128 × 64   │  │         • 14-day supply
    │  └────────────┘  │         • 7-day battery life
    │                  │         • Cellular (LTE Cat-M1, 50+ countries)
    │  [BTN1] [BTN2]   │         • WiFi + Bluetooth
    │                  │         • GPS/GNSS tracking
    │                  │         • Offline operation (stores 1000 events)
    └──────────────────┘         • Buzzer + vibration alerts
     152 × 102 × 76 mm
     360g                        SIM: 1NCE IoT (€10 for 10 years)
```

**Travel Mode — how it works:**

```
STEP 1: Patient activates Travel Mode (from app or home device)
    → Cloud transfers medication schedules for selected slots
    → Home device pauses those slots
    → Travel device receives schedule via BLE sync

STEP 2: While traveling (up to 14 days)
    → Travel device dispenses independently
    → Uses LTE for cloud sync when available
    → Stores events offline if no connection
    → GPS tracks location (with consent)

STEP 3: Patient returns home
    → Deactivates Travel Mode
    → Travel device syncs all offline events to cloud
    → Cloud reconciles all doses taken during travel
    → Home device resumes paused slots
```

### 4.3 Cloud Platform (The Brain)

**What:** The central intelligence that coordinates everything. This is the core of the system — all data, logic, and decision-making lives here.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLOUD PLATFORM                                     │
│                    Azure Switzerland North (Zurich)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  ASP.NET Core 8 Web API (Clean Architecture + CQRS)               │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  API LAYER (13 Controllers, 36 Handlers)                     │ │ │
│  │  │                                                              │ │ │
│  │  │  Auth        → Register, Login, Profile                      │ │ │
│  │  │  Devices     → CRUD, Pause/Resume, Heartbeat                 │ │ │
│  │  │  Containers  → Medication slot management                    │ │ │
│  │  │  Schedules   → When to dispense, recurring patterns          │ │ │
│  │  │  Dispensing   → Dispense, Confirm, Delay                     │ │ │
│  │  │  Travel      → Start/End travel sessions                     │ │ │
│  │  │  Notifications→ Missed dose, low stock, device alerts        │ │ │
│  │  │  Adherence   → Percentage, statistics, patterns              │ │ │
│  │  │  Integrations→ Webhooks, API keys, sync                     │ │ │
│  │  │  Device API  → Hardware endpoints (heartbeat, events)        │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  BACKGROUND SERVICES                                         │ │ │
│  │  │  • Missed Dose Checker (every 5 min)                         │ │ │
│  │  │    → Marks doses as missed after 60-min timeout              │ │ │
│  │  │    → Creates notifications for patient + caregiver           │ │ │
│  │  │    → Triggers outgoing webhooks                              │ │ │
│  │  │  • Low Stock Monitor                                         │ │ │
│  │  │    → Alerts when medication containers are running low       │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                               │ │
│  │                                                                    │ │
│  │  11 Tables:                                                        │ │
│  │  User → Device → Container → Schedule → DispenseEvent              │ │
│  │  Notification, TravelSession, WebhookEndpoint,                     │ │
│  │  DeviceApiKey, DeviceEventLog                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Security: JWT (OAuth 2.0) | TLS 1.3 | AES-256 at rest                 │
│  Compliance: GDPR | Swiss nDSG | Swiss data residency                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**What the cloud manages:**

| Function | Description |
|:---------|:------------|
| **User accounts** | Patients, caregivers, admins with role-based access |
| **Device registry** | All home + travel devices linked to patient accounts |
| **Medication inventory** | Per-container pill counts, decrement on confirmation |
| **Schedules** | Recurring medication times (e.g., "Metformin 2 pills at 8:00 AM, Mon-Sun") |
| **Dose lifecycle** | Track every dose from scheduled → dispensed → confirmed/missed |
| **Travel sessions** | Coordinate schedule transfer between home and travel devices |
| **Notifications** | Generate and deliver alerts for missed doses, low stock, device errors |
| **Adherence analytics** | Calculate adherence percentages, identify patterns |
| **Caregiver network** | Link caregivers to patients with appropriate visibility |
| **Integrations** | Outgoing webhooks, device API keys, future EHR/pharmacy connections |

### 4.4 Mobile App (Patient)

**What:** iOS and Android app for patients to manage daily medication, receive reminders, and confirm doses.

| Screen | What It Does |
|:-------|:-------------|
| **Home** | Today's schedule with upcoming doses, "Dispense" and "Confirm" buttons, device selector |
| **Devices** | List of patient's devices with status, battery, connectivity, pause/resume |
| **History** | Timeline of all dispensing events with status colors, date/device filters |
| **Notifications** | Missed dose alerts, low stock warnings, device errors, mark as read |
| **Dose Detail** | Specific dose information with large "Confirm Taken" and "Delay" buttons |

**Built with:** React Native (Expo) | TypeScript | Expo Router | Expo Notifications

```
┌───────────────────────────────────┐
│  🏠 Home    📱 Devices    📋 History    🔔 Alerts  │
├───────────────────────────────────┤
│                                   │
│  Good Morning, Hans!              │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  ⏰ 08:00 — Morning          │  │
│  │  ● Metformin 500mg (2 pills)│  │
│  │  ● Lisinopril 10mg (1 pill) │  │
│  │  ● Aspirin 100mg (1 pill)   │  │
│  │                             │  │
│  │  Status: ⏳ Pending          │  │
│  │                             │  │
│  │  ┌──────────┐ ┌──────────┐ │  │
│  │  │ DISPENSE │ │ CONFIRM  │ │  │
│  │  └──────────┘ └──────────┘ │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  ⏰ 12:00 — Noon             │  │
│  │  ● Metformin 500mg (2 pills)│  │
│  │  Status: Scheduled           │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  ⏰ 20:00 — Evening          │  │
│  │  ● Metformin 500mg (2 pills)│  │
│  │  ● Atorvastatin 20mg (1)    │  │
│  │  Status: Scheduled           │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

### 4.5 Web Portal (Caregiver / Admin)

**What:** Browser-based dashboard for caregivers to monitor patients, manage devices, configure schedules, and review adherence.

| Page | What It Does |
|:-----|:-------------|
| **Dashboard** | Adherence summary (percentage, charts), today's schedule, quick actions |
| **Devices** | List all devices, create new, pause/resume, view hardware status |
| **Device Detail** | Single device info: battery, WiFi, temperature, container overview, recent events |
| **Containers** | Manage medication slots per device: name, quantity, pills per dose, low stock alert |
| **Schedules** | Configure when medications dispense: time, days of week, date range |
| **History** | Dispense event timeline with date/device filters, status badges |
| **Travel** | Start/end travel sessions, view active session, container transfer status |
| **Notifications** | All alerts: missed doses, low stock, device errors, mark as read |
| **Integrations** | Outgoing webhook management, device API key creation and revocation |

**Built with:** React 18 | TypeScript | Vite | Tailwind CSS | shadcn/ui | Recharts

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  📱 Devices  📋 History  ✈️ Travel  🔔 Alerts  ⚙️ Integrations │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ADHERENCE SUMMARY                   TODAY'S SCHEDULE                │
│  ┌─────────────────────┐            ┌───────────────────────┐       │
│  │                     │            │ 08:00 ✅ Confirmed     │       │
│  │    ████████░░       │            │ 12:00 ❌ Missed        │       │
│  │      89.3%          │            │ 15:00 ⏳ Pending       │       │
│  │                     │            │ 20:00 ⏰ Scheduled     │       │
│  │ Confirmed: 47       │            └───────────────────────┘       │
│  │ Missed: 4           │                                            │
│  │ Pending: 2          │            DEVICES                         │
│  └─────────────────────┘            ┌───────────────────────┐       │
│                                     │ 🏠 Home Dispenser     │       │
│  ADHERENCE CHART (7 days)           │    Status: Active ●   │       │
│  ┌─────────────────────┐            │    Battery: 85%       │       │
│  │ █ █ █ █ █ █ █       │            │    WiFi: Strong       │       │
│  │ █ █ █ █ █ █ █       │            │                       │       │
│  │ █ █ █ █ █ █ █       │            │ ✈️ Travel Dispenser   │       │
│  │ M T W T F S S       │            │    Status: Paused ○   │       │
│  └─────────────────────┘            └───────────────────────┘       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. End-to-End User Journeys

### Journey 1: Patient Takes Morning Medication

```
TIME    WHO          WHAT HAPPENS
─────── ──────────── ──────────────────────────────────────────────────

7:55    Cloud        Background service checks schedule
                     → Finds: "Metformin 2 pills, 08:00, Slot 3"
                     → Creates PENDING dispense event

8:00    Device       Receives schedule trigger
                     → Plays voice alert: "Time to take Metformin"
                     → Display shows medication details
                     → LED strip glows blue

8:00    Cloud        Sends push notification to patient's phone
                     → "Time for medication: Metformin 500mg — 2 pills"

8:00    Patient      Walks up to device (PIR sensor wakes display)
                     → Taps "Dispense" on touchscreen (or phone)

8:00    Device       Carousel rotates to Slot 3 (Hall sensor confirms)
                     → Gate opens → 2 pills fall to tray
                     → Optical sensor counts: 2 pills ✓
                     → Load cell weighs: 1.24g (expected 1.20g ±15%) ✓
                     → Gate closes

8:00    Device       Sends DOSE_DISPENSED event to cloud via HTTPS
                     → {slot: 3, medication: "Metformin", count: 2, weight: 1.24g}

8:01    Patient      Picks up pills from tray → takes them

8:01    Patient      Opens phone → taps "Confirm Taken"
                     (or load cell detects tray weight decreased)

8:01    Cloud        Receives confirmation
                     → Status: DISPENSED → CONFIRMED
                     → Decrements Container 3 quantity by 2
                     → Logs event with timestamp
                     → Updates adherence statistics

8:01    Caregiver    Web portal dashboard shows ✅ for 08:00 dose
                     → No alert needed — dose confirmed on time
```

### Journey 2: Patient Misses a Dose

```
TIME    WHO          WHAT HAPPENS
─────── ──────────── ──────────────────────────────────────────────────

12:00   Device       Alerts for noon dose (voice + display + push)
12:00   Patient      Not home — forgot phone — doesn't hear alert

12:30   Cloud        No confirmation received — dose still DISPENSED
                     → Sends second reminder to patient's phone

13:00   Cloud        Background service runs (every 5 minutes)
                     → Finds: noon dose has been DISPENSED for 60 min
                     → Changes status: DISPENSED → MISSED
                     → Creates notification for patient:
                       "Missed dose: Metformin at 12:00"
                     → Creates notification for caregiver:
                       "Your patient missed their noon Metformin"
                     → Triggers outgoing webhooks (if configured)

13:00   Caregiver    Receives push notification + sees ❌ on dashboard
                     → Calls patient to check if everything is OK

13:00   Web Portal   Dashboard updates: adherence drops from 94% → 91%
                     → History page shows red "Missed" badge
```

### Journey 3: Activating Travel Mode

```
TIME    WHO          WHAT HAPPENS
─────── ──────────── ──────────────────────────────────────────────────

Day 0   Patient      Opens app → Travel → "Start Travel"
                     → Selects medications to bring (Slots 1, 2, 3)
                     → Sets duration: 7 days
                     → Pairs with portable device via Bluetooth

Day 0   Cloud        Receives StartTravelCommand
                     → Creates TravelSession record
                     → Copies container info to portable device
                     → Pauses Slots 1, 2, 3 on home device
                     → Activates portable device
                     → Sends TRAVEL_MODE_ON event

Day 0   Home Device  Pauses dispensing for Slots 1, 2, 3
                     → Display shows "Travel Mode Active" for those slots
                     → Remaining slots (4-10) continue normally

Day 1-7 Travel Dev   Dispenses medications at scheduled times
                     → Uses LTE cellular to sync with cloud
                     → If no signal → stores events offline (up to 1000)
                     → Buzzer + vibration alerts (saves battery)

Day 7   Patient      Returns home → app → Travel → "End Travel"

Day 7   Cloud        Receives EndTravelCommand
                     → Travel device syncs all offline events
                     → Cloud reconciles: which doses taken, which missed
                     → Resumes Slots 1, 2, 3 on home device
                     → Updates inventory based on travel consumption
                     → Sends TRAVEL_MODE_OFF event
```

### Journey 4: Caregiver Managing Remotely

```
TIME    WHO          WHAT HAPPENS
─────── ──────────── ──────────────────────────────────────────────────

Any     Caregiver    Logs into web portal (caregiver@demo.com)
time                 → Dashboard shows real-time patient status

        Caregiver    Checks adherence → 89.3% this week
                     → Sees pattern: patient often misses noon dose
                     → Considers schedule adjustment

        Caregiver    Navigates to Containers → checks inventory
                     → Slot 3 (Metformin): 12 pills remaining
                     → Alert: "Low stock — 6 days remaining"
                     → Contacts pharmacy for refill

        Caregiver    Gets notification: "Device offline"
                     → Last heartbeat was 3 hours ago
                     → Calls patient: "Is your device plugged in?"
                     → Patient plugs it back in → heartbeat resumes

        Caregiver    Receives webhook at configured URL:
                     POST https://care-system.example.com/webhook
                     {type: "missed_dose", patient: "Hans", medication: "Metformin"}
                     → External care system logs the event
```

---

## 6. Technical Architecture

### 6.1 Backend — Clean Architecture + CQRS

The backend follows a layered architecture where each layer has a single responsibility:

```
┌─────────────────────────────────────────────────────────────────────┐
│  API Layer (ASP.NET Core 8)                                          │
│  13 Controllers → receive HTTP requests → send to MediatR           │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────────┐  │
│    │  Application Layer (Business Logic)                          │  │
│    │  18 Commands + 10 Queries = 36 Handlers                     │  │
│    │  FluentValidation for request validation                    │  │
│    │                                                             │  │
│    │    ┌─────────────────────────────────────────────────────┐  │  │
│    │    │  Domain Layer (Core)                                 │  │  │
│    │    │  11 Entities + 6 Enums                              │  │  │
│    │    │  Zero external dependencies                         │  │  │
│    │    └─────────────────────────────────────────────────────┘  │  │
│    │                                                             │  │
│    └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────────┐  │
│    │  Infrastructure Layer                                        │  │
│    │  EF Core + PostgreSQL, JWT Auth, Webhooks, Background Jobs  │  │
│    └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Model

```
User ──┬── 1:N ──▶ Device ──┬── 1:N ──▶ Container ──┬── 1:N ──▶ Schedule
       │                     │                        │            │
       │                     │                        │            └── 1:N ──▶ DispenseEvent
       │                     │                        │
       │                     │                        └── 1:N ──▶ DispenseEvent
       │                     │
       │                     ├── 1:N ──▶ DeviceApiKey
       │                     └── 1:N ──▶ DeviceEventLog
       │
       ├── 1:N ──▶ Notification
       ├── 1:N ──▶ WebhookEndpoint
       └── Self-referential: Caregiver ── 1:N ──▶ Patients

TravelSession links: User ──▶ TravelSession ◀── MainDevice + PortableDevice
```

### 6.3 API Endpoints Summary

| Area | Endpoints | Auth | Purpose |
|:-----|:----------|:-----|:--------|
| **Auth** | Register, Login, Me, Profile | None / JWT | User authentication |
| **Devices** | List, Get, Create, Pause, Resume, Heartbeat | JWT | Device management |
| **Containers** | List, Create, Update, Delete | JWT | Medication slot management |
| **Schedules** | List, Create, Update, Delete, Today | JWT | Dispensing schedules |
| **Dispensing** | Dispense, Confirm, Delay | JWT | Dose lifecycle |
| **History** | Events (with date filter) | JWT | Event timeline |
| **Travel** | Start, End | JWT | Travel mode |
| **Notifications** | List, Mark Read | JWT | Alert management |
| **Integrations** | Webhooks CRUD, API Keys CRUD, Sync | JWT / API Key | External connections |
| **Device API** | Register, Heartbeat, Schedule, Events | Device Token | Hardware communication |

### 6.4 Technology Stack Summary

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Backend API** | ASP.NET Core 8, C#, MediatR, FluentValidation | Business logic + REST API |
| **Database** | PostgreSQL (prod) / SQLite (dev) | Data persistence |
| **ORM** | Entity Framework Core 8 | Database access |
| **Auth** | JWT Bearer Token (HS256, 7-day expiry) | Authentication |
| **Web Portal** | React 18, TypeScript, Vite, Tailwind CSS | Caregiver dashboard |
| **UI Components** | shadcn/ui (Radix), Recharts, Motion | Portal UI |
| **Mobile App** | React Native 0.76, Expo 52, TypeScript | Patient app |
| **Navigation** | Expo Router 4 (file-based) | Mobile routing |
| **Notifications** | Expo Notifications (local) | Dose reminders |
| **Device Firmware** | ESP-IDF v5.1+, FreeRTOS, C | Hardware control |
| **Device UI** | LVGL v8.3/v9.0 | Touchscreen interface |
| **Hosting** | Azure Switzerland North (Zurich) | Swiss data residency |
| **Container** | Docker + Docker Compose | Deployment |

---

## 7. What Makes Us Different

### 7.1 Cloud-First Architecture

**The fundamental difference:** Every other smart pill dispenser puts the intelligence in the device. We put it in the cloud. The device is just a dispensing endpoint.

| What This Means | Competitors | Us |
|:----------------|:-----------|:---|
| Device breaks | Patient loses all data and configuration | Swap in a new device — cloud restores everything |
| Patient travels | No dispensing (device stays home) | Travel device syncs from cloud, works anywhere |
| Add second location | Buy separate system, start over | Add device to same cloud account, instant sync |
| Software update | Limited by device hardware | Unlimited — cloud evolves independently |
| Caregiver monitoring | One device portal | Cross-device, cross-patient unified dashboard |
| Integration | Closed system | Open API + webhooks for pharmacy/EHR/smart home |

### 7.2 Key Differentiators

| # | Feature | Why It Matters | Who Has It |
|:-:|:--------|:---------------|:-----------|
| 1 | **Travel mode** | Only system that works when you leave home | Only us |
| 2 | **Multi-device per patient** | Home + portable + future devices on one account | Only us |
| 3 | **Open API + Webhooks** | Connects to pharmacy, EHR, smart home, custom systems | Only us |
| 4 | **Swiss data hosting** | GDPR + nDSG compliant, data stays in Switzerland | Only us (in this market) |
| 5 | **4-language support** | FR, DE, IT, EN — serves all Swiss language regions | Only us |
| 6 | **Dual verification** | Optical counting + weight check = 99.9% accuracy | Rare in competitors |
| 7 | **Cellular connectivity** | Travel device works in 50+ countries via LTE | Only us + Medido |
| 8 | **Self-loadable** | Patients/caregivers load pills themselves | Us + Hero (not pharmacy-dependent) |

### 7.3 Target Market

| Segment | Description | Price |
|:--------|:------------|:------|
| **B2C Essential** | Home device + app + email support | CHF 34.99/month |
| **B2C Premium** | + Travel device + priority support | CHF 49.99/month |
| **B2C Family** | + 3 caregiver accounts + phone support | CHF 69.99/month |
| **B2B Pharmacy** | Per-patient licensing for pharmacy chains | CHF 12/patient/month |
| **B2B Care Home** | Per-resident licensing for care facilities | CHF 18/resident/month |

**Geography:** Switzerland first (Lausanne → Romandie → DACH) → Europe

---

## 8. Current Status & What's Built

### 8.1 MVP Status

| Component | Status | Details |
|:----------|:-------|:-------|
| **Backend API** | ✅ Complete | 13 controllers, 36 handlers, 11 entities, full CQRS |
| **Web Portal** | ✅ Complete | 11 pages, auth, dashboard, device management, travel, integrations |
| **Mobile App** | ✅ Complete | 5 screens + tab navigation, dose confirmation, notifications |
| **Database** | ✅ Complete | PostgreSQL with EF Core migrations, seed data |
| **Docker** | ✅ Complete | API + PostgreSQL compose file |
| **Hardware Design** | ✅ Complete | Full PCB design, BOM, schematics for SMD-100 and SMD-200 |
| **Firmware** | 🔧 In Progress | Dispensing code, sensor drivers, API client written |
| **Hardware Prototype** | 🔧 In Progress | Component selection complete, PCB fabrication next |

### 8.2 What You Can Try Today

```bash
# Start the backend + database
cd smart-medication-dispenser
docker-compose up -d

# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger

# Start the web portal
cd web && npm install && npm run dev
# Open http://localhost:5173

# Start the mobile app
cd mobile && npm install && npx expo start
# Scan QR code with Expo Go
```

**Demo Credentials:**

| Role | Email | Password |
|:-----|:------|:---------|
| Patient | patient@demo.com | Demo123! |
| Caregiver | caregiver@demo.com | Demo123! |
| Admin | admin@demo.com | Demo123! |

Seed data creates: demo patient, caregiver, 1 home device, 1 portable device, sample medication containers, schedules, and dispense events.

### 8.3 What's Next

| Phase | Timeline | Goal |
|:------|:---------|:-----|
| **Phase 1** | Q2 2026 | Hardware prototype complete, firmware integrated, sensor calibration |
| **Phase 2** | Q3-Q4 2026 | CE marking, beta testing (50 users), first B2B pilots |
| **Phase 3** | Q1 2027 | Commercial launch, 400 customers, Swissmedic notification |
| **Phase 4** | Q2-Q3 2027 | DACH expansion, Series A fundraising |

---

## Quick Reference

### System at a Glance

| | |
|:--|:--|
| **What** | Cloud-first intelligent medication management platform |
| **Who** | Elderly patients (65+), caregivers, pharmacies, care homes |
| **Where** | Switzerland (expanding to DACH + Europe) |
| **How** | Smart dispensers + mobile app + web portal + cloud brain |
| **Why** | 50% non-adherence rate → 200,000 deaths/year in Europe |
| **Unique** | Travel mode, multi-device, open API, Swiss data, cloud-first |
| **Revenue** | B2C subscription (CHF 35-70/mo) + B2B licensing |
| **Stage** | MVP complete, seeking CHF 1.2-1.5M seed |

---

*Document prepared: February 2026*  
*Smart Medication Dispenser Platform — Lausanne, Switzerland*
