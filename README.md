# Smart Medication Dispenser Platform

A production-grade MVP platform combining a physical medication dispensing device, mobile app for patients, and web portal for caregivers/admins. The system actively dispenses medication, requires intake confirmation, tracks inventory per container, and supports travel mode with a portable device.

**MVP scope (features vs docs):** [software-docs/MVP_APPLICATION.md](software-docs/MVP_APPLICATION.md) — use this to ignore roadmap-heavy sections in long-form documentation.

### MVP implementation (what is wired up)

| Area | Details |
|------|---------|
| **Docs** | [MVP_APPLICATION.md](software-docs/MVP_APPLICATION.md), [WEBHOOKS_JSON_REFERENCE.md](software-docs/WEBHOOKS_JSON_REFERENCE.md), [INTEGRATION.md](INTEGRATION.md), [MVP_BUSINESS_SUMMARY.md](business-docs/MVP_BUSINESS_SUMMARY.md) |
| **API** | `Mvp` in `appsettings` / env; `GET /health` (and other health routes) return `mvp` + `mvpLabel`; Docker Compose sets `Mvp__Enabled` / `Mvp__Label` |
| **Webhooks** | Outgoing payloads use `{ eventType, timestampUtc, data }` for all types (including `dispense.confirmed`) |
| **Web** | `VITE_MVP_MODE` in `.env` — header badge when `true` (see `web/.env.example`) |
| **Mobile** | `EXPO_PUBLIC_MVP_MODE` — MVP pill in tab headers when `true` (see `mobile/.env.example`) |
| **HTML bundles** | [Software_Documentation_Complete.html](software-docs/Software_Documentation_Complete.html) and [Technical_Documentation_Complete.html](technical-docs/Technical_Documentation_Complete.html) updated for webhook + API key shapes |

## Architecture (Text Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMART MEDICATION DISPENSER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Physical   │   │   Mobile     │   │   Web        │   │   Portable   │  │
│  │   Device     │   │   App        │   │   Portal     │   │   Device     │  │
│  │   (API client)│   │   (Patient)  │   │ (Caregiver)  │   │   (Travel)   │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                  │                  │                  │          │
│         └──────────────────┼──────────────────┼──────────────────┘          │
│                            │                  │                              │
│                            ▼                  ▼                              │
│                   ┌─────────────────────────────────┐                        │
│                   │   ASP.NET Core 8 Web API         │                        │
│                   │   (Clean Architecture)          │                        │
│                   │   JWT • FluentValidation • EF   │                        │
│                   └────────────────┬────────────────┘                        │
│                                    │                                         │
│                                    ▼                                         │
│                   ┌─────────────────────────────────┐                        │
│                   │   PostgreSQL                     │                        │
│                   └─────────────────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Roles:** Patient | Caregiver | Admin  
**Devices:** Main (home) | Portable (travel) — status: Active | Paused  
**Flow:** Schedule → Dispense → Confirm → Decrement inventory. Missed after 60 min → notify patient + caregiver.

---

## Prerequisites

- **Backend:** .NET 8 SDK
- **Web:** Node.js 18+
- **Mobile:** Node.js 18+, Expo CLI, iOS Simulator / Android Emulator or device
- **Docker:** Docker & Docker Compose (for API + DB)

---

## How to Run

### Option A: Docker (Backend + Database)

From the monorepo root:

```bash
cd smart-medication-dispenser
docker-compose up -d
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- PostgreSQL: localhost:5432 (user: `dispenser`, db: `dispenser`)

Then run web and mobile locally (see below).

### Option B: Backend Locally (no Docker)

1. **Database:** Start PostgreSQL and create database `dispenser` (or use Docker for DB only: `docker-compose up -d db`).

2. **Backend:**

   ```bash
   cd backend
   dotnet restore
   dotnet run --project src/Api
   ```

   Set environment variables (or use `appsettings.Development.json`):

   - `ConnectionStrings__DefaultConnection` — PostgreSQL connection string  
   - `Jwt__SecretKey` — at least 32 chars for JWT signing  
   - `Jwt__Issuer` / `Jwt__Audience` — optional

3. **Apply migrations:**

   ```bash
   cd backend
   dotnet ef database update --project src/Infrastructure --startup-project src/Api
   ```

### Web App

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. Use demo credentials to log in (see below).

### Mobile App

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

Scan QR code with Expo Go, or run on simulator/emulator. Use demo credentials.

---

## Demo Credentials (Seed Data)

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Patient  | patient@demo.com   | Demo123!   |
| Caregiver| caregiver@demo.com | Demo123!   |
| Admin    | admin@demo.com     | Demo123!   |

Seed creates: demo patient, caregiver, main device, portable device, sample containers and schedules. See `backend/README.md` for details.

---

## Project Layout

| Path              | Description                                  |
|-------------------|----------------------------------------------|
| `backend/`        | ASP.NET Core 8 Web API (Clean Architecture)  |
| `web/`            | React + TypeScript (Vite) caregiver portal   |
| `mobile/`         | React Native (Expo) patient app              |
| `docker-compose.yml` | API + PostgreSQL                        |

---

## Known Limitations (MVP)

See [software-docs/MVP_APPLICATION.md](software-docs/MVP_APPLICATION.md) for what is intentionally **out of scope** in docs vs code.

- Physical device is represented as an API client (no real hardware).
- Notifications: web uses in-app only; mobile uses Expo local notifications (no push server).
- Travel mode: max 14 days; portable containers reference source container IDs (copy-on-start).
- Adherence is computed from dispense events (confirmed = taken; missed = not confirmed in time).
- Single tenant (no multi-organization support yet).

---

## Source control & GitHub

Git is initialized in this folder with `main` and an initial commit. **Creating the GitHub remote** requires your account: follow **[GITHUB_SETUP.md](GITHUB_SETUP.md)** (HTTPS/SSH push + optional `gh` CLI). After you push, **[CI](.github/workflows/ci-backend-tests-web-build.yml)** runs backend tests and a web production build. See **[.github/workflows/README.md](.github/workflows/README.md)** for all workflows. **[Dependabot](.github/dependabot.yml)** opens weekly update PRs for GitHub Actions and npm (web + mobile).

## Azure (optional MVP hosting)

Bicep + workflows provision a **single resource group** with **Linux App Service B1**, **PostgreSQL Flexible B1ms**, and **Static Web Apps Free**. See **[azure/README.md](azure/README.md)** and workflows **[azure-provision-infrastructure.yml](.github/workflows/azure-provision-infrastructure.yml)** (provision) and **[azure-deploy-api-static-web.yml](.github/workflows/azure-deploy-api-static-web.yml)** (deploy API + web). You must use **your** Azure subscription and secrets; nothing is uploaded automatically without you running those workflows.

---

## Next Steps

- Add push notifications (FCM/APNs) for mobile.
- Implement device provisioning and API keys for physical devices.
- Add reporting/export for adherence and inventory.
- Extend travel mode with sync-back of remaining quantities.
- Add audit logging and rate limiting for production hardening.
