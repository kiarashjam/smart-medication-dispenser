# Business summary (MVP)

Short counterpart to `Business_Documentation_Complete.html` for **MVP conversations** only.

## Problem

Patients miss doses; caregivers lack a simple view of adherence and device status.

## Product (MVP)

- **Smart dispenser (logical device)** tied to schedules and inventory per medication slot.  
- **Patient mobile app:** today’s doses, confirm intake, basic history and notifications.  
- **Caregiver web portal:** devices, schedules, history, travel mode, integrations (webhooks / API keys).  
- **Cloud API:** auth, dispensing lifecycle, notifications, optional **outgoing webhooks** and **incoming** events from hardware or a middle tier.

## Not in MVP pitch deck detail

Regulatory filings, insurer integrations, pharmacy system sync, full FHIR — treat as **phase 2+** unless separately funded.

## Technical MVP pointer

- [../software-docs/MVP_APPLICATION.md](../software-docs/MVP_APPLICATION.md) — product vs doc scope  
- [../software-docs/WEBHOOKS_JSON_REFERENCE.md](../software-docs/WEBHOOKS_JSON_REFERENCE.md) — integration JSON  
- [../README.md](../README.md) — full MVP implementation checklist (health, Docker, web/mobile flags)
