# Notification System

**Smart Medication Dispenser — Multi-Channel Notification Architecture**

**Version 1.0** | **February 2026**

---

## Current Implementation Status

**Currently implemented:** In-app notifications (create, list, mark read), in-memory notification preferences (GET/PUT), background detection of missed doses and low stock (single hosted service, every 5 min, 60-min threshold).

**Planned:** Push notifications, SignalR real-time, email (SendGrid), SMS (Twilio), device audio/visual alerts, escalation service, delivery queue.

---

## 1. Notification Architecture Overview

The notification system provides **multi-channel delivery** across in-app notifications, push notifications (FCM/APNs), email, SMS (B2B only), and device audio/visual alerts. Notifications are triggered by events throughout the system and delivered through configured channels based on notification type and user preferences.

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION PROCESSING PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EVENT TRIGGERS:                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Background   │  │ API Endpoint │  │ Device       │  │ User Action  │    │
│  │ Job          │  │ (Dispense,   │  │ Heartbeat    │  │ (Confirm,    │    │
│  │ (Missed Dose)│  │ Confirm)     │  │ Failure      │  │ Delay)       │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │                  │            │
│         └──────────────────┴──────────────────┴──────────────────┘            │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │         Notification Service (Application Layer)            │             │
│  │  • Determines notification type                              │             │
│  │  • Loads user preferences                                    │             │
│  │  • Checks rate limits & deduplication                       │             │
│  │  • Creates Notification entity (in-app)                     │             │
│  └──────────────────────┬──────────────────────────────────────┘             │
│                         │                                                    │
│                         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │         Notification Delivery Queue (Background)            │             │
│  │  • Async processing for external channels                   │             │
│  │  • Retry logic for failed deliveries                        │             │
│  └──────────────────────┬──────────────────────────────────────┘             │
│                         │                                                    │
│         ┌───────────────┼───────────────┐                                   │
│         │               │               │                                   │
│         ▼               ▼               ▼                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ In-App   │  │ Push     │  │ Email    │  │ SMS      │  │ Device   │     │
│  │ (SignalR │  │ (FCM/    │  │ (SendGrid│  │ (B2B     │  │ (Audio/  │     │
│  │ / Poll)  │  │ APNs)    │  │ / Azure) │  │ Only)    │  │ Visual)  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Notification Processing Pipeline

1. **Event Detection**: Background jobs, API endpoints, or device events detect conditions requiring notification
2. **Notification Creation**: System creates a `Notification` entity in the database (for in-app delivery)
3. **Channel Selection**: Based on notification type and user preferences, appropriate channels are selected
4. **Rate Limiting Check**: System verifies rate limits haven't been exceeded (max 1 push per type per 10 minutes)
5. **Deduplication**: Checks for duplicate notifications (e.g., multiple heartbeat failures)
6. **Delivery**: Notifications are delivered through selected channels:
   - **In-app**: Stored in database, delivered via polling (SignalR real-time delivery is **planned**, not yet implemented)
   - **Push**: Sent via FCM (Android) or APNs (iOS)
   - **Email**: Queued and sent via SendGrid or Azure Communication Services
   - **SMS**: Queued and sent via Twilio (B2B customers only)
   - **Device**: Sent via device API to trigger audio/visual alerts
7. **Real-time Updates**: *(Planned)* SignalR hub will broadcast new notifications to connected clients; there is currently no SignalR hub or MapHub in the API.
8. **Badge Management**: Push notification badge counts are updated based on unread notifications

---

## 2. Notification Types & Channels Matrix

The following table maps each notification type to its delivery channels:

| Notification Type | In-App | Push | Email | SMS (B2B) | Device Audio/Visual | Caregiver Push | Notes |
|:------------------|:------:|:----:|:-----:|:---------:|:------------------:|:--------------:|:------|
| **MissedDose** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Escalation timeline applies |
| **DoseDispensed** | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | Optional push (user preference) |
| **DoseTaken** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Caregiver in-app only |
| **LowStock** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Threshold-based |
| **RefillCritical** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | B2B SMS only |
| **DeviceOffline** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | Push after 5 min, email after 30 min |
| **DeviceError** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Critical errors only |
| **BatteryLow** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | < 20% battery |
| **BatteryCritical** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | < 10% battery |
| **TravelStarted** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Caregiver push only |
| **TravelEnded** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | Caregiver push only |
| **FirmwareAvailable** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | In-app only |

**Legend:**
- ✅ = Always delivered
- ⚠️ = Optional (user preference)
- ❌ = Not delivered

### 2.1 Notification Type Details

#### MissedDose
- **Trigger**: Dispense event remains unconfirmed for 60+ minutes (implementation uses `TimeSpan.FromMinutes(60)`)
- **Channels**: Push + In-app + Caregiver push + Device audio/LED + SMS (B2B)
- **Escalation**: See Section 6 for detailed escalation timeline
- **Payload Example**:
  ```json
  {
    "type": "MissedDose",
    "title": "Missed dose",
    "body": "A scheduled dose was not confirmed in time.",
    "relatedEntityId": "e1f2g3h4-...",
    "deviceId": "d1e2f3g4-...",
    "medicationName": "Metformin 500mg"
  }
  ```

#### DoseDispensed
- **Trigger**: Device successfully dispenses medication
- **Channels**: In-app + optional push (user preference)
- **Payload Example**:
  ```json
  {
    "type": "DoseDispensed",
    "title": "Dose dispensed",
    "body": "Metformin 500mg (2 pills) dispensed from slot 1",
    "relatedEntityId": "e1f2g3h4-...",
    "deviceId": "d1e2f3g4-..."
  }
  ```

#### DoseTaken
- **Trigger**: User confirms taking medication
- **Channels**: In-app + Caregiver in-app notification
- **Payload Example**:
  ```json
  {
    "type": "DoseTaken",
    "title": "Dose confirmed",
    "body": "You confirmed taking Metformin 500mg",
    "relatedEntityId": "e1f2g3h4-..."
  }
  ```

#### LowStock
- **Trigger**: Container quantity falls below low stock threshold
- **Channels**: Push + In-app + Email
- **Deduplication**: Only one unread notification per container
- **Payload Example**:
  ```json
  {
    "type": "LowStock",
    "title": "Low stock",
    "body": "Metformin 500mg (slot 1) is low: 5 remaining.",
    "relatedEntityId": "c1a2b3c4-...",
    "deviceId": "d1e2f3g4-...",
    "quantity": 5
  }
  ```

#### RefillCritical
- **Trigger**: Container quantity falls below critical threshold (typically 0-2 pills)
- **Channels**: Push + In-app + Email + SMS (B2B)
- **Payload Example**:
  ```json
  {
    "type": "RefillCritical",
    "title": "Critical: Refill needed",
    "body": "Metformin 500mg (slot 1) is critically low: 1 remaining.",
    "relatedEntityId": "c1a2b3c4-...",
    "deviceId": "d1e2f3g4-...",
    "quantity": 1
  }
  ```

#### DeviceOffline
- **Trigger**: Device heartbeat not received for 5+ minutes
- **Channels**: Push (after 5 min) + Email (after 30 min)
- **Deduplication**: Suppresses repeated offline notifications
- **Payload Example**:
  ```json
  {
    "type": "DeviceOffline",
    "title": "Device offline",
    "body": "Kitchen Dispenser has been offline for 5 minutes",
    "relatedEntityId": "d1e2f3g4-...",
    "deviceId": "d1e2f3g4-...",
    "lastHeartbeatAtUtc": "2026-02-10T08:00:00Z"
  }
  ```

#### DeviceError
- **Trigger**: Device reports error via heartbeat or event
- **Channels**: Push + In-app + Email
- **Payload Example**:
  ```json
  {
    "type": "DeviceError",
    "title": "Device error",
    "body": "Kitchen Dispenser: Motor jam detected in slot 2",
    "relatedEntityId": "d1e2f3g4-...",
    "deviceId": "d1e2f3g4-...",
    "errorCode": "MOTOR_JAM",
    "errorMessage": "Motor jam detected in slot 2"
  }
  ```

#### BatteryLow
- **Trigger**: Device battery level < 20%
- **Channels**: Push + In-app
- **Payload Example**:
  ```json
  {
    "type": "BatteryLow",
    "title": "Low battery",
    "body": "Portable Dispenser battery is at 18%",
    "relatedEntityId": "d1e2f3g4-...",
    "deviceId": "d1e2f3g4-...",
    "batteryLevel": 18
  }
  ```

#### BatteryCritical
- **Trigger**: Device battery level < 10%
- **Channels**: Push + In-app + Email
- **Payload Example**:
  ```json
  {
    "type": "BatteryCritical",
    "title": "Critical battery",
    "body": "Portable Dispenser battery is critically low: 8%",
    "relatedEntityId": "d1e2f3g4-...",
    "deviceId": "d1e2f3g4-...",
    "batteryLevel": 8
  }
  ```

#### TravelStarted
- **Trigger**: User starts travel session with portable device
- **Channels**: In-app + Caregiver push
- **Payload Example**:
  ```json
  {
    "type": "TravelStarted",
    "title": "Travel started",
    "body": "Travel session started with Portable Dispenser",
    "relatedEntityId": "t1s2t3r4-...",
    "deviceId": "d1e2f3g4-..."
  }
  ```

#### TravelEnded
- **Trigger**: User ends travel session
- **Channels**: In-app + Caregiver push
- **Payload Example**:
  ```json
  {
    "type": "TravelEnded",
    "title": "Travel ended",
    "body": "Travel session ended. Returning to main device.",
    "relatedEntityId": "t1s2t3r4-...",
    "deviceId": "d1e2f3g4-..."
  }
  ```

#### FirmwareAvailable
- **Trigger**: New firmware version available for device
- **Channels**: In-app only
- **Payload Example**:
  ```json
  {
    "type": "FirmwareAvailable",
    "title": "Firmware update available",
    "body": "Firmware v1.2.0 is available for Kitchen Dispenser",
    "relatedEntityId": "d1e2f3g4-...",
    "deviceId": "d1e2f3g4-...",
    "firmwareVersion": "1.2.0"
  }
  ```

---

## 3. Push Notification Implementation

> **Planned.** There is no `POST /api/notifications/tokens` endpoint and no `UserDeviceToken` table in the current implementation. Push token registration is planned for a future release.

### 3.1 Platform Support

| Platform | Service | Implementation |
|:---------|:--------|:---------------|
| **Android** | Firebase Cloud Messaging (FCM) | Direct FCM API or Expo Push API |
| **iOS** | Apple Push Notification Service (APNs) | Direct APNs API or Expo Push API |
| **Expo Apps** | Expo Push API | Unified API for both platforms |

### 3.2 Device Token Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVICE TOKEN REGISTRATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Mobile App Initialization                                               │
│     ┌──────────────┐                                                        │
│     │ App Starts   │                                                        │
│     └──────┬───────┘                                                        │
│            │                                                                 │
│            ▼                                                                 │
│     ┌──────────────────┐                                                    │
│     │ Request Push     │                                                    │
│     │ Permission       │                                                    │
│     └──────┬───────────┘                                                    │
│            │                                                                 │
│            ▼                                                                 │
│     ┌──────────────────┐                                                    │
│     │ Get Device Token │                                                    │
│     │ (FCM/APNs)       │                                                    │
│     └──────┬───────────┘                                                    │
│            │                                                                 │
│            ▼                                                                 │
│     ┌──────────────────────────────────┐                                    │
│     │ POST /api/notifications/tokens    │                                    │
│     │ Authorization: Bearer <jwt>       │                                    │
│     │ Body: {                            │                                    │
│     │   "token": "fcm_token_...",        │                                    │
│     │   "platform": "android"|"ios"     │                                    │
│     │ }                                  │                                    │
│     └──────────────────────────────────┘                                    │
│            │                                                                 │
│            ▼                                                                 │
│     ┌──────────────────┐                                                    │
│     │ Backend Stores   │                                                    │
│     │ Token in DB      │                                                    │
│     │ (UserDeviceToken)│                                                    │
│     └──────────────────┘                                                    │
│                                                                              │
│  2. Token Refresh (when token changes)                                      │
│     • App detects token change                                              │
│     • Re-registers token via same endpoint                                  │
│     • Backend updates existing token or creates new record                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**API Endpoint:**
```bash
POST /api/notifications/tokens
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "token": "fcm_token_or_apns_token_here",
  "platform": "android"  # or "ios"
}
```

**Response:**
```json
{
  "id": "t1o2k3e4-...",
  "userId": "u1s2e3r4-...",
  "token": "fcm_token_...",
  "platform": "android",
  "createdAtUtc": "2026-02-10T12:00:00Z",
  "updatedAtUtc": "2026-02-10T12:00:00Z"
}
```

### 3.3 Push Notification Payload Format

#### FCM (Android) Payload
```json
{
  "to": "fcm_device_token",
  "notification": {
    "title": "Missed dose",
    "body": "A scheduled dose was not confirmed in time.",
    "sound": "default",
    "badge": 3
  },
  "data": {
    "type": "MissedDose",
    "notificationId": "n1o2t3i4-...",
    "relatedEntityId": "e1f2g3h4-...",
    "deviceId": "d1e2f3g4-...",
    "click_action": "FLUTTER_NOTIFICATION_CLICK"
  },
  "priority": "high",
  "android": {
    "priority": "high",
    "notification": {
      "channel_id": "medication_alerts",
      "sound": "alert.wav",
      "vibrate": [200, 100, 200]
    }
  }
}
```

#### APNs (iOS) Payload
```json
{
  "aps": {
    "alert": {
      "title": "Missed dose",
      "body": "A scheduled dose was not confirmed in time."
    },
    "sound": "default",
    "badge": 3,
    "category": "MEDICATION_ALERT",
    "content-available": 1
  },
  "type": "MissedDose",
  "notificationId": "n1o2t3i4-...",
  "relatedEntityId": "e1f2g3h4-...",
  "deviceId": "d1e2f3g4-..."
}
```

#### Expo Push API Payload (Unified)
```json
{
  "to": "ExponentPushToken[...]",
  "sound": "default",
  "title": "Missed dose",
  "body": "A scheduled dose was not confirmed in time.",
  "data": {
    "type": "MissedDose",
    "notificationId": "n1o2t3i4-...",
    "relatedEntityId": "e1f2g3h4-...",
    "deviceId": "d1e2f3g4-..."
  },
  "badge": 3,
  "priority": "high"
}
```

### 3.4 Badge Count Management

Badge counts represent the number of unread notifications for the user. The badge is updated whenever:
- A new notification is created
- A notification is marked as read
- User opens the app (syncs badge count)

**Badge Calculation:**
```csharp
var unreadCount = await _notificationRepository.CountUnreadByUserIdAsync(userId, cancellationToken);
// Badge count = unreadCount (capped at 99 for display)
```

**Badge Update Flow:**
1. Backend sends push notification with `badge` field set to unread count
2. Mobile app receives notification and updates badge
3. When user opens app, badge count is synced from `/api/notifications` endpoint
4. When user marks notification as read, badge count is decremented

### 3.5 Push Notification Channels (Android)

Android requires notification channels for proper categorization:

| Channel ID | Name | Importance | Description |
|:-----------|:-----|:-----------|:------------|
| `medication_alerts` | Medication Alerts | HIGH | Missed doses, critical alerts |
| `dose_reminders` | Dose Reminders | DEFAULT | Scheduled dose reminders |
| `device_status` | Device Status | LOW | Battery, offline, errors |
| `general` | General | DEFAULT | Other notifications |

**Channel Creation (Android):**
```typescript
// Mobile app initialization
import * as Notifications from 'expo-notifications';

await Notifications.setNotificationChannelAsync('medication_alerts', {
  name: 'Medication Alerts',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [200, 100, 200],
  sound: 'alert.wav',
});
```

---

## 4. Email Notification System (Planned)

SendGrid, Azure Communication Services, email templates, and email delivery are **not implemented**. The following describes the planned design.

### 4.1 Email Service Provider (Planned)

The system supports two email service providers:

| Provider | Configuration | Use Case |
|:---------|:--------------|:---------|
| **SendGrid** | `Email__SendGrid__ApiKey` | Production (recommended) |
| **Azure Communication Services** | `Email__Azure__ConnectionString` | Azure-hosted deployments |

**Configuration (appsettings.json):**
```json
{
  "Email": {
    "Provider": "SendGrid",  // or "Azure"
    "FromAddress": "notifications@smartdispenser.ch",
    "FromName": "Smart Medication Dispenser",
    "SendGrid": {
      "ApiKey": "SG.xxx..."
    },
    "Azure": {
      "ConnectionString": "endpoint=https://..."
    }
  }
}
```

### 4.2 Email Templates

Email templates are stored as HTML files with embedded variables. Each template has:
- **HTML version**: Rich formatting with branding
- **Plain text version**: Fallback for email clients that don't support HTML
- **Localization**: Separate templates for EN, FR, DE, IT

**Template Structure:**
```
backend/src/Infrastructure/Email/Templates/
├── MissedDose/
│   ├── en.html
│   ├── en.txt
│   ├── fr.html
│   ├── fr.txt
│   ├── de.html
│   ├── de.txt
│   ├── it.html
│   └── it.txt
├── LowStock/
│   └── ...
├── RefillCritical/
│   └── ...
├── WeeklyAdherenceReport/
│   └── ...
└── Welcome/
    └── ...
```

### 4.3 Email Template Types

#### Missed Dose Alert
**Subject:** `Missed Dose Alert - {{MedicationName}}`

**Variables:**
- `{{MedicationName}}` - Name of medication
- `{{ScheduledTime}}` - Scheduled dose time
- `{{DeviceName}}` - Name of device
- `{{PatientName}}` - Patient's full name
- `{{CaregiverName}}` - Caregiver's name (if applicable)

**Example (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Missed Dose Alert</h2>
    <div class="alert">
      <p><strong>{{MedicationName}}</strong> was scheduled for <strong>{{ScheduledTime}}</strong> but was not confirmed.</p>
      <p>Device: {{DeviceName}}</p>
      <p>Patient: {{PatientName}}</p>
    </div>
    <p>Please check on the patient and ensure the medication is taken.</p>
  </div>
</body>
</html>
```

#### Refill Reminder
**Subject:** `Refill Reminder - {{MedicationName}}`

**Variables:**
- `{{MedicationName}}` - Name of medication
- `{{Quantity}}` - Remaining quantity
- `{{DeviceName}}` - Name of device
- `{{SlotNumber}}` - Container slot number

#### Weekly Adherence Report
**Subject:** `Weekly Adherence Report - Week of {{WeekStartDate}}`

**Variables:**
- `{{WeekStartDate}}` - Start date of week (e.g., "Feb 3, 2026")
- `{{TotalScheduled}}` - Total scheduled doses
- `{{Confirmed}}` - Confirmed doses
- `{{Missed}}` - Missed doses
- `{{AdherencePercent}}` - Adherence percentage
- `{{MedicationBreakdown}}` - Table of medications with adherence stats

**Delivery:** Sent every Monday at 9:00 AM (user's timezone)

#### Welcome Email
**Subject:** `Welcome to Smart Medication Dispenser`

**Variables:**
- `{{UserName}}` - User's full name
- `{{LoginEmail}}` - User's email address

**Delivery:** Sent immediately after user registration

### 4.4 Email Localization

Email templates support 4 languages:
- **English (en)** - Default
- **French (fr)**
- **German (de)**
- **Italian (it)**

**Language Selection:**
1. Check user's `LanguagePreference` field (from User entity)
2. Fallback to English if template not available
3. Template path: `Templates/{TemplateType}/{Language}.html`

**Example:**
```csharp
var language = user.LanguagePreference ?? "en";
var templatePath = $"Templates/MissedDose/{language}.html";
```

### 4.5 Unsubscribe Management

All email notifications include an unsubscribe link at the bottom:

```html
<p style="font-size: 12px; color: #666;">
  <a href="{{UnsubscribeUrl}}">Unsubscribe from email notifications</a>
  | 
  <a href="{{ManagePreferencesUrl}}">Manage notification preferences</a>
</p>
```

**Unsubscribe URL Format:**
```
https://smartdispenser.ch/unsubscribe?token={{UnsubscribeToken}}&user={{UserId}}
```

**Unsubscribe Flow:**
1. User clicks unsubscribe link
2. Backend validates token and user ID
3. Updates user's email notification preferences (disables email channel)
4. Shows confirmation page
5. User can re-enable via web portal settings

---

## 5. In-App Notifications

### 5.1 Backend Implementation

In-app notifications are stored in the `Notifications` table:

**Entity Structure:**
```csharp
public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid? RelatedEntityId { get; set; }  // Optional: links to Device, Container, etc.
}
```

**API Endpoints:**
```bash
# Get notifications
GET /api/notifications?limit=50
Authorization: Bearer <jwt>

# Mark notification as read (returns 204 No Content)
POST /api/notifications/{id}/read
Authorization: Bearer <jwt>
```

**Response Format:**
```json
[
  {
    "id": "n1o2t3i4-...",
    "type": "MissedDose",
    "title": "Missed dose",
    "body": "A scheduled dose was not confirmed in time.",
    "isRead": false,
    "createdAtUtc": "2026-02-10T08:30:00Z",
    "relatedEntityId": "e1f2g3h4-..."
  }
]
```

### 5.2 Web Portal Implementation

**Notification Center:**
- Located in top navigation bar (bell icon)
- Shows unread count badge
- Dropdown displays recent notifications
- Clicking notification marks it as read and navigates to related entity

**Toast Notifications:**
- Real-time toast notifications for critical events (missed dose, device error)
- Auto-dismiss after 5 seconds
- Click to navigate to related entity

**Implementation (React):**
```typescript
// Real-time notification subscription
useEffect(() => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/notifications")
    .build();

  connection.on("NotificationReceived", (notification: NotificationDto) => {
    // Show toast notification
    toast.info(notification.title, {
      description: notification.body,
      onClick: () => navigateToRelatedEntity(notification),
    });
    
    // Update notification list
    setNotifications(prev => [notification, ...prev]);
  });

  connection.start();
  return () => connection.stop();
}, []);
```

### 5.3 Mobile App Implementation

**Notification List Screen:**
- Dedicated screen accessible from bottom navigation
- Shows all notifications (read and unread)
- Unread notifications highlighted
- Pull-to-refresh to sync latest notifications
- Tap notification to mark as read and navigate to detail

**Badge Count:**
- Displayed on notification tab icon
- Updated in real-time via SignalR or polling
- Synced on app launch

**Implementation (React Native):**
```typescript
// Notification list screen
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  
  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadNotifications = async () => {
    const response = await notificationsApi.list(50);
    setNotifications(response.data);
  };
  
  const markAsRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };
  
  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => markAsRead(item.id)}
        />
      )}
    />
  );
};
```

### 5.4 Real-Time Delivery (Planned)

Real-time delivery via SignalR is **planned** but **not yet implemented**. There is no SignalR hub or `MapHub` in the API; clients currently rely on polling.

**SignalR Hub (Planned):**
```csharp
public class NotificationHub : Hub
{
    public async Task JoinUserGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
    }
    
    public async Task LeaveUserGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
    }
}
```

**Broadcasting Notifications:**
```csharp
public class NotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    
    public async Task SendNotificationAsync(Notification notification)
    {
        // Store in database
        await _notificationRepository.AddAsync(notification);
        
        // Broadcast via SignalR
        await _hubContext.Clients
            .Group($"user_{notification.UserId}")
            .SendAsync("NotificationReceived", notificationDto);
    }
}
```

**Polling Fallback:**
If SignalR is unavailable, clients poll the `/api/notifications` endpoint every 30 seconds.

---

## 6. Caregiver Alert Escalation (Planned)

**Not implemented:** `MissedDoseEscalationService`, escalation timelines (T+10, T+20, T+30), and related caregiver push/email are planned. The current implementation only creates in-app missed-dose notifications via the background hosted service; no escalation service, delivery queue, rate limiter, or deduplicator exists in the codebase.

### 6.1 Escalation Timeline (Planned)

The missed dose escalation is planned to follow a progressive timeline to ensure timely intervention:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MISSED DOSE ESCALATION TIMELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  T+0 min    │ Device audio + visual alert (LED blinking, screen message)   │
│             │                                                               │
│  T+10 min   │ Patient push notification                                     │
│             │                                                               │
│  T+20 min   │ Second patient push notification                              │
│             │ Caregiver push notification (if caregiver assigned)            │
│             │                                                               │
│  T+30 min   │ Dose marked as MISSED status                                  │
│             │ Caregiver email notification                                  │
│             │ In-app notification (patient + caregiver)                     │
│             │                                                               │
│  T+45 min   │ B2B only: SMS to care team                                    │
│             │                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```csharp
public class MissedDoseEscalationService
{
    private static readonly TimeSpan[] EscalationIntervals = new[]
    {
        TimeSpan.Zero,           // T+0: Device alert
        TimeSpan.FromMinutes(10), // T+10: First patient push
        TimeSpan.FromMinutes(20), // T+20: Second patient push + caregiver push
        TimeSpan.FromMinutes(30), // T+30: Mark as missed + caregiver email
        TimeSpan.FromMinutes(45), // T+45: B2B SMS
    };
    
    public async Task ProcessEscalationAsync(DispenseEvent dispenseEvent)
    {
        var elapsed = DateTime.UtcNow - dispenseEvent.ScheduledAtUtc;
        
        if (elapsed >= TimeSpan.FromMinutes(30))
        {
            // Mark as missed
            dispenseEvent.Status = DispenseEventStatus.Missed;
            await SendCaregiverEmailAsync(dispenseEvent);
        }
        else if (elapsed >= TimeSpan.FromMinutes(20))
        {
            await SendSecondPatientPushAsync(dispenseEvent);
            await SendCaregiverPushAsync(dispenseEvent);
        }
        else if (elapsed >= TimeSpan.FromMinutes(10))
        {
            await SendFirstPatientPushAsync(dispenseEvent);
        }
        else if (elapsed >= TimeSpan.Zero)
        {
            await TriggerDeviceAlertAsync(dispenseEvent);
        }
    }
}
```

### 6.2 Configurable Escalation Rules

Escalation rules can be customized per patient:

**Escalation Rule Entity:**
```csharp
public class EscalationRule
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public TimeSpan FirstPushDelay { get; set; } = TimeSpan.FromMinutes(10);
    public TimeSpan SecondPushDelay { get; set; } = TimeSpan.FromMinutes(20);
    public TimeSpan CaregiverNotificationDelay { get; set; } = TimeSpan.FromMinutes(20);
    public TimeSpan MissedMarkDelay { get; set; } = TimeSpan.FromMinutes(30);
    public TimeSpan SmsDelay { get; set; } = TimeSpan.FromMinutes(45);
    public bool EnableSms { get; set; } = false;  // B2B only
}
```

**Default Rules:**
- Standard patients: Escalation as shown above
- B2B patients: Includes SMS at T+45 minutes
- High-risk patients: Faster escalation (5 min, 15 min, 25 min, 35 min)

### 6.3 Quiet Hours Support

During quiet hours (default: 22:00 - 07:00), audio alerts are suppressed:

**Quiet Hours Configuration:**
```csharp
public class UserNotificationSettings
{
    public Guid UserId { get; set; }
    public TimeSpan? QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0);  // 22:00
    public TimeSpan? QuietHoursEnd { get; set; } = new TimeSpan(7, 0, 0);     // 07:00
    public bool EnableQuietHours { get; set; } = true;
}
```

**Quiet Hours Logic:**
```csharp
public bool ShouldSuppressAudioAlert(DateTime scheduledTime, UserNotificationSettings settings)
{
    if (!settings.EnableQuietHours) return false;
    
    var currentTime = scheduledTime.TimeOfDay;
    var start = settings.QuietHoursStart ?? new TimeSpan(22, 0, 0);
    var end = settings.QuietHoursEnd ?? new TimeSpan(7, 0, 0);
    
    // Handle overnight quiet hours (22:00 - 07:00)
    if (start > end)
    {
        return currentTime >= start || currentTime < end;
    }
    else
    {
        return currentTime >= start && currentTime < end;
    }
}
```

**During Quiet Hours:**
- ✅ Push notifications still sent
- ✅ Visual alerts (LED, screen) still active
- ❌ Audio alerts suppressed
- ✅ Email notifications still sent

---

## 7. Device Notifications (Planned)

Device audio/visual alerts and the device notify API (`POST /api/v1/devices/{deviceId}/notify`) are **not implemented**. The following describes the planned design.

### 7.1 Audio Alerts (Planned)

Device audio alerts are played via I2S audio output on the ESP32-S3:

**Audio File Format:**
- **Format**: WAV (16-bit PCM, 16 kHz sample rate)
- **Languages**: EN, FR, DE, IT
- **Storage**: SPIFFS or external flash

**Audio Alert Types:**
| Alert Type | Audio File | Duration |
|:-----------|:-----------|:---------|
| Missed Dose | `missed_dose_{lang}.wav` | ~3 seconds |
| Low Stock | `low_stock_{lang}.wav` | ~2 seconds |
| Device Error | `device_error_{lang}.wav` | ~2 seconds |
| Battery Low | `battery_low_{lang}.wav` | ~2 seconds |

**Device API Command:**
```bash
POST /api/v1/devices/{deviceId}/notify
Authorization: Bearer <device_jwt>
Content-Type: application/json

{
  "type": "audio",
  "alertType": "MissedDose",
  "language": "en",
  "volume": 80  // 0-100
}
```

**Firmware Implementation:**
```c
// Play audio alert
esp_err_t play_audio_alert(const char* alert_type, const char* language)
{
    char filepath[64];
    snprintf(filepath, sizeof(filepath), "/spiffs/alerts/%s_%s.wav", 
             alert_type, language);
    
    // Initialize I2S
    i2s_config_t i2s_config = {
        .mode = I2S_MODE_MASTER | I2S_MODE_TX,
        .sample_rate = 16000,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        // ... other config
    };
    
    i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    
    // Read WAV file and play via I2S
    FILE* file = fopen(filepath, "rb");
    if (!file) return ESP_FAIL;
    
    // Play audio data...
    fclose(file);
    return ESP_OK;
}
```

### 7.2 Visual Alerts

**Display Screen:**
- Shows notification message on device LCD/e-ink display
- Message persists until user acknowledges or timeout (5 minutes)
- Supports multi-line text with scrolling for long messages

**LED Indicators:**
- **Red LED**: Critical alerts (missed dose, device error)
- **Yellow LED**: Warning alerts (low stock, battery low)
- **Green LED**: Success/confirmation (dose dispensed)
- **Blinking Pattern**: 200ms on, 200ms off for 10 cycles

**Device API Command:**
```bash
POST /api/v1/devices/{deviceId}/notify
Authorization: Bearer <device_jwt>
Content-Type: application/json

{
  "type": "visual",
  "alertType": "MissedDose",
  "message": "Missed dose: Metformin 500mg",
  "ledColor": "red",
  "ledPattern": "blink",
  "displayDuration": 300  // seconds
}
```

### 7.3 Haptic Feedback (Travel Device)

Portable/travel devices include a vibration motor for haptic feedback:

**Haptic Patterns:**
- **Short vibration** (100ms): Dose reminder
- **Double vibration** (100ms on, 50ms off, 100ms on): Missed dose alert
- **Long vibration** (500ms): Critical alert

**Device API Command:**
```bash
POST /api/v1/devices/{deviceId}/notify
Authorization: Bearer <device_jwt>
Content-Type: application/json

{
  "type": "haptic",
  "pattern": "double",  // "short", "double", "long"
  "intensity": 80  // 0-100
}
```

### 7.4 Integration with Firmware Event System

Device notifications are integrated with the firmware event system:

**Event Flow:**
```
Backend detects event (e.g., missed dose)
    ↓
Backend sends notification via device API
    ↓
Device receives notification command
    ↓
Device triggers local event: EVENT_NOTIFICATION_RECEIVED
    ↓
Event handler processes notification:
    • Plays audio (if not quiet hours)
    • Updates display
    • Activates LED
    • Triggers haptic (if portable device)
    ↓
Device sends acknowledgment to backend
```

**Firmware Event Handler:**
```c
void notification_event_handler(void* arg)
{
    notification_event_t* event = (notification_event_t*)arg;
    
    switch (event->alert_type)
    {
        case ALERT_MISSED_DOSE:
            if (!is_quiet_hours())
            {
                play_audio_alert("missed_dose", event->language);
            }
            display_show_message(event->message);
            led_set_color(LED_RED, LED_PATTERN_BLINK);
            if (device_type == DEVICE_PORTABLE)
            {
                haptic_vibrate(HAPTIC_PATTERN_DOUBLE);
            }
            break;
            
        // ... other alert types
    }
    
    // Send acknowledgment
    send_notification_ack(event->notification_id);
}
```

---

## 8. Background Job Implementation

### 8.1 MissedDoseAndLowStockHostedService (Current Implementation)

**Purpose:** A single hosted service that runs every 5 minutes and handles both (1) dispense events that remain unconfirmed for 60+ minutes (missed dose detection and notification creation) and (2) containers below low stock threshold (low stock notification creation).

**Schedule:** Runs every 5 minutes.

**Missed dose threshold:** 60 minutes (implementation uses `TimeSpan.FromMinutes(60)`).

**Implementation:** One `MissedDoseAndLowStockHostedService` executes in a loop with a 5-minute delay, calling logic to process missed doses (events older than 60 minutes) and low stock in one pass. There are no separate jobs running at 1 minute or 1 hour intervals.

**Database Query (missed doses):**
```sql
SELECT * FROM "DispenseEvents"
WHERE "Status" = 1  -- Pending
  AND "DispensedAtUtc" IS NOT NULL
  AND "DispensedAtUtc" < NOW() - INTERVAL '60 minutes'
  AND "ConfirmedAtUtc" IS NULL;
```

**Database Query (low stock):**
```sql
SELECT c.* FROM "Containers" c
INNER JOIN "Devices" d ON c."DeviceId" = d."Id"
WHERE c."Quantity" <= c."LowStockThreshold"
  AND c."LowStockThreshold" >= 0
  AND d."Status" = 0;  -- Active
```

### 8.2 Notification Delivery Queue (Planned)

**Purpose (Planned):** Asynchronously processes external notification deliveries (push, email, SMS) to avoid blocking the main request pipeline. **Not implemented:** `NotificationDeliveryQueue` does not exist in the current codebase.

**Queue Implementation:**
```csharp
public class NotificationDeliveryQueue : BackgroundService
{
    private readonly Channel<NotificationDeliveryRequest> _queue;
    
    public NotificationDeliveryQueue()
    {
        var options = new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<NotificationDeliveryRequest>(options);
    }
    
    public async Task EnqueueAsync(NotificationDeliveryRequest request)
    {
        await _queue.Writer.WriteAsync(request);
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var request in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await ProcessDeliveryAsync(request, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver notification {NotificationId}", 
                    request.NotificationId);
                
                // Retry logic
                if (request.RetryCount < 3)
                {
                    request.RetryCount++;
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                    await EnqueueAsync(request);
                }
            }
        }
    }
    
    private async Task ProcessDeliveryAsync(
        NotificationDeliveryRequest request, 
        CancellationToken cancellationToken)
    {
        switch (request.Channel)
        {
            case NotificationChannel.Push:
                await _pushService.SendAsync(request, cancellationToken);
                break;
            case NotificationChannel.Email:
                await _emailService.SendAsync(request, cancellationToken);
                break;
            case NotificationChannel.Sms:
                await _smsService.SendAsync(request, cancellationToken);
                break;
        }
    }
}
```

**Usage:**
```csharp
public class NotificationService
{
    public async Task SendNotificationAsync(Notification notification)
    {
        // Store in database (synchronous)
        await _notificationRepository.AddAsync(notification);
        
        // Queue external deliveries (asynchronous)
        var channels = GetChannelsForNotificationType(notification.Type);
        
        foreach (var channel in channels)
        {
            await _deliveryQueue.EnqueueAsync(new NotificationDeliveryRequest
            {
                NotificationId = notification.Id,
                Channel = channel,
                UserId = notification.UserId,
                Payload = BuildPayload(notification, channel)
            });
        }
    }
}
```

### 8.3 Webhook Delivery for B2B Partners

B2B partners receive notifications via webhooks in addition to standard channels:

**Webhook Event Types:**
- `notification.missed_dose`
- `notification.low_stock`
- `notification.refill_critical`
- `notification.device_offline`
- `notification.device_error`

**Webhook Payload:**
```json
{
  "eventType": "notification.missed_dose",
  "timestampUtc": "2026-02-10T08:30:00Z",
  "data": {
    "notificationId": "n1o2t3i4-...",
    "userId": "u1s2e3r4-...",
    "deviceId": "d1e2f3g4-...",
    "medicationName": "Metformin 500mg",
    "scheduledTime": "2026-02-10T08:00:00Z"
  }
}
```

**Delivery:**
- Webhooks are delivered asynchronously via `IWebhookDeliveryService`
- Retry logic: 3 attempts with exponential backoff
- Signature verification via HMAC-SHA256

---

## 9. Notification Preferences

### 9.1 Per-User Notification Settings Schema

**Database Schema:**
```sql
CREATE TABLE "UserNotificationSettings" (
    "Id" UUID PRIMARY KEY,
    "UserId" UUID NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "LanguagePreference" VARCHAR(2) NOT NULL DEFAULT 'en',
    "QuietHoursStart" TIME,
    "QuietHoursEnd" TIME,
    "EnableQuietHours" BOOLEAN NOT NULL DEFAULT true,
    "DailyDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "DailyDigestTime" TIME,
    "CreatedAtUtc" TIMESTAMP NOT NULL,
    "UpdatedAtUtc" TIMESTAMP NOT NULL
);

CREATE TABLE "NotificationChannelPreferences" (
    "Id" UUID PRIMARY KEY,
    "UserNotificationSettingsId" UUID NOT NULL REFERENCES "UserNotificationSettings"("Id") ON DELETE CASCADE,
    "NotificationType" INTEGER NOT NULL,
    "Channel" INTEGER NOT NULL,  -- Push, Email, SMS
    "Enabled" BOOLEAN NOT NULL DEFAULT true,
    UNIQUE("UserNotificationSettingsId", "NotificationType", "Channel")
);
```

**Entity Model:**
```csharp
public class UserNotificationSettings
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Language
    public string LanguagePreference { get; set; } = "en";  // en, fr, de, it
    
    // Quiet hours
    public TimeSpan? QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0);
    public TimeSpan? QuietHoursEnd { get; set; } = new TimeSpan(7, 0, 0);
    public bool EnableQuietHours { get; set; } = true;
    
    // Daily digest
    public bool DailyDigestEnabled { get; set; } = false;
    public TimeSpan? DailyDigestTime { get; set; } = new TimeSpan(9, 0, 0);
    
    // Channel preferences
    public ICollection<NotificationChannelPreference> ChannelPreferences { get; set; } = new List<NotificationChannelPreference>();
    
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public class NotificationChannelPreference
{
    public Guid Id { get; set; }
    public Guid UserNotificationSettingsId { get; set; }
    public UserNotificationSettings Settings { get; set; } = null!;
    public NotificationType NotificationType { get; set; }
    public NotificationChannel Channel { get; set; }  // Push, Email, SMS
    public bool Enabled { get; set; } = true;
}
```

### 9.2 Channel Preferences

Users can enable/disable specific channels for each notification type:

**Default Preferences:**
| Notification Type | Push | Email | SMS |
|:------------------|:----:|:-----:|:---:|
| MissedDose | ✅ | ❌ | ❌ |
| LowStock | ✅ | ✅ | ❌ |
| RefillCritical | ✅ | ✅ | ❌ |
| DeviceOffline | ✅ | ✅ | ❌ |
| DeviceError | ✅ | ✅ | ❌ |
| BatteryLow | ✅ | ❌ | ❌ |
| BatteryCritical | ✅ | ✅ | ❌ |
| DoseDispensed | ⚠️ | ❌ | ❌ |
| DoseTaken | ❌ | ❌ | ❌ |
| TravelStarted | ❌ | ❌ | ❌ |
| TravelEnded | ❌ | ❌ | ❌ |
| FirmwareAvailable | ❌ | ❌ | ❌ |

**API Endpoint:**
```bash
# Get notification preferences
GET /api/notifications/preferences
Authorization: Bearer <jwt>

# Update notification preferences
PUT /api/notifications/preferences
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "languagePreference": "en",
  "enableQuietHours": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00",
  "dailyDigestEnabled": false,
  "channelPreferences": [
    {
      "notificationType": "MissedDose",
      "channel": "Push",
      "enabled": true
    },
    {
      "notificationType": "MissedDose",
      "channel": "Email",
      "enabled": false
    }
  ]
}
```

### 9.3 Quiet Hours Configuration

Quiet hours suppress audio alerts on devices but do not affect push/email notifications.

**Configuration Options:**
- **Start Time**: Default 22:00 (10:00 PM)
- **End Time**: Default 07:00 (7:00 AM)
- **Enable/Disable**: Toggle quiet hours on/off
- **Timezone**: Uses user's timezone (from device or user profile)

**Web Portal UI:**
```
┌─────────────────────────────────────┐
│ Notification Preferences             │
├─────────────────────────────────────┤
│                                     │
│ Quiet Hours                         │
│ ☑ Enable quiet hours                │
│                                     │
│ Start: [22:00 ▼]                    │
│ End:   [07:00 ▼]                    │
│                                     │
│ During quiet hours, audio alerts    │
│ on devices will be suppressed.      │
│ Push and email notifications will   │
│ still be sent.                       │
│                                     │
└─────────────────────────────────────┘
```

### 9.4 Language Preference for Notifications

Notifications are localized based on user's language preference:

**Supported Languages:**
- **English (en)** - Default
- **French (fr)**
- **German (de)**
- **Italian (it)**

**Language Selection Priority:**
1. User's `LanguagePreference` setting
2. Device's timezone locale (fallback)
3. English (default fallback)

**Language Application:**
- **In-app notifications**: Title and body translated
- **Email templates**: Uses language-specific template
- **Device audio**: Plays language-specific WAV file
- **Push notifications**: Title and body translated

---

## 10. Rate Limiting & Deduplication (Planned)

**Not implemented:** `NotificationRateLimiter` and `NotificationDeduplicator` do not exist in the current codebase. The following describes the planned design.

### 10.1 Rate Limiting (Planned)

Rate limiting is planned to prevent notification spam and reduce user fatigue:

**Rules:**
- **Max 1 push notification per notification type per 10 minutes**
- **Max 1 email per notification type per 1 hour**
- **Max 1 SMS per notification type per 24 hours**
- **No limit on in-app notifications** (stored in database)

**Implementation:**
```csharp
public class NotificationRateLimiter
{
    private readonly IMemoryCache _cache;
    
    public async Task<bool> CanSendPushAsync(
        Guid userId, 
        NotificationType type, 
        CancellationToken cancellationToken)
    {
        var key = $"push_rate_limit:{userId}:{type}";
        
        if (_cache.TryGetValue(key, out _))
        {
            return false;  // Rate limited
        }
        
        // Set cache entry with 10-minute expiration
        _cache.Set(key, true, TimeSpan.FromMinutes(10));
        return true;
    }
    
    public async Task<bool> CanSendEmailAsync(
        Guid userId, 
        NotificationType type, 
        CancellationToken cancellationToken)
    {
        var key = $"email_rate_limit:{userId}:{type}";
        
        if (_cache.TryGetValue(key, out _))
        {
            return false;  // Rate limited
        }
        
        _cache.Set(key, true, TimeSpan.FromHours(1));
        return true;
    }
}
```

**Usage:**
```csharp
public async Task SendNotificationAsync(Notification notification)
{
    // Check rate limits
    if (channels.Contains(NotificationChannel.Push))
    {
        if (!await _rateLimiter.CanSendPushAsync(
            notification.UserId, 
            notification.Type, 
            cancellationToken))
        {
            _logger.LogWarning(
                "Rate limit exceeded for push notification {Type} to user {UserId}",
                notification.Type, 
                notification.UserId);
            channels.Remove(NotificationChannel.Push);
        }
    }
    
    // Send through allowed channels...
}
```

### 10.2 Deduplication

Deduplication prevents duplicate notifications for the same event:

**Deduplication Rules:**
- **DeviceOffline**: Suppress if unread notification exists for same device within last 1 hour
- **LowStock**: Suppress if unread notification exists for same container (already implemented)
- **DeviceError**: Suppress if same error code notified within last 1 hour
- **BatteryLow/Critical**: Suppress if notification sent within last 6 hours

**Implementation:**
```csharp
public class NotificationDeduplicator
{
    private readonly INotificationRepository _notificationRepository;
    
    public async Task<bool> IsDuplicateAsync(
        Guid userId, 
        NotificationType type, 
        Guid? relatedEntityId, 
        CancellationToken cancellationToken)
    {
        var timeWindow = GetDeduplicationWindow(type);
        var threshold = DateTime.UtcNow - timeWindow;
        
        var existing = await _notificationRepository
            .GetUnreadByTypeAndEntityAsync(
                userId, 
                type, 
                relatedEntityId, 
                threshold, 
                cancellationToken);
        
        return existing.Any();
    }
    
    private static TimeSpan GetDeduplicationWindow(NotificationType type)
    {
        return type switch
        {
            NotificationType.DeviceOffline => TimeSpan.FromHours(1),
            NotificationType.DeviceError => TimeSpan.FromHours(1),
            NotificationType.BatteryLow => TimeSpan.FromHours(6),
            NotificationType.BatteryCritical => TimeSpan.FromHours(6),
            NotificationType.LowStock => TimeSpan.FromDays(1),  // Already handled
            _ => TimeSpan.Zero  // No deduplication
        };
    }
}
```

**Usage:**
```csharp
public async Task SendNotificationAsync(Notification notification)
{
    // Check deduplication
    if (await _deduplicator.IsDuplicateAsync(
        notification.UserId, 
        notification.Type, 
        notification.RelatedEntityId, 
        cancellationToken))
    {
        _logger.LogInformation(
            "Skipping duplicate notification {Type} for entity {EntityId}",
            notification.Type, 
            notification.RelatedEntityId);
        return;
    }
    
    // Send notification...
}
```

### 10.3 Daily Digest Option

For non-critical notifications, users can opt into a daily digest:

**Digest Configuration:**
- **Enabled**: Toggle daily digest on/off
- **Delivery Time**: Default 9:00 AM (user's timezone)
- **Included Types**: LowStock, BatteryLow, DeviceStatus (non-critical)

**Digest Content:**
```
Subject: Daily Medication Summary - February 10, 2026

Good morning, John!

Here's your daily summary:

📊 Adherence
• 3 doses scheduled
• 2 confirmed
• 1 missed

💊 Low Stock Alerts
• Metformin 500mg (slot 1): 5 remaining
• Lisinopril 10mg (slot 3): 8 remaining

🔋 Device Status
• Kitchen Dispenser: Online, battery 85%
• Portable Dispenser: Online, battery 92%

View full details: https://smartdispenser.ch/dashboard
```

**Implementation:**
```csharp
public class DailyDigestJob : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1).AddHours(9);  // 9 AM tomorrow
            
            if (now.Hour == 9 && now.Minute == 0)
            {
                await SendDailyDigestsAsync(stoppingToken);
            }
            
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
    
    private async Task SendDailyDigestsAsync(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetUsersWithDailyDigestEnabledAsync(cancellationToken);
        
        foreach (var user in users)
        {
            var digestTime = user.NotificationSettings.DailyDigestTime ?? new TimeSpan(9, 0, 0);
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId ?? "UTC");
            var userLocalTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTimeZone);
            
            if (userLocalTime.TimeOfDay.Hours == digestTime.Hours)
            {
                await SendDigestForUserAsync(user, cancellationToken);
            }
        }
    }
}
```

---

## Appendix A: Notification Entity Reference

**Full Entity Definition:**
```csharp
public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid? RelatedEntityId { get; set; }  // Links to Device, Container, DispenseEvent, etc.
}
```

**NotificationType Enum:**
```csharp
public enum NotificationType
{
    MissedDose = 0,
    LowStock = 1,
    TravelStarted = 2,
    TravelEnded = 3,
    General = 4,
    DoseDispensed = 5,
    DoseTaken = 6,
    RefillCritical = 7,
    DeviceOnline = 8,
    DeviceOffline = 9,
    DeviceError = 10,
    DeviceStatus = 11,
    BatteryLow = 12,
    BatteryCritical = 13
}
```

---

## Appendix B: API Endpoints Summary

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/api/notifications` | GET | Get user's notifications |
| `/api/notifications/{id}/read` | POST | Mark notification as read (204 No Content) |
| `/api/notifications/tokens` | POST | Register push notification token |
| `/api/notifications/tokens/{id}` | DELETE | Unregister push notification token |
| `/api/notifications/preferences` | GET | Get notification preferences |
| `/api/notifications/preferences` | PUT | Update notification preferences |

---

## Appendix C: Configuration Reference

**appsettings.json:**
```json
{
  "Notification": {
    "Push": {
      "Fcm": {
        "ServerKey": "AAA...",
        "SenderId": "123456789"
      },
      "Apns": {
        "KeyId": "ABC123",
        "TeamId": "DEF456",
        "BundleId": "ch.smartdispenser.app",
        "P8KeyPath": "/path/to/AuthKey.p8"
      },
      "Expo": {
        "AccessToken": "exp_xxx..."
      }
    },
    "Email": {
      "Provider": "SendGrid",
      "FromAddress": "notifications@smartdispenser.ch",
      "FromName": "Smart Medication Dispenser",
      "SendGrid": {
        "ApiKey": "SG.xxx..."
      },
      "Azure": {
        "ConnectionString": "endpoint=https://..."
      }
    },
    "Sms": {
      "Provider": "Twilio",
      "FromNumber": "+1234567890",
      "Twilio": {
        "AccountSid": "ACxxx...",
        "AuthToken": "xxx..."
      }
    },
    "RateLimiting": {
      "PushWindowMinutes": 10,
      "EmailWindowHours": 1,
      "SmsWindowHours": 24
    }
  }
}
```

---

**End of Document**
