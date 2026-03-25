# Webhooks & JSON (MVP)

Minimal reference: register a callback, or push events into the API. **Overall MVP scope:** [MVP_APPLICATION.md](./MVP_APPLICATION.md).

---

## Outgoing — we POST to your URL

**Setup:** Portal → Integrations, or `POST /api/integrations/webhooks` (JWT) with `{ "url", "secret?", "description?" }`.

**Request:** `POST`, `Content-Type: application/json`, ~10s timeout. Headers: `X-Webhook-Event: dispenser.event`, optional `X-Webhook-Signature: sha256=<HMAC-SHA256(body, secret)>`.

**Payloads**

| eventType | When | JSON |
|-----------|------|------|
| `dispense.confirmed` | User confirms dose in app | Same envelope as other events: `eventType`, `timestampUtc`, `data`: `{ dispenseEventId, deviceId, containerId, scheduleId, medicationName, pillsPerDose }` |
| `notification.missed_dose` | Missed dose (background job) | `{ "eventType", "timestampUtc", "data": { "dispenseEventId", "deviceId" } }` — caregiver copy may add `"role": "caregiver"` inside `data` |
| `notification.low_stock` | Stock below threshold | `{ "eventType", "timestampUtc", "data": { "containerId", "deviceId", "medicationName", "quantity" } }` |
| `device.*` | Device events via `/api/v1/events` | `{ "eventType": "device.dose_taken", "timestampUtc", "data": { ... } }` — `data` is passthrough from device |

Example — confirmed dose:

```json
{
  "eventType": "dispense.confirmed",
  "timestampUtc": "2026-02-10T08:05:00Z",
  "data": {
    "dispenseEventId": "...",
    "deviceId": "...",
    "containerId": "...",
    "scheduleId": "...",
    "medicationName": "Metformin 500mg",
    "pillsPerDose": 2
  }
}
```

Example — missed / low stock (wrapped):

```json
{
  "eventType": "notification.missed_dose",
  "timestampUtc": "2026-02-10T09:00:00Z",
  "data": { "dispenseEventId": "...", "deviceId": "..." }
}
```

**MVP caveat:** No retries; failures are logged / last status on the endpoint only.

---

## Incoming — you POST to us

`POST /api/webhooks/incoming` + header `X-API-Key: <device key>`. Body:

```json
{ "eventType": "heartbeat", "deviceId": "optional", "data": {} }
```

`eventType` is case-insensitive. Omit `deviceId` unless it must match the key’s device.

**MVP use**

| eventType | data (MVP) |
|-----------|------------|
| `heartbeat` | `{}` or optional telemetry: `battery`, `wifi_signal`, `temperature`, `humidity`, `firmware` |
| `dispense_completed` | `{ "containerId": "<guid>", "scheduleId": "<guid>" }` |

Success → `202`. Bad key → `401`. Wrong `deviceId` → `403`. Unknown/failed → `400`.

Full list (non-MVP): same handler supports `DOSE_*`, `REFILL_*`, `DEVICE_*`, `BATTERY_*`, `TRAVEL_MODE_*`, `LOW_STOCK`, `device_status`, etc. — see backend `ProcessIncomingWebhookCommandHandler` when you need more.

---

## One-liners

- **API key:** Create under Integrations for a device (JWT); use only in `X-API-Key` for incoming webhooks.
- **Bulk push:** `POST /api/integrations/sync` + `X-API-Key` — see `08_INTEGRATIONS_WEBHOOKS.md` if you outgrow single events.
