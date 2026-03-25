# MVP Application Scope

Single definition of what the **Smart Medication Dispenser** monorepo ships as MVP versus documentation or roadmap noise.

---

## In scope (MVP product)

| Area | What ships |
|------|------------|
| **Backend** | JWT auth, users (patient/caregiver/admin), devices, containers, schedules, dispense / confirm / delay / miss (job), notifications, travel sessions, integrations (webhooks, device API keys, incoming webhook, sync), device API (`/api/v1/*`), adherence query |
| **Web** | Login/register, dashboard, devices, device detail, containers, schedules, history, travel, notifications, integrations, settings |
| **Mobile** | Login/register, home + today’s schedule, dose flow (dispense/confirm), devices, history, notifications |
| **Integrations** | Outgoing webhooks (no retry), incoming webhook + optional sync, HMAC signature optional |

**Core flow:** schedule → dispense → patient confirms → inventory decrements; missed dose after timeout → notification + webhook; low stock job → notification + webhook.

**Runtime:** Configure `Mvp` in `appsettings` (`Enabled`, `Label`). Public `GET /health` and related health endpoints return `mvp` and `mvpLabel` for clients. Web: set `VITE_MVP_MODE=true` in `.env` to show an MVP indicator in the portal header.

---

## Out of scope for MVP (docs may still describe)

Treat these as **future / compliance / enterprise** unless implemented in code:

- Webhook retry queues, delivery logs, auto-disable after N failures  
- FHIR, pharmacy PMS, insurer exports  
- Full push (FCM/APNs) — mobile uses local notifications in demo  
- MFA, full RBAC matrix as production hardening  
- Multi-tenant orgs, billing, advanced observability SLAs  
- Full i18n rollout (infra may exist; not required for MVP demo)  
- “Complete” HTML bundles — use this file + [WEBHOOKS_JSON_REFERENCE.md](./WEBHOOKS_JSON_REFERENCE.md) for day-to-day MVP work  

---

## Minimum doc set (MVP)

1. This file — scope  
2. [WEBHOOKS_JSON_REFERENCE.md](./WEBHOOKS_JSON_REFERENCE.md) — integration JSON  
3. [../INTEGRATION.md](../INTEGRATION.md) — integration steps  
4. Root [../README.md](../README.md) — run & demo users  

Add **02_BACKEND_API** or Swagger when you need every endpoint; add **14_DEVICE_CLOUD_PROTOCOL** when wiring firmware.

---

## Where things live

| Piece | Path |
|-------|------|
| API | `backend/src/Api` |
| Web | `web/src` (routes in `App.tsx`) |
| Mobile | `mobile/app`, `mobile/src` |
| Docker | `docker-compose.yml` (repo root) |

---

## Alignment rule

If a **software-doc** describes behavior you cannot find in **backend + web + mobile**, assume **post-MVP** or **aspirational** until the code matches.
