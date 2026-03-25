# Technical Documentation

**Smart Medication Dispenser — Complete Technical Reference**

**Designed and Engineered in Lausanne, Switzerland**

---

## MVP

Software MVP scope and minimal integration JSON: **[../software-docs/MVP_APPLICATION.md](../software-docs/MVP_APPLICATION.md)** and **[../software-docs/WEBHOOKS_JSON_REFERENCE.md](../software-docs/WEBHOOKS_JSON_REFERENCE.md)**. This folder stays **full technical reference**; use MVP docs to prioritize reading.

---

## Quick Links

| Document | Purpose | Audience | Version |
|:---------|:--------|:---------|:--------|
| [01_DEVICE_HARDWARE.md](./01_DEVICE_HARDWARE.md) | Complete hardware specifications, block diagrams, MCU, power, sensors | Hardware Engineers | v2.0 |
| [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) | **Complete API reference** — Device protocol + User/App API (40+ endpoints) | All Engineers | v3.0 |
| [03_DATA_FORMATS.md](./03_DATA_FORMATS.md) | JSON schemas for all events, DTOs, domain model, enums | All Engineers | v3.0 |
| [04_SECURITY.md](./04_SECURITY.md) | Security, encryption, JWT auth, X-API-Key, GDPR/CE MDR compliance | All Engineers | v3.0 |
| [05_TESTING.md](./05_TESTING.md) | **Complete test plan** — Hardware, API, mobile, web, E2E, CI | QA & All Engineers | v3.0 |
| [06_BUILD_GUIDE.md](./06_BUILD_GUIDE.md) | Step-by-step hardware assembly instructions | Hardware Engineers | v3.0 |
| [07_COMPONENT_SELECTION_GUIDE.md](./07_COMPONENT_SELECTION_GUIDE.md) | Component recommendations, alternatives & suppliers | Hardware & Procurement | v1.0 |
| [08_FIRMWARE_GUIDE.md](./08_FIRMWARE_GUIDE.md) | ESP32 firmware development with API client code | Firmware Engineers | v2.0 |

---

## Product Overview

### Device Family

| Device | Model | Target Users | Key Features |
|:-------|:------|:-------------|:-------------|
| **Home Device** | SMD-100 | Daily home use | 10 slots, 90-day capacity, WiFi |
| **Travel Device** | SMD-200 | Portable use | 4 slots, 14-day capacity, LTE |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         PATIENT HOME                                   │  │
│  │                                                                        │  │
│  │   ┌─────────────┐            ┌─────────────┐                          │  │
│  │   │  SMD-100    │   BLE      │  SMD-200    │                          │  │
│  │   │  Home       │◀──────────▶│  Travel     │                          │  │
│  │   │  Device     │   Sync     │  Device     │                          │  │
│  │   └──────┬──────┘            └──────┬──────┘                          │  │
│  │          │                          │                                  │  │
│  │          │ WiFi                     │ WiFi/LTE                        │  │
│  └──────────┼──────────────────────────┼──────────────────────────────────┘  │
│             │                          │                                     │
│             └──────────┬───────────────┘                                     │
│                        │ HTTPS/TLS 1.3                                      │
│                        ▼                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │               BACKEND (ASP.NET Core 8 / Clean Architecture)           │  │
│  │                                                                        │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │  Device API  │  │  User/App    │  │  Webhooks    │               │  │
│  │   │  /api/v1/*   │  │  API /api/*  │  │  API         │               │  │
│  │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │  │
│  │          │                 │                  │                        │  │
│  │          └─────────────────┼──────────────────┘                       │  │
│  │                            ▼                                           │  │
│  │   ┌──────────────────────────────────────────────────────┐            │  │
│  │   │  Application Layer (MediatR / CQRS)                  │            │  │
│  │   │  Domain Entities → EF Core → PostgreSQL / SQLite     │            │  │
│  │   └──────────────────────────────────────────────────────┘            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                        │                                                     │
│                        │ HTTPS                                              │
│                        ▼                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         CLIENT APPLICATIONS                            │  │
│  │                                                                        │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │   │   Mobile     │  │   Web        │  │   External   │               │  │
│  │   │   App        │  │   Portal     │  │   Systems    │               │  │
│  │   │ (React       │  │ (React +     │  │ (Webhooks)   │               │  │
│  │   │  Native/Expo)│  │  Vite)       │  │              │               │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Overview

### Two API Layers

| API Layer | Base Path | Auth Method | Consumers |
|:----------|:----------|:------------|:----------|
| **Device API** | `/api/v1/` | Device JWT or X-API-Key | ESP32 firmware |
| **User/App API** | `/api/` | User JWT (email/password login) | Mobile app, Web portal |

### Key Endpoints (Device API — 7 endpoints)

| Action | Method | Endpoint |
|:-------|:-------|:---------|
| Register device | POST | `/api/v1/devices/register` |
| Send heartbeat | POST | `/api/v1/devices/{id}/heartbeat` |
| Get schedule | GET | `/api/v1/devices/{id}/schedule` |
| Send event | POST | `/api/v1/events` |
| Sync inventory | POST | `/api/v1/devices/{id}/inventory` |
| Report error | POST | `/api/v1/devices/{id}/error` |
| Check firmware | GET | `/api/v1/devices/{id}/firmware` |

### Key Endpoints (User/App API — 30+ endpoints)

| Category | Endpoints |
|:---------|:----------|
| Authentication | Register, Login, Me, Profile |
| Devices | List, Get, Create, Pause, Resume, Heartbeat |
| Containers | List by device, Create, Update, Delete |
| Schedules | List by container, Create, Update, Delete, Today's schedule |
| Dispensing | Trigger, Confirm intake, Delay reminder |
| History | Get dispense events (with date filter) |
| Notifications | List, Mark as read |
| Travel | Start session, End session |
| Integrations | Webhooks CRUD, API keys CRUD, Sync, Incoming webhooks |

See [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) for the complete reference.

---

## SMD-100 Home Device Specifications

### Quick Specs

| Category | Specification |
|:---------|:--------------|
| **Dimensions** | 305 x 203 x 254 mm |
| **Weight** | 1.6 kg (empty) |
| **Slots** | 10 medication compartments |
| **Capacity** | 90 days per slot |
| **Display** | 4.3" TFT touch (800x480) |
| **MCU** | ESP32-S3-WROOM-1-N16R8 |
| **Connectivity** | WiFi 2.4/5 GHz, BLE 5.0 |
| **Power** | 12V/2A AC adapter |
| **Battery** | 5000mAh Li-ion (48h backup) |
| **Certifications** | CE Class IIa, Swissmedic |

### BOM Summary (Volume 10K)

| Category | Cost |
|:---------|-----:|
| MCU & Memory | $5.00 |
| Power Components | $8.00 |
| Display | $20.00 |
| Motors & Drivers | $12.00 |
| Sensors | $8.00 |
| Audio | $3.00 |
| PCBs | $5.00 |
| Battery | $8.00 |
| Enclosure | $14.00 |
| Assembly | $10.00 |
| Other | $7.00 |
| **Total COGS** | **$100.00** |

---

## SMD-200 Travel Device Specifications

### Quick Specs

| Category | Specification |
|:---------|:--------------|
| **Dimensions** | 152 x 102 x 76 mm |
| **Weight** | 360g (empty) |
| **Slots** | 4 medication compartments |
| **Capacity** | 14 days per slot |
| **Display** | 2.4" OLED (128x64) |
| **MCU** | ESP32-S3-MINI |
| **Connectivity** | WiFi, LTE Cat-M1, BLE 5.0 |
| **Power** | USB-C (5V/2A) |
| **Battery** | 3000mAh Li-Po (7 days) |

### BOM Summary (Volume 10K): **$62.00**

---

## Domain Model

```
User (Patient/Caregiver/Admin)
 └── Device (Main/Portable)
      ├── Container (medication slot)
      │    └── Schedule (dose times)
      │         └── DispenseEvent (dose lifecycle)
      ├── DeviceApiKey (integration auth)
      └── TravelSession (travel mode)
```

| Entity | Description |
|:-------|:------------|
| **User** | Patient, caregiver, or admin. Has devices and notifications |
| **Device** | Physical dispenser (Main=SMD-100, Portable=SMD-200) |
| **Container** | Medication slot on a device (slot number, med name, quantity) |
| **Schedule** | Recurring dose time (time of day, days of week bitmask) |
| **DispenseEvent** | Dose lifecycle: Pending → Dispensed → Confirmed/Missed/Delayed |
| **Notification** | In-app alert (missed dose, low stock, device error, etc.) |
| **TravelSession** | Links portable device to main device for a period |
| **WebhookEndpoint** | Outgoing webhook URL for external integrations |
| **DeviceApiKey** | API key for device/external system auth |

---

## Event Types Summary

| Event | Trigger | Priority |
|:------|:--------|:---------|
| `DOSE_DISPENSED` | Pills released from slot | High |
| `DOSE_TAKEN` | Pills removed from tray | High |
| `DOSE_MISSED` | Time window expired | Critical |
| `REFILL_NEEDED` | Pills < 7 days remaining | Medium |
| `REFILL_CRITICAL` | Pills < 3 days remaining | High |
| `DEVICE_ONLINE` | Connection established | Low |
| `DEVICE_OFFLINE` | Heartbeat timeout | Medium |
| `DEVICE_ERROR` | Error detected | High |
| `BATTERY_LOW` | Battery < 20% | Medium |
| `BATTERY_CRITICAL` | Battery < 5% | High |
| `TRAVEL_MODE_ON` | Travel mode activated | Medium |
| `TRAVEL_MODE_OFF` | Travel mode deactivated | Medium |

---

## Error Codes Quick Reference

| Range | Category | Examples |
|:------|:---------|:---------|
| E001-E099 | Network | WiFi disconnected, API unreachable |
| E101-E199 | Hardware | Pill jam, motor failure, sensor failure |
| E201-E299 | Power | Battery low, power lost |
| E301-E399 | Storage | Temperature/humidity out of range |
| E401-E499 | Sensor | Sensor malfunction |
| E501-E599 | Software | Firmware error |

---

## Compliance Requirements

### CE Marking (EU MDR 2017/745)

| Standard | Requirement |
|:---------|:------------|
| IEC 60601-1 | Electrical safety |
| IEC 60601-1-2 | EMC |
| IEC 62304 | Software lifecycle |
| IEC 62366-1 | Usability |
| ISO 14971 | Risk management |
| ISO 13485 | QMS |

### Data Protection

| Regulation | Requirement |
|:-----------|:------------|
| GDPR | EU data protection |
| Swiss nDSG | Swiss data protection |
| Data location | Swiss/EU servers only |

---

## Technology Stack

### Backend

| Component | Technology |
|:----------|:-----------|
| Runtime | ASP.NET Core 8 |
| Architecture | Clean Architecture + CQRS (MediatR) |
| Database | PostgreSQL (production), SQLite (development) |
| ORM | Entity Framework Core 8 |
| Auth | JWT (HS256) + X-API-Key |
| Validation | FluentValidation |
| API Docs | Swagger / OpenAPI |
| Container | Docker + docker-compose |

### Mobile App

| Component | Technology |
|:----------|:-----------|
| Framework | React Native / Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| HTTP Client | Axios |
| State | React Context |
| Notifications | Expo Notifications |

### Web Portal

| Component | Technology |
|:----------|:-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| UI Components | shadcn/ui |

### Firmware

| Component | Technology |
|:----------|:-----------|
| SDK | ESP-IDF v5.1+ |
| MCU | ESP32-S3 |
| UI Library | LVGL v8.3+ |
| RTOS | FreeRTOS |
| Language | C |

---

## Repository Structure

```
smart-medication-dispenser/
├── README.md                     # Project overview
├── INTEGRATION.md                # Integration guide
├── IMPLEMENTATION_REPORT.md      # Implementation report
├── docker-compose.yml            # Docker orchestration
│
├── backend/                      # ASP.NET Core 8 API
│   ├── src/
│   │   ├── Api/                  # Controllers, middleware
│   │   │   └── Controllers/      # 11 API controllers
│   │   ├── Application/          # CQRS handlers (MediatR)
│   │   │   ├── Auth/             # Register, Login, Me
│   │   │   ├── Devices/          # Device CRUD + heartbeat
│   │   │   ├── Containers/       # Container CRUD
│   │   │   ├── Schedules/        # Schedule CRUD + today
│   │   │   ├── Dispensing/       # Dispense, confirm, delay
│   │   │   ├── Notifications/    # Notifications list/read
│   │   │   ├── Travel/           # Start/end travel
│   │   │   ├── Integrations/     # Webhooks, API keys, sync
│   │   │   └── DTOs/             # Data transfer objects
│   │   ├── Domain/               # Entities and enums
│   │   └── Infrastructure/       # EF Core, persistence
│   └── tests/                    # xUnit test projects
│       ├── Application.Tests/    # Handler tests
│       └── Domain.Tests/         # Domain logic tests
│
├── mobile/                       # React Native / Expo
│   ├── app/                      # Expo Router pages
│   │   ├── (tabs)/               # Tab navigation
│   │   └── dose/                 # Dose detail screen
│   └── src/
│       ├── api/                  # Axios API client
│       ├── context/              # Auth context
│       └── notifications/        # Push notifications
│
├── web/                          # React + Vite portal
│   └── src/
│       ├── api/                  # Axios API client
│       ├── pages/                # 11 page components
│       ├── components/           # Shared components
│       ├── app/components/ui/    # shadcn/ui components
│       ├── contexts/             # Auth context
│       └── styles/               # CSS themes
│
├── technical-docs/               # Technical documentation (you are here)
│   ├── 01_DEVICE_HARDWARE.md
│   ├── 02_API_INTEGRATION.md     # Complete API reference
│   ├── 03_DATA_FORMATS.md        # JSON schemas & DTOs
│   ├── 04_SECURITY.md            # Security & compliance
│   ├── 05_TESTING.md             # Complete test plan
│   ├── 06_BUILD_GUIDE.md         # Hardware assembly
│   ├── 07_COMPONENT_SELECTION_GUIDE.md
│   ├── 08_FIRMWARE_GUIDE.md      # ESP32 firmware guide
│   └── README.md                 # This file
│
├── business-docs/                # Business documentation
├── presentation/                 # Investor & engineering presentations
└── web design/                   # Design system & prototypes
```

---

## Getting Started

### For Hardware Engineers

1. Read [01_DEVICE_HARDWARE.md](./01_DEVICE_HARDWARE.md) for complete specifications
2. Read [07_COMPONENT_SELECTION_GUIDE.md](./07_COMPONENT_SELECTION_GUIDE.md) for component choices
3. Read [06_BUILD_GUIDE.md](./06_BUILD_GUIDE.md) for assembly instructions
4. Read [05_TESTING.md](./05_TESTING.md) Sections 1-12 for hardware test procedures

### For Firmware Engineers

1. Read [01_DEVICE_HARDWARE.md](./01_DEVICE_HARDWARE.md) for pin mappings
2. Read [08_FIRMWARE_GUIDE.md](./08_FIRMWARE_GUIDE.md) for ESP32 development
3. Read [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) Part 1 (Sections 1-10) for Device API
4. Read [03_DATA_FORMATS.md](./03_DATA_FORMATS.md) Part 1 (Sections 1-8) for event schemas
5. Read [04_SECURITY.md](./04_SECURITY.md) for security requirements

### For Backend Engineers

1. Read [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) Part 2 (Sections 11-20) for User/App API
2. Read [03_DATA_FORMATS.md](./03_DATA_FORMATS.md) Part 2 (Sections 9-11) for DTOs and domain model
3. Read [04_SECURITY.md](./04_SECURITY.md) Sections 3.4-3.5 for JWT and X-API-Key auth
4. Read [05_TESTING.md](./05_TESTING.md) Section 14 for backend test plan

### For Mobile / Web Engineers

1. Read [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) Part 2 (Sections 11-19) for all API endpoints
2. Read [03_DATA_FORMATS.md](./03_DATA_FORMATS.md) Part 2 (Section 10) for DTO schemas
3. Read [05_TESTING.md](./05_TESTING.md) Sections 15-18 for frontend test plan

### For QA Engineers

1. Read [05_TESTING.md](./05_TESTING.md) — Full test plan (hardware + software)
2. Read [02_API_INTEGRATION.md](./02_API_INTEGRATION.md) — All API endpoints
3. Read [03_DATA_FORMATS.md](./03_DATA_FORMATS.md) — Expected data formats
4. Read [04_SECURITY.md](./04_SECURITY.md) Section 11 — Security testing schedule

### For Procurement

1. Read [07_COMPONENT_SELECTION_GUIDE.md](./07_COMPONENT_SELECTION_GUIDE.md) for component recommendations
2. Review BOMs in hardware document
3. Contact suppliers listed in component guide

---

## Running the System Locally

### Backend API

```bash
cd backend
dotnet restore
dotnet run --project src/Api/
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### With Docker

```bash
docker compose up -d
# API at http://localhost:5000
# PostgreSQL at localhost:5432
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Web Portal

```bash
cd web
npm install
npm run dev
# Portal at http://localhost:5173
```

---

## Contact

| Team | Contact |
|:-----|:--------|
| Hardware | hardware@smartdispenser.ch |
| Firmware | firmware@smartdispenser.ch |
| Backend API | backend@smartdispenser.ch |
| Mobile/Web | frontend@smartdispenser.ch |
| QA | qa@smartdispenser.ch |
| Procurement | procurement@smartdispenser.ch |

---

## Document Updates

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | Jan 2026 | Initial release |
| 2.0 | Feb 2026 | Expanded all documents |
| 3.0 | Feb 2026 | Added Component Selection Guide, enhanced Build Guide and Hardware specs |
| 4.0 | Feb 2026 | Major update: Complete API reference (40+ endpoints), user-facing DTOs, software testing, domain model documentation, dual API architecture, codebase alignment |
