# Software Documentation

**Smart Medication Dispenser — Complete Software Engineering Reference**

**Designed and Engineered in Lausanne, Switzerland**

---

## MVP (start here)

The full catalog below includes **roadmap, compliance, and enterprise** material. For day-to-day MVP work use:

| Doc | Purpose |
|:----|:--------|
| [MVP_APPLICATION.md](./MVP_APPLICATION.md) | What is in/out of MVP; minimal reading list |
| [WEBHOOKS_JSON_REFERENCE.md](./WEBHOOKS_JSON_REFERENCE.md) | Webhooks + JSON (MVP cheat sheet) |
| [../INTEGRATION.md](../INTEGRATION.md) | External integration steps |
| [../README.md](../README.md) | Run the stack, demo users |

Everything else in this folder is **extended reference** (use when you need depth, audits, or hardware protocol details).

---

## Quick Links (full catalog)

| Document | Purpose | Audience | Version |
|:---------|:--------|:---------|:--------|
| [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md) | Clean Architecture, CQRS, caching, events, background jobs, roadmap | All Engineers | v2.1 |
| [02_BACKEND_API.md](./02_BACKEND_API.md) | All endpoints, OTA workflow, device provisioning, travel mode, caregiver mgmt | Backend Engineers | v2.1 |
| [03_DATABASE.md](./03_DATABASE.md) | EF Core schema, indexing strategy, backup/recovery, data retention, monitoring | Backend Engineers | v2.0 |
| [04_CLOUD_DEPLOYMENT.md](./04_CLOUD_DEPLOYMENT.md) | Docker, CI/CD pipeline, secrets management, auto-scaling, disaster recovery | DevOps & Backend | v2.0 |
| [05_WEB_PORTAL.md](./05_WEB_PORTAL.md) | React portal — state management, component architecture, i18n, a11y, testing | Frontend Engineers | v2.1 |
| [06_MOBILE_APP.md](./06_MOBILE_APP.md) | React Native — state management, deep linking, push, offline, biometric, roadmap | Mobile Engineers | v2.1 |
| [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) | JWT, MFA, password reset, device auth, sessions, detailed RBAC matrix | All Engineers | v2.1 |
| [08_INTEGRATIONS_WEBHOOKS.md](./08_INTEGRATIONS_WEBHOOKS.md) | Webhooks with retry, FHIR, pharmacy/insurer integration, monitoring | All Engineers | v2.0 |
| [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md) | Application & fleet monitoring, alerting, logging, dashboards, SLA tracking | DevOps & All | v1.0 |
| [10_NOTIFICATION_SYSTEM.md](./10_NOTIFICATION_SYSTEM.md) | Push notifications, email, SMS, caregiver escalation, device alerts | All Engineers | v1.0 |
| [11_INTERNATIONALIZATION.md](./11_INTERNATIONALIZATION.md) | Multi-language (FR/DE/IT/EN) across web, mobile, backend, firmware | All Engineers | v1.0 |
| [12_COMPLIANCE_DATA_GOVERNANCE.md](./12_COMPLIANCE_DATA_GOVERNANCE.md) | GDPR, nDSG, CE MDR, security testing, audit trail, billing architecture | All Engineers | v2.1 |
| [13_ERROR_CODES_REFERENCE.md](./13_ERROR_CODES_REFERENCE.md) | Complete 47-code catalog: network, hardware, power, storage, software errors | All Engineers | v1.0 |
| [14_DEVICE_CLOUD_PROTOCOL.md](./14_DEVICE_CLOUD_PROTOCOL.md) | Firmware-cloud protocol, OTA updates, offline mode, heartbeat commands, events | Firmware & Backend | v1.0 |
| [15_TESTING_STRATEGY.md](./15_TESTING_STRATEGY.md) | Test IDs (130+), load testing, security testing, a11y testing, CI/CD gates | QA & All Engineers | v1.0 |
| [16_DOCUMENTATION_STRATEGY.md](./16_DOCUMENTATION_STRATEGY.md) | Documentation strategy, gap analysis, action plan, templates, tooling, governance | All Teams & Auditors | v1.0 |

---

## Software Platform Overview

The Smart Medication Dispenser platform is a **full-stack monorepo** comprising a backend API, web portal, mobile app, and device firmware integration layer. It manages medication dispensing, patient adherence tracking, caregiver notifications, and device-cloud communication.

### System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SMART MEDICATION DISPENSER PLATFORM                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   ESP32       │   │   Mobile     │   │   Web        │   │   External   │ │
│  │   Firmware    │   │   App        │   │   Portal     │   │   Systems    │ │
│  │   (Device)    │   │  (Patient)   │   │ (Caregiver)  │   │  (Webhooks)  │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│         │ Device API        │ User API          │ User API         │ X-API   │
│         │ /api/v1/*         │ /api/*            │ /api/*           │ Key     │
│         └──────────────────┬┴──────────────────┬┴──────────────────┘        │
│                            │                   │                             │
│                            ▼                   ▼                             │
│         ┌──────────────────────────────────────────────────────────┐        │
│         │           ASP.NET Core 8 Web API                         │        │
│         │    ┌────────────────────────────────────────────┐        │        │
│         │    │   API Layer (Controllers + Middleware)      │        │        │
│         │    │   13 Controllers • Global Exception Handler │        │        │
│         │    └────────────────────┬───────────────────────┘        │        │
│         │                        │ MediatR                         │        │
│         │    ┌────────────────────▼───────────────────────┐        │        │
│         │    │   Application Layer (CQRS Handlers)        │        │        │
│         │    │   Commands • Queries • DTOs • Validators   │        │        │
│         │    └────────────────────┬───────────────────────┘        │        │
│         │                        │ Interfaces                      │        │
│         │    ┌────────────────────▼───────────────────────┐        │        │
│         │    │   Domain Layer (Entities + Enums)           │        │        │
│         │    │   11 Entities • 6 Enums + 1 Const Class    │        │        │
│         │    └────────────────────────────────────────────┘        │        │
│         │                        ▲                                  │        │
│         │    ┌────────────────────┴───────────────────────┐        │        │
│         │    │   Infrastructure Layer                      │        │        │
│         │    │   EF Core • Repos • JWT • Webhooks • Jobs  │        │        │
│         │    └────────────────────┬───────────────────────┘        │        │
│         └────────────────────────┼─────────────────────────────────┘        │
│                                  │                                           │
│                                  ▼                                           │
│         ┌──────────────────────────────────────────────────────────┐        │
│         │   PostgreSQL (Production) / SQLite (Development)         │        │
│         │   11 Tables • Full Relational Model • EF Migrations      │        │
│         └──────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Backend API** | ASP.NET Core | 8.0 | REST API server |
| **Architecture** | Clean Architecture + CQRS | — | Separation of concerns |
| **Mediator** | MediatR | 12.2.0 | Command/Query dispatching |
| **Validation** | FluentValidation | 11.9.0 | Request validation |
| **ORM** | Entity Framework Core | 8.0.10 | Database access |
| **Database (prod)** | PostgreSQL | 15+ | Relational data store |
| **Database (dev)** | SQLite | — | Local development |
| **Auth** | JWT (HS256) + BCrypt | — | Authentication & password hashing |
| **Web Portal** | React + TypeScript | 18.3.1 | Caregiver/admin dashboard |
| **Build Tool** | Vite | 5.4.10 | Fast frontend bundling |
| **CSS** | Tailwind CSS | 3.4.14 | Utility-first styling |
| **UI Components** | shadcn/ui (Radix UI) | — | Accessible component library |
| **Charts** | Recharts | 3.7.0 | Dashboard data visualization |
| **Animations** | Motion (Framer Motion) | 12.31.0 | Page transitions & micro-interactions |
| **Form Validation** | React Hook Form + Zod | 7.53.2 / 3.23.8 | Client-side form validation |
| **Mobile App** | React Native / Expo | 0.76.5 / ~52.0.0 | Patient mobile application |
| **Navigation** | Expo Router | ~4.0.0 | File-based routing |
| **Token Storage** | AsyncStorage | 1.23.1 | Persistent mobile token storage |
| **HTTP Client** | Axios | 1.7.7 | API communication |
| **Containerization** | Docker + Docker Compose | — | Deployment orchestration |

### Domain Model

```
User (Patient / Caregiver / Admin)
 ├── Device (Main = SMD-100 / Portable = SMD-200)
 │    ├── Container (medication slot)
 │    │    └── Schedule (recurring dose time)
 │    │         └── DispenseEvent (dose lifecycle)
 │    ├── DeviceApiKey (machine-to-machine auth)
 │    └── DeviceEventLog (raw device telemetry)
 ├── Notification (in-app alerts)
 ├── WebhookEndpoint (outgoing event delivery)
 └── TravelSession (links Main ↔ Portable devices)
```

### User Roles

| Role | Access | Primary Use |
|:-----|:-------|:------------|
| **Patient** | Own devices, confirm doses, view history | Daily medication management |
| **Caregiver** | Monitor assigned patients, receive alerts | Remote care oversight |
| **Admin** | Full system access | Platform administration |

### Key Business Flows

| Flow | Description |
|:-----|:------------|
| **Dose Lifecycle** | Schedule → Dispense → Confirm (taken) or Miss (60 min timeout) |
| **Inventory Tracking** | Container quantity decrements on confirm; low stock alerts auto-generated |
| **Travel Mode** | Link portable device to main device; copy containers for trip duration |
| **Missed Dose Detection** | Background job every 5 min; marks overdue events as Missed; notifies patient + caregiver |
| **Webhook Delivery** | On dispense.confirmed, missed_dose, low_stock → POST to registered URLs |

---

## Repository Structure

```
smart-medication-dispenser/
├── README.md                        # Project overview
├── INTEGRATION.md                   # External integration guide
├── IMPLEMENTATION_REPORT.md         # Implementation report
├── docker-compose.yml               # Docker orchestration
│
├── backend/                         # ASP.NET Core 8 API
│   ├── SmartMedicationDispenser.sln # Solution file
│   ├── src/
│   │   ├── Api/                     # REST controllers & middleware
│   │   ├── Application/             # CQRS handlers, DTOs, validators
│   │   ├── Domain/                  # Entities & enums (no dependencies)
│   │   └── Infrastructure/          # EF Core, repositories, services
│   └── tests/
│       ├── Application.Tests/       # Handler unit tests
│       └── Domain.Tests/            # Domain logic tests
│
├── web/                             # React + Vite caregiver portal
│   └── src/
│       ├── api/                     # Axios API client
│       ├── pages/                   # 11 page components
│       ├── components/              # Layout & ProtectedRoute
│       ├── app/components/ui/       # shadcn/ui components
│       ├── contexts/                # Auth context provider
│       └── styles/                  # Theme & responsive CSS
│
├── mobile/                          # React Native / Expo patient app
│   ├── app/                         # Expo Router pages
│   │   ├── (tabs)/                  # Tab navigation screens
│   │   └── dose/                    # Dose detail / confirmation
│   └── src/
│       ├── api/                     # Axios API client
│       ├── context/                 # Auth context
│       └── notifications/           # Local push notifications
│
├── software-docs/                   # Software documentation (this folder)
├── technical-docs/                  # Hardware & firmware documentation
├── business-docs/                   # Business & market documentation
├── presentation/                    # Investor & engineering presentations
└── web design/                      # Design system & prototypes
```

---

## Quick Start for Developers

### Prerequisites

| Tool | Version | Purpose |
|:-----|:--------|:--------|
| .NET SDK | 8.0+ | Backend API development |
| Node.js | 18+ | Web portal & mobile app |
| Docker & Docker Compose | Latest | Containerized deployment |
| Expo CLI | Latest | Mobile app development |
| PostgreSQL | 15+ | Production database (or use Docker) |

### Running the Full Stack

```bash
# 1. Start backend + database with Docker
cd smart-medication-dispenser
docker-compose up -d
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
# PostgreSQL: localhost:5432

# 2. Start web portal
cd web
cp .env.example .env
npm install
npm run dev
# Web: http://localhost:5173

# 3. Start mobile app
cd mobile
cp .env.example .env
npm install
npx expo start
# Scan QR with Expo Go
```

### Demo Credentials (Auto-Seeded)

| Role | Email | Password |
|:-----|:------|:---------|
| Patient | patient@demo.com | Demo123! |
| Caregiver | caregiver@demo.com | Demo123! |
| Admin | admin@demo.com | Demo123! |

---

## Getting Started by Role

### For Backend Engineers

1. [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md) — Understand the Clean Architecture layers
2. [02_BACKEND_API.md](./02_BACKEND_API.md) — All controllers, handlers, and middleware
3. [03_DATABASE.md](./03_DATABASE.md) — Schema, relationships, migrations
4. [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) — JWT auth and API key system

### For Frontend Engineers (Web)

1. [05_WEB_PORTAL.md](./05_WEB_PORTAL.md) — React + Vite portal guide
2. [02_BACKEND_API.md](./02_BACKEND_API.md) — API endpoints you'll consume
3. [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) — Login flow and token management

### For Mobile Engineers

1. [06_MOBILE_APP.md](./06_MOBILE_APP.md) — Expo / React Native guide
2. [02_BACKEND_API.md](./02_BACKEND_API.md) — API endpoints for mobile
3. [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) — Mobile auth token handling

### For DevOps Engineers

1. [04_CLOUD_DEPLOYMENT.md](./04_CLOUD_DEPLOYMENT.md) — Docker, CI/CD, secrets, auto-scaling
2. [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md) — Monitoring, alerting, dashboards
3. [03_DATABASE.md](./03_DATABASE.md) — Migration management, backup strategy
4. [08_INTEGRATIONS_WEBHOOKS.md](./08_INTEGRATIONS_WEBHOOKS.md) — External system integration

### For Firmware Engineers

1. [14_DEVICE_CLOUD_PROTOCOL.md](./14_DEVICE_CLOUD_PROTOCOL.md) — Complete firmware-cloud protocol
2. [13_ERROR_CODES_REFERENCE.md](./13_ERROR_CODES_REFERENCE.md) — All 47 error codes with handling
3. [02_BACKEND_API.md](./02_BACKEND_API.md) — Device API endpoints and OTA workflow
4. [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) — Device authentication and token management

### For QA Engineers

1. [15_TESTING_STRATEGY.md](./15_TESTING_STRATEGY.md) — All test IDs, load testing, security testing
2. [13_ERROR_CODES_REFERENCE.md](./13_ERROR_CODES_REFERENCE.md) — Error scenarios to test
3. [02_BACKEND_API.md](./02_BACKEND_API.md) — API endpoint reference for test cases

### For Compliance & Regulatory

1. [12_COMPLIANCE_DATA_GOVERNANCE.md](./12_COMPLIANCE_DATA_GOVERNANCE.md) — GDPR, nDSG, CE MDR, IEC 62304, security testing
2. [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) — Security architecture, MFA, RBAC matrix
3. [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md) — Audit logging, SLA monitoring
4. [11_INTERNATIONALIZATION.md](./11_INTERNATIONALIZATION.md) — Swiss language requirements
5. [15_TESTING_STRATEGY.md](./15_TESTING_STRATEGY.md) — IEC 62304 regulatory testing
6. [16_DOCUMENTATION_STRATEGY.md](./16_DOCUMENTATION_STRATEGY.md) — Gap analysis, audit evidence workflows, controlled docs register

### For Project Management & Tech Leads

1. [16_DOCUMENTATION_STRATEGY.md](./16_DOCUMENTATION_STRATEGY.md) — Documentation completeness roadmap, action plan, templates
2. [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md) — Architecture overview and quality attributes
3. [12_COMPLIANCE_DATA_GOVERNANCE.md](./12_COMPLIANCE_DATA_GOVERNANCE.md) — Regulatory compliance overview
4. [15_TESTING_STRATEGY.md](./15_TESTING_STRATEGY.md) — QA strategy and test coverage

---

## Contact

| Team | Contact |
|:-----|:--------|
| Backend API | backend@smartdispenser.ch |
| Frontend (Web/Mobile) | frontend@smartdispenser.ch |
| DevOps | devops@smartdispenser.ch |
| QA | qa@smartdispenser.ch |

---

## Document History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | February 2026 | Initial software documentation — architecture, backend, database, cloud, web, mobile, auth, integrations |
| 2.0 | February 2026 | Major enhancement: Added monitoring, notifications, i18n, compliance docs (09-12). Enhanced all 8 existing docs with caching, performance, CI/CD, testing, accessibility, rate limiting, pagination, indexing, backup/recovery, token refresh, MFA, FHIR integration. |
| 2.1 | February 2026 | Added error codes reference (13), device-cloud protocol (14), testing strategy (15). Enhanced docs 01/02/05/06/07/12 with: event schemas, background jobs inventory, OTA workflow, device provisioning, travel mode details, caregiver management, state management, component architecture, deep linking, RBAC permission matrix, security testing, audit trail, subscription architecture. 15 documents, ~18,000+ lines total. |
| 2.2 | February 2026 | Added documentation strategy & gap analysis (16): information architecture (Diátaxis + ISO 15289), comprehensive gap analysis with mapping table, prioritized action plan with timelines, drop-in templates (OpenAPI, architecture, runbook, user guide, onboarding, test plan), tooling recommendations (MkDocs, Spectral, Vale, Mermaid), CI pipeline blueprint, governance model, and documentation completion roadmap. Updated PDF generator to include all 16 documents. |
