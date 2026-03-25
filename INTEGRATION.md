# Smart Medication Dispenser – Integration Guide (MVP)

This document describes how to integrate the application with external systems (cloud, dispenser hardware) using **webhooks** and **API keys**. For exact JSON shapes and headers, see [software-docs/WEBHOOKS_JSON_REFERENCE.md](software-docs/WEBHOOKS_JSON_REFERENCE.md). For overall MVP boundaries, see [software-docs/MVP_APPLICATION.md](software-docs/MVP_APPLICATION.md).

## Overview

- **Outgoing webhooks**: Your server URL is called when events happen (dose confirmed, missed dose, low stock). You can add these in the web app under **Integrations**.
- **Device API keys**: Create a key per device; use it in the `X-API-Key` header to call the **incoming webhook** and **sync** endpoints from your cloud or hardware.
- **Incoming webhook**: External systems POST events (heartbeat, dispense_completed, low_stock, device_status) to the API.
- **Sync**: Bulk push device status and dispense events from the cloud.

---

## 1. Create a device API key

1. Log in to the **web app**.
2. Go to **Integrations**.
3. Under **Device API keys**, select a device and click **Create API key**.
4. Copy the key (e.g. `sk_...`) and store it securely; **it is only shown once**.

Use this key in the `X-API-Key` header for all requests below.

---

## 2. Incoming webhook (receive events from cloud/hardware)

**Endpoint:** `POST /api/webhooks/incoming`  
**Auth:** `X-API-Key: <your-device-api-key>`

**Body:**

```json
{
  "eventType": "heartbeat",
  "deviceId": "optional-override-guid",
  "data": {}
}
```

**Supported `eventType` values:**

| eventType           | Description                    | `data` (optional) |
|---------------------|--------------------------------|-------------------|
| `heartbeat`         | Update device last seen time   | —                 |
| `device_status`     | Set device status              | `{ "status": "Active" \| "Paused" }` |
| `dispense_completed`| Record a dispense              | `{ "containerId": "<guid>", "scheduleId": "<guid>" }` |
| `low_stock`         | Create low-stock notification  | `{ "containerId": "<guid>", "message": "Optional text" }` |

**Example (heartbeat):**

```bash
curl -X POST https://your-api/api/webhooks/incoming \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key" \
  -d '{"eventType":"heartbeat","data":{}}'
```

---

## 3. Sync from cloud (bulk data)

**Endpoint:** `POST /api/integrations/sync`  
**Auth:** `X-API-Key: <your-device-api-key>`

**Body:**

```json
{
  "deviceId": "<device-guid-matching-the-api-key>",
  "device": {
    "status": "Active",
    "timeZoneId": "America/New_York",
    "lastHeartbeatAtUtc": "2025-02-03T12:00:00Z"
  },
  "events": [
    {
      "containerId": "<guid>",
      "scheduleId": "<guid>",
      "scheduledAtUtc": "2025-02-03T08:00:00Z",
      "status": "Confirmed",
      "dispensedAtUtc": "2025-02-03T08:01:00Z",
      "confirmedAtUtc": "2025-02-03T08:05:00Z"
    }
  ]
}
```

- `deviceId` in the body must match the device that owns the API key.
- `device` is optional; use it to update device status, time zone, or last heartbeat.
- `events` is optional; each item can have `status`: `Pending`, `Dispensed`, `Confirmed`, `Missed`, `Delayed`.

---

## 4. Outgoing webhooks (your server receives our events)

In the web app, go to **Integrations → Outgoing webhooks** and add a URL. We will POST to it when:

- **dispense.confirmed** — User confirmed taking a dose.
- **notification.missed_dose** — A dose was marked missed.
- **notification.low_stock** — Low stock notification was created.

**Payload shape:** `{ "eventType", "timestampUtc", "data" }` for all outgoing types (including `dispense.confirmed`). Details: [WEBHOOKS_JSON_REFERENCE.md](software-docs/WEBHOOKS_JSON_REFERENCE.md).

**Optional signature:** If you set a **secret** when adding the webhook, we send `X-Webhook-Signature: sha256=<hmac-sha256-hex>` over the raw JSON body.

**MVP:** Outgoing delivery is **fire-and-forget** (no automatic retries).

---

## Base URL

- Local: `http://localhost:5000` (or the port in your backend launchSettings).
- Production: set your API base URL in the web/mobile app and use the same base for integration calls.
