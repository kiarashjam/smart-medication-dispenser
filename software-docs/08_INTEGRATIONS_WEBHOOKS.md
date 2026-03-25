# Integrations & Webhooks

**Smart Medication Dispenser — Outgoing/Incoming Webhooks, Cloud Sync & Device API Keys**

**Version 2.0 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.0 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | All Engineers |
| **Related Documents** | [02_BACKEND_API.md](./02_BACKEND_API.md), [07_AUTHENTICATION.md](./07_AUTHENTICATION.md), [09_MONITORING_OBSERVABILITY.md](./09_MONITORING_OBSERVABILITY.md) |

### MVP note

Use **[WEBHOOKS_JSON_REFERENCE.md](./WEBHOOKS_JSON_REFERENCE.md)** and **[MVP_APPLICATION.md](./MVP_APPLICATION.md)** for the minimal integration contract. In *this* document, sections **10–14** (retry strategy, FHIR, pharmacy, insurer monitoring extras) are **roadmap / post-MVP** unless reflected in production code.

---

## 1. Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTEGRATION ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INCOMING (to our API)                    OUTGOING (from our API)            │
│                                                                              │
│  ┌──────────────┐                        ┌──────────────┐                   │
│  │   ESP32       │  POST /api/v1/events  │  Your Server │                   │
│  │   Firmware    │───────────────────▶   │  POST https: │                   │
│  │              │  Device JWT / X-Key    │  //callback  │                   │
│  └──────────────┘                        └──────┬───────┘                   │
│                                                  ▲                           │
│  ┌──────────────┐                                │                           │
│  │   External    │  POST /api/webhooks/  ┌───────┴───────┐                  │
│  │   Cloud       │  incoming             │  Webhook      │                  │
│  │   System      │───────────────────▶  │  Delivery     │                  │
│  └──────────────┘  X-API-Key            │  Service      │                  │
│                                          └───────────────┘                  │
│  ┌──────────────┐                                ▲                           │
│  │   External    │  POST /api/integrations/      │                           │
│  │   Cloud       │  sync                 ┌───────┴───────┐                  │
│  │   System      │───────────────────▶  │  Background   │                  │
│  └──────────────┘  X-API-Key            │  Job:         │                  │
│                                          │  Missed Dose  │                  │
│                                          │  Low Stock    │                  │
│                                          └───────────────┘                  │
│                                                                              │
│  TRIGGERS FOR OUTGOING WEBHOOKS:                                             │
│  • dispense.confirmed (user confirmed dose intake)                          │
│  • notification.missed_dose (dose marked as missed)                         │
│  • notification.low_stock (container below threshold)                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Outgoing Webhooks

### 2.1 Overview

Outgoing webhooks notify external systems when events occur in the platform. Users configure webhook URLs in the web portal under **Integrations**.

### 2.2 Creating a Webhook

**Web Portal:** Integrations → Outgoing Webhooks → Add Webhook

**API:**
```bash
POST /api/integrations/webhooks
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook/dispenser",
  "secret": "optional-signing-secret",
  "description": "My notification endpoint"
}
```

**Response:**
```json
{
  "id": "wh1a2b3c...",
  "url": "https://your-server.com/webhook/dispenser",
  "isActive": true,
  "description": "My notification endpoint",
  "lastTriggeredAtUtc": null,
  "lastStatus": null,
  "createdAtUtc": "2026-02-10T12:00:00Z"
}
```

### 2.3 Webhook Event Types

| Event Type | Trigger | Data Included |
|:-----------|:--------|:-------------|
| `dispense.confirmed` | User confirmed taking a dose | `data`: dispenseEventId, deviceId, containerId, scheduleId, medicationName, pillsPerDose |
| `notification.missed_dose` | Dose marked as missed (60 min timeout) | dispenseEventId, deviceId |
| `notification.low_stock` | Container below low stock threshold | containerId, deviceId, medicationName, quantity |

### 2.4 Webhook Payload Format

All outgoing webhooks use the same envelope: `eventType`, `timestampUtc`, and `data` (event-specific fields).

```json
{
  "eventType": "dispense.confirmed",
  "timestampUtc": "2026-02-10T08:05:00Z",
  "data": {
    "dispenseEventId": "e1f2g3...",
    "deviceId": "d1e2f3...",
    "containerId": "...",
    "scheduleId": "...",
    "medicationName": "Metformin 500mg",
    "pillsPerDose": 2
  }
}
```

### 2.5 Webhook Signature Verification

If a **secret** is configured, the webhook includes an HMAC-SHA256 signature:

**Header:** `X-Webhook-Signature: sha256=<hex-encoded-hmac>`

**Verification (server-side):**
```python
import hmac
import hashlib

def verify_webhook(payload_bytes, signature_header, secret):
    expected = hmac.new(
        secret.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()
    provided = signature_header.replace("sha256=", "")
    return hmac.compare_digest(expected, provided)
```

```javascript
const crypto = require('crypto');

function verifyWebhook(body, signatureHeader, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  const provided = signatureHeader.replace('sha256=', '');
  return crypto.timingSafeEqual(
    Buffer.from(expected), Buffer.from(provided)
  );
}
```

### 2.6 Webhook Delivery Details

| Property | Value |
|:---------|:------|
| **HTTP Method** | POST |
| **Content-Type** | application/json |
| **Timeout** | 10 seconds |
| **Retry** | None (MVP — fire and forget) |
| **Headers** | `X-Webhook-Event: dispenser.event`, `User-Agent: SmartMedicationDispenser/1.0`, `X-Webhook-Signature: sha256=<hmac>` (if secret set) |

### 2.7 Managing Webhooks

| Action | Method | Endpoint |
|:-------|:-------|:---------|
| List all | GET | `/api/integrations/webhooks` |
| Create | POST | `/api/integrations/webhooks` |
| Delete | DELETE | `/api/integrations/webhooks/{id}` |

---

## 3. Incoming Webhooks

### 3.1 Overview

External systems (cloud platforms, device gateways) can push events to the API using the incoming webhook endpoint.

### 3.2 Endpoint

```
POST /api/webhooks/incoming
X-API-Key: <device-api-key>
Content-Type: application/json
```

### 3.3 Request Format

```json
{
  "eventType": "heartbeat",
  "deviceId": "optional-override-guid",
  "data": {}
}
```

### 3.4 Supported Event Types

| eventType | Description | Data Fields |
|:----------|:------------|:------------|
| `heartbeat` | Update device last seen time | — |
| `device_status` | Set device active/paused | `{ "status": "Active" \| "Paused" }` |
| `dispense_completed` | Record a dispense event | `{ "containerId": "<guid>", "scheduleId": "<guid>" }` |
| `low_stock` | Create low-stock notification | `{ "containerId": "<guid>", "message": "Optional text" }` |

### 3.5 Examples

**Heartbeat:**
```bash
curl -X POST http://localhost:5000/api/webhooks/incoming \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{"eventType":"heartbeat","data":{}}'
```

**Dispense Completed:**
```bash
curl -X POST http://localhost:5000/api/webhooks/incoming \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{
    "eventType": "dispense_completed",
    "data": {
      "containerId": "c1d2e3-...",
      "scheduleId": "s1a2b3-..."
    }
  }'
```

**Low Stock:**
```bash
curl -X POST http://localhost:5000/api/webhooks/incoming \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{
    "eventType": "low_stock",
    "data": {
      "containerId": "c1d2e3-...",
      "message": "Metformin: 5 pills remaining"
    }
  }'
```

### 3.6 Authentication

The incoming webhook resolves the device from the `X-API-Key` header:

1. Extract `X-API-Key` from request headers
2. Compute SHA256 hash of the key
3. Look up the hash in `DeviceApiKeys` table
4. Return the associated `DeviceId`
5. If `deviceId` is provided in the body, it must match the key's device

**Error responses:**
- `401 Unauthorized` — Missing or invalid API key
- `403 Forbidden` — Body deviceId doesn't match key's device
- `400 Bad Request` — Unknown event type

---

## 4. Cloud Sync

### 4.1 Overview

The sync endpoint allows external cloud systems to push bulk data (device status + dispense events) to the platform.

### 4.2 Endpoint

```
POST /api/integrations/sync
X-API-Key: <device-api-key>
Content-Type: application/json
```

### 4.3 Request Format

```json
{
  "deviceId": "<device-guid-matching-the-api-key>",
  "device": {
    "status": "Active",
    "timeZoneId": "America/New_York",
    "lastHeartbeatAtUtc": "2026-02-10T12:00:00Z"
  },
  "events": [
    {
      "containerId": "<guid>",
      "scheduleId": "<guid>",
      "scheduledAtUtc": "2026-02-10T08:00:00Z",
      "status": "Confirmed",
      "dispensedAtUtc": "2026-02-10T08:01:00Z",
      "confirmedAtUtc": "2026-02-10T08:05:00Z"
    }
  ]
}
```

### 4.4 Sync Rules

| Rule | Description |
|:-----|:------------|
| `deviceId` must match API key | The device ID in the body must be the device associated with the API key |
| `device` is optional | Only include if updating device status/metadata |
| `events` is optional | Only include if pushing dispense events |
| Idempotent | Sync can be called repeatedly; events are created if not already existing |
| Status values | `Pending`, `Dispensed`, `Confirmed`, `Missed`, `Delayed` |

### 4.5 Example

```bash
curl -X POST http://localhost:5000/api/integrations/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{
    "deviceId": "d1e2f3-...",
    "device": {
      "status": "Active",
      "lastHeartbeatAtUtc": "2026-02-10T12:00:00Z"
    },
    "events": [
      {
        "containerId": "c1d2e3-...",
        "scheduleId": "s1a2b3-...",
        "scheduledAtUtc": "2026-02-10T08:00:00Z",
        "status": "Confirmed",
        "dispensedAtUtc": "2026-02-10T08:01:00Z",
        "confirmedAtUtc": "2026-02-10T08:05:00Z"
      }
    ]
  }'
```

---

## 5. Device API Keys

### 5.1 Creating API Keys

**Web Portal:** Integrations → Device API Keys → Select device → Create Key

**API:**
```bash
POST /api/integrations/devices/{deviceId}/api-keys
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Production ESP32"
}
```

**Response:**
```json
{
  "apiKeyId": "k1a2b3...",
  "plainKey": "sk_8f4a2b1c9e3d7f6a5b4c3d2e1f0a9b8c"
}
```

**Important:** The `plainKey` is shown **only once**. Store it securely.

### 5.2 API Key Storage

| What's Stored | Where | Format |
|:-------------|:------|:-------|
| SHA256 hash of key | `DeviceApiKeys.KeyHash` | 64-character hex string |
| Key metadata | `DeviceApiKeys` table | Name, device ID, timestamps |
| Plain key | **NOT stored** | Shown once on creation |

### 5.3 Managing API Keys

| Action | Method | Endpoint | Auth |
|:-------|:-------|:---------|:-----|
| List keys for device | GET | `/api/integrations/devices/{deviceId}/api-keys` | JWT |
| Create key | POST | `/api/integrations/devices/{deviceId}/api-keys` | JWT |
| Revoke key | DELETE | `/api/integrations/devices/{deviceId}/api-keys/{apiKeyId}` | JWT |

### 5.4 API Key Usage

Include the key in the `X-API-Key` header:

```bash
curl -X POST http://localhost:5000/api/webhooks/incoming \
  -H "X-API-Key: sk_8f4a2b1c9e3d7f6a5b4c3d2e1f0a9b8c" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"heartbeat","data":{}}'
```

---

## 6. Device API (ESP32 → Cloud)

### 6.1 Overview

The Device API (`/api/v1/*`) is the primary interface for ESP32 firmware to communicate with the cloud backend.

### 6.2 Authentication

Devices authenticate using either:
- **Device JWT** — Obtained during device registration (`Authorization: Bearer <token>`)
- **X-API-Key** — Created via the web portal (`X-API-Key: sk_...`)

### 6.3 Device Registration Flow

```
ESP32 (First Boot)                    Server
  │                                     │
  │ POST /api/v1/devices/register       │
  │ { deviceId, deviceType,             │
  │   firmwareVersion, macAddress }     │
  │────────────────────────────────────▶│
  │                                     │
  │                                     │ Create device record
  │                                     │ Generate device token
  │                                     │
  │ { success, deviceToken,             │
  │   apiEndpoint, heartbeatInterval }  │
  │◀────────────────────────────────────│
  │                                     │
  │ Store deviceToken in NVS            │
  │ Begin heartbeat loop (60s)          │
  │                                     │
```

### 6.4 Heartbeat Flow

```
ESP32 (Every 60 seconds)              Server
  │                                     │
  │ POST /api/v1/devices/{id}/heartbeat │
  │ Authorization: Bearer <token>       │
  │ { battery, wifiSignal, slots,       │
  │   temperature, humidity, errors }   │
  │────────────────────────────────────▶│
  │                                     │
  │                                     │ Update device status
  │                                     │ Check for commands
  │                                     │
  │ { success, server_time,             │
  │   commands: [], next_heartbeat }    │
  │◀────────────────────────────────────│
  │                                     │
```

### 6.5 Event Reporting Flow

```
ESP32 (On Event)                      Server
  │                                     │
  │ POST /api/v1/events                 │
  │ { deviceId, event: "DOSE_TAKEN",    │
  │   timestamp, data: { slot, pills }} │
  │────────────────────────────────────▶│
  │                                     │
  │                                     │ Log event
  │                                     │ Update dispense status
  │                                     │ Trigger notifications
  │                                     │ Send outgoing webhooks
  │                                     │
  │ { success, event_id }               │
  │◀────────────────────────────────────│
  │                                     │
```

---

## 7. Background Job: Missed Dose & Low Stock

### 7.1 Overview

A hosted background service runs every **5 minutes** to detect:
1. **Missed doses** — Dispense events older than 60 minutes still in Pending/Dispensed status
2. **Low stock** — Containers where quantity is below the low stock threshold

### 7.2 Missed Dose Detection

```
Every 5 minutes:
  1. Query DispenseEvents WHERE Status IN (Pending, Dispensed)
     AND ScheduledAtUtc < (UtcNow - 60 minutes)
  
  2. For each overdue event:
     a. Set Status = Missed, MissedMarkedAtUtc = UtcNow
     b. Create Notification for patient ("Missed dose")
     c. If patient has caregiver → Create Notification for caregiver
     d. Send outgoing webhooks (notification.missed_dose)
```

### 7.3 Low Stock Detection

```
Every 5 minutes:
  1. Query Containers WHERE Quantity < LowStockThreshold
  
  2. For each low-stock container:
     a. Check if unread LowStock notification already exists
     b. If no existing notification:
        - Create Notification ("Low stock: {med} has {qty} remaining")
        - Send outgoing webhooks (notification.low_stock)
```

### 7.4 Webhook Delivery in Background Job

When the background job creates notifications, it also delivers outgoing webhooks:

```csharp
// For each active webhook endpoint of the user:
var payload = new { eventType, timestampUtc = DateTime.UtcNow, data };
var status = await webhookDelivery.SendAsync(ep.Url, payload, ep.Secret, ct);
await webhookEndpoints.UpdateLastTriggeredAsync(ep.Id, status.ToString(), ct);
```

---

## 8. Integration Quick Start

### 8.1 Step-by-Step Setup

```
1. Login to web portal (http://localhost:5173)
   → Use demo credentials: patient@demo.com / Demo123!

2. Navigate to Integrations page

3. Create a Device API Key:
   → Select a device (e.g., "Home Dispenser")
   → Click "Create API Key"
   → Copy the key (sk_...) — shown only once!

4. (Optional) Create an Outgoing Webhook:
   → Enter your callback URL
   → (Optional) Set a signing secret
   → Click "Create Webhook"

5. Test with incoming webhook:
   curl -X POST http://localhost:5000/api/webhooks/incoming \
     -H "Content-Type: application/json" \
     -H "X-API-Key: sk_your_copied_key" \
     -d '{"eventType":"heartbeat","data":{}}'
   
   Expected: 202 Accepted

6. Test with sync:
   curl -X POST http://localhost:5000/api/integrations/sync \
     -H "Content-Type: application/json" \
     -H "X-API-Key: sk_your_copied_key" \
     -d '{
       "deviceId": "<device-guid-from-web-portal>",
       "device": {"status":"Active"},
       "events": []
     }'
   
   Expected: 202 Accepted
```

### 8.2 Integration Checklist

| Step | Action | Status |
|:-----|:-------|:-------|
| 1 | Create device API key in web portal | ☐ |
| 2 | Store API key securely in your system | ☐ |
| 3 | Implement heartbeat calls (every 60s) | ☐ |
| 4 | Implement event reporting (dose/error/battery) | ☐ |
| 5 | (Optional) Set up outgoing webhook endpoint | ☐ |
| 6 | (Optional) Implement webhook signature verification | ☐ |
| 7 | (Optional) Implement sync for bulk updates | ☐ |
| 8 | Test end-to-end with demo data | ☐ |

---

## 9. Error Handling

### 9.1 Incoming Webhook Errors

| HTTP Status | Cause | Resolution |
|:------------|:------|:-----------|
| 401 | Missing or invalid X-API-Key | Check key is correct and not revoked |
| 403 | Body deviceId doesn't match key | Use correct deviceId or omit it |
| 400 | Unknown eventType or invalid data | Check supported event types |
| 500 | Server error | Check server logs |

### 9.2 Outgoing Webhook Errors

| Issue | Behavior | Resolution |
|:------|:---------|:-----------|
| Target URL unreachable | Logged as warning, delivery skipped | Check your server URL |
| Timeout (>10s) | Request cancelled | Optimize your webhook handler |
| Non-2xx response | Status recorded in webhook endpoint | Check your server logs |
| Connection refused | Logged as warning | Ensure server is running |

### 9.3 Sync Errors

| HTTP Status | Cause | Resolution |
|:------------|:------|:-----------|
| 401 | Invalid API key | Check key |
| 400 | DeviceId mismatch or invalid data | Ensure deviceId matches API key's device |
| 400 | Invalid event status value | Use: Pending, Dispensed, Confirmed, Missed, Delayed |

---

## 10. Webhook Retry Strategy (Planned)

### 10.1 Retry Configuration

| Property | Value |
|:---------|:------|
| **Max retries** | 5 |
| **Backoff** | Exponential (1s, 2s, 4s, 8s, 16s) |
| **Max delay** | 1 hour |
| **Retry on** | 5xx errors, network timeouts, connection refused |
| **No retry on** | 4xx errors (except 429), successful delivery |
| **Dead letter** | After 5 failures → mark endpoint as failing |

### 10.2 Retry Implementation

```csharp
// Infrastructure/Services/WebhookDeliveryService.cs
public class RetryableWebhookDeliveryService : IWebhookDeliveryService
{
    private static readonly int[] RetryDelaysMs = { 1000, 2000, 4000, 8000, 16000 };
    
    public async Task<WebhookDeliveryResult> SendWithRetryAsync(
        string url, object payload, string? secret, CancellationToken ct)
    {
        for (int attempt = 0; attempt <= RetryDelaysMs.Length; attempt++)
        {
            try
            {
                var result = await SendAsync(url, payload, secret, ct);
                if (result.IsSuccess || result.StatusCode < 500)
                    return result;
                
                if (attempt < RetryDelaysMs.Length)
                    await Task.Delay(RetryDelaysMs[attempt], ct);
            }
            catch (HttpRequestException) when (attempt < RetryDelaysMs.Length)
            {
                await Task.Delay(RetryDelaysMs[attempt], ct);
            }
        }
        
        return WebhookDeliveryResult.Failed("Max retries exceeded");
    }
}
```

### 10.3 Webhook Delivery Log

```sql
CREATE TABLE WebhookDeliveryLogs (
    Id UUID PRIMARY KEY,
    WebhookEndpointId UUID NOT NULL REFERENCES WebhookEndpoints(Id),
    EventType VARCHAR(100) NOT NULL,
    PayloadJson TEXT NOT NULL,
    Attempt INT NOT NULL,
    StatusCode INT,
    ResponseBody TEXT,
    DurationMs INT,
    Error TEXT,
    CreatedAtUtc TIMESTAMP NOT NULL
);

CREATE INDEX IX_WDL_EndpointId_CreatedAt 
    ON WebhookDeliveryLogs(WebhookEndpointId, CreatedAtUtc);
```

### 10.4 Endpoint Health Management

| Consecutive Failures | Action |
|:--------------------|:-------|
| 3 | Warning notification to user |
| 10 | Endpoint marked as "Failing" |
| 50 | Endpoint auto-disabled |
| Manual re-enable | User reactivates in Integrations page |

---

## 11. FHIR Integration (Phase 2)

### 11.1 FHIR Overview

| Property | Value |
|:---------|:------|
| **FHIR Version** | R4 (4.0.1) |
| **Format** | JSON (application/fhir+json) |
| **Authentication** | OAuth 2.0 / SMART on FHIR |
| **Target** | EHR systems (Epic, Cerner, Swiss HIS) |

### 11.2 FHIR Resource Mapping

| Our Data | FHIR Resource | Notes |
|:---------|:-------------|:------|
| User (Patient) | `Patient` | demographics, contact |
| Container (Medication) | `MedicationRequest` | prescription reference |
| Schedule | `MedicationRequest.dosageInstruction` | timing, dose |
| DispenseEvent (Dispensed) | `MedicationDispense` | when pills released |
| DispenseEvent (Confirmed) | `MedicationAdministration` | when patient took dose |
| Adherence | `MedicationAdministration` (aggregate) | adherence score |
| Device | `Device` | medical device reference |

### 11.3 Example FHIR Export

```json
{
  "resourceType": "MedicationAdministration",
  "id": "dose-event-12345",
  "status": "completed",
  "medicationCodeableConcept": {
    "text": "Metformin 500mg"
  },
  "subject": {
    "reference": "Patient/user-guid"
  },
  "effectiveDateTime": "2026-02-10T08:05:00Z",
  "device": {
    "reference": "Device/device-guid"
  },
  "dosage": {
    "dose": {
      "value": 2,
      "unit": "tablets"
    }
  }
}
```

### 11.4 FHIR API Endpoints (Planned)

| Endpoint | Description |
|:---------|:-----------|
| GET `/api/fhir/Patient/{userId}` | Export patient as FHIR Patient resource |
| GET `/api/fhir/MedicationAdministration?patient={id}&date={range}` | Export dose history |
| GET `/api/fhir/Device/{deviceId}` | Export device information |
| GET `/api/fhir/Bundle?patient={id}` | Full patient data export (FHIR Bundle) |

---

## 12. Pharmacy Management System Integration (Planned)

### 12.1 Integration Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Pharmacy     │  REST   │  Smart       │  REST   │  Patient     │
│  Management   │◀───────▶│  Dispenser   │◀───────▶│  Mobile App  │
│  System       │         │  API         │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
        │                        │
        │ Prescription           │ Refill needed
        │ updates                │ notifications
        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐
  │ Medication    │         │ Webhook      │
  │ schedules     │         │ delivery     │
  │ sync          │         │              │
  └──────────────┘         └──────────────┘
```

### 12.2 Integration Capabilities

| Feature | Direction | Protocol | Status |
|:--------|:----------|:---------|:-------|
| Prescription sync | Pharmacy → API | REST webhook | Phase 2 |
| Medication list | Pharmacy → API | REST | Phase 2 |
| Refill alerts | API → Pharmacy | Outgoing webhook | Phase 2 |
| Adherence reports | API → Pharmacy | REST export | Phase 2 |
| Delivery scheduling | Pharmacy → API | REST | Phase 3 |

---

## 13. Integration Monitoring

### 13.1 Integration Health Metrics

| Metric | Warning | Critical | Action |
|:-------|:--------|:---------|:-------|
| Webhook delivery rate | < 95% | < 90% | Check endpoint health |
| Webhook latency (p95) | > 2s | > 5s | Check target server |
| API key usage (last 24h) | None (expected active) | — | Check device connectivity |
| Incoming event rate | Unusual spike | 10x normal | Rate limit, investigate |
| Failed sync attempts | > 3 consecutive | > 10 consecutive | Disable + alert |

### 13.2 Integration Dashboard (Web Portal)

The Integrations page in the web portal shows:

| Widget | Data |
|:-------|:-----|
| **Webhook Status** | Active/failing/disabled endpoints with last delivery status |
| **Delivery History** | Last 100 deliveries with status, latency, response code |
| **API Key Activity** | Last used timestamp per key |
| **Event Feed** | Recent incoming/outgoing events |
| **Sync Status** | Last sync time, records synced, errors |

### 13.3 Alerting Rules

| Alert | Condition | Channel |
|:------|:----------|:--------|
| Webhook endpoint failing | 3+ consecutive failures | In-app notification |
| Webhook endpoint disabled | Auto-disabled after 50 failures | Email + in-app |
| API key not used | No activity for 7+ days (expected active) | In-app notification |
| Unusual incoming rate | > 10x baseline in 5 minutes | Admin alert |

---

## 14. Health Insurer Integration (Phase 3)

### 14.1 Overview

B2B integration with Swiss health insurers to share adherence data (with patient consent).

| Feature | Description |
|:--------|:-----------|
| **Adherence Reports** | Monthly aggregated adherence scores per patient |
| **Data Format** | FHIR Bundle or custom JSON/CSV |
| **Authentication** | OAuth 2.0 client credentials |
| **Consent** | Explicit patient consent required (GDPR Art. 9) |
| **Anonymization** | Option to send pseudonymized data |

### 14.2 Report Format

```json
{
  "reportType": "monthly_adherence",
  "period": "2026-01",
  "patientId": "pseudonymized-hash",
  "insurerId": "CSS",
  "data": {
    "totalScheduled": 120,
    "totalTaken": 112,
    "adherencePercent": 93.3,
    "medicationCount": 3,
    "missedDoseDetails": [
      { "date": "2026-01-05", "count": 2 },
      { "date": "2026-01-18", "count": 1 }
    ]
  }
}
```
