# Mobile App Documentation

**Smart Medication Dispenser — React Native / Expo Patient Application**

**Version 2.1 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.1 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | Mobile Engineers |
| **Related Documents** | [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md), [02_BACKEND_API.md](./02_BACKEND_API.md), [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) |

---

## 1. Overview

The mobile app is built for **patients** to manage their daily medication, receive reminders, confirm dose intake, and view their dispense history.

| Aspect | Detail |
|:-------|:-------|
| **Framework** | React Native 0.76.5 |
| **Platform** | Expo ~52.0.0 (managed workflow) |
| **Language** | TypeScript |
| **Navigation** | Expo Router ~4.0.0 (file-based routing) |
| **HTTP Client** | Axios |
| **State Management** | React Context (AuthContext) |
| **Token Storage** | AsyncStorage (persistent across app restarts) |
| **Notifications** | Expo Notifications (local) |
| **Target Platforms** | iOS, Android |
| **Bundle ID (iOS)** | com.smartdispenser.mobile |
| **Package (Android)** | com.smartdispenser.mobile |

---

## 2. Project Structure

```
mobile/
├── app.json                      # Expo configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── babel.config.js               # Babel configuration
├── .env.example                  # Example environment variables
│
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout (AuthProvider wrapper)
│   ├── index.tsx                 # Entry redirect (→ login or home)
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Registration screen
│   │
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── home.tsx              # Today's schedule & quick actions
│   │   ├── devices.tsx           # Device list & management
│   │   ├── history.tsx           # Dispense event history
│   │   ├── notifications.tsx    # Alerts (notification center)
│   │   └── profile.tsx          # User profile, adherence, settings, logout
│   │
│   ├── containers/
│   │   └── [deviceId].tsx       # Container management for a device
│   │
│   ├── schedules/
│   │   └── [containerId].tsx    # Schedule management for a container
│   │
│   └── dose/
│       └── [id].tsx              # Dose detail / confirmation screen (id = scheduleId)
│
└── src/
    ├── api/
    │   ├── client.ts             # Axios instance + all API functions
    │   └── deviceEvents.ts       # Device event type utilities
    │
    ├── context/
    │   └── AuthContext.tsx        # Authentication provider
    │
    └── notifications/
        └── scheduleNotifications.ts  # Local notification scheduling
```

---

## 3. Navigation Architecture

### 3.1 Expo Router (File-Based Routing)

```
app/
├── _layout.tsx       → Root layout (wraps everything in AuthProvider)
├── index.tsx         → "/" — Redirect based on auth state
├── login.tsx         → "/login" — Public login screen
├── register.tsx      → "/register" — Public registration screen
│
├── (tabs)/           → Tab group (protected)
│   ├── _layout.tsx   → Tab bar with 5 tabs
│   ├── home.tsx      → "/(tabs)/home" — Today's schedule
│   ├── devices.tsx   → "/(tabs)/devices" — Device list
│   ├── history.tsx   → "/(tabs)/history" — Event history
│   ├── notifications.tsx → "/(tabs)/notifications" — Alerts
│   └── profile.tsx   → "/(tabs)/profile" — Profile & settings
│
├── containers/
│   └── [deviceId].tsx → "/containers/:deviceId" — Container management (from Devices tab)
│
├── schedules/
│   └── [containerId].tsx → "/schedules/:containerId" — Schedule management (params: containerId, medicationName)
│
└── dose/
    └── [id].tsx      → "/dose/:id" — Dose detail (id = scheduleId; dispense event ID obtained after dispense())
```

### 3.2 Navigation Flow

```
App Launch
    │
    ├── Has token? → Validate with GET /api/auth/me
    │       │
    │       ├── Valid → Navigate to /(tabs)/home
    │       └── Invalid → Clear token → /login
    │
    └── No token → /login
          │
          ├── Login success → /(tabs)/home
          └── Register link → /register
                └── Register success → /(tabs)/home
```

### 3.3 Tab Bar Configuration

Tabs use a custom text-in-circle **TabIcon** component with labels (not emoji icons): **H**, **D**, **Hi**, **N**, **P**.

| Tab | Icon Label | Screen | Description |
|:----|:-----------|:-------|:------------|
| **Home** | H | `home.tsx` | Today's schedule, quick dispense/confirm |
| **Devices** | D | `devices.tsx` | Device list, status, pause/resume |
| **History** | Hi | `history.tsx` | Past dispense events timeline |
| **Alerts** | N | `notifications.tsx` | Alerts with unread badge (code: `options.title: 'Alerts'`) |
| **Profile** | P | `profile.tsx` | User info, adherence summary, settings, logout |

---

## 4. Screens

### 4.1 Home Screen (`home.tsx`)

**Primary screen for daily medication management.**

**Features:**
- Today's medication schedule (sorted by time)
- For each scheduled dose:
  - Medication name and slot number
  - Scheduled time
  - Status badge (Pending, Dispensed, Confirmed, Missed)
  - "Dispense" button (triggers physical dispense)
  - "Confirm" button (marks dose as taken)
  - "Delay" button (snooze reminder)
- Pull-to-refresh for latest schedule
- Device selector (if user has multiple devices)

**API Calls:**
- `schedulesApi.today(deviceId, timeZoneId)` — Get today's schedule
- `dispensingApi.dispense(deviceId, { scheduleId })` — Trigger dispense
- `dispensingApi.confirm(eventId)` — Confirm intake
- `dispensingApi.delay(eventId, { minutes })` — Delay reminder

### 4.2 Devices Screen (`devices.tsx`)

**Device management and status monitoring.**

**Features:**
- List all user's devices with status indicators
- Device type badge (Main / Portable)
- Connection status (online/offline)
- Battery level (portable devices)
- WiFi signal strength
- Pause/Resume toggle
- Last heartbeat timestamp

**API Calls:**
- `devicesApi.list()` — List all devices
- `devicesApi.pause(id)` — Pause device
- `devicesApi.resume(id)` — Resume device

### 4.3 History Screen (`history.tsx`)

**Dispense event history and adherence tracking.**

**Features:**
- Timeline of dispense events
- Status-colored entries:
  - Green: Confirmed (taken)
  - Red: Missed
  - Yellow: Pending
  - Orange: Delayed
- Medication name and time
- Date filter (today, this week, custom range)
- Device filter

**API Calls:**
- `historyApi.events(deviceId, { fromUtc, toUtc, limit })` — Get event history

### 4.4 Alerts Screen (`notifications.tsx`)

**Alert center for medication and device notifications.** Tab title in code: **Alerts** (`options.title: 'Alerts'`).

**Features:**
- Notification list sorted by date (newest first)
- Type badges (Missed Dose, Low Stock, Device Error, etc.)
- Unread/read status
- Tap to mark as read
- Notification detail view

**API Calls:**
- `notificationsApi.list(limit)` — Get notifications
- `notificationsApi.markRead(id)` — Mark as read

### 4.5 Profile Screen (`profile.tsx`)

**Fifth tab: user info, adherence summary, connected devices, and settings.**

**Features:**
- User info from `authApi.meProfile()` (uses **MeProfileResponse**)
- Adherence summary from `adherenceApi.me()` (uses **AdherenceSummaryDto**)
- Connected devices list
- Settings: notification preferences, language & region, privacy, about
- Preferences stored in **AsyncStorage**
- Logout

**API Calls:**
- `authApi.meProfile()` — User profile
- `adherenceApi.me()` — Adherence summary

### 4.6 Container Management Screen (`containers/[deviceId].tsx`)

**Container management for a device.** Reached from the Devices tab.

**Route:** `/containers/:deviceId`

**Features:**
- List containers for the device (`containersApi.listByDevice(deviceId)`)
- Add container (`containersApi.create`)
- Delete container (`containersApi.delete`)
- Tap container → navigate to `/schedules/[containerId]`

**API Calls:**
- `containersApi.listByDevice(deviceId)` — List containers
- `containersApi.create` — Add container
- `containersApi.delete` — Delete container

### 4.7 Schedule Management Screen (`schedules/[containerId].tsx`)

**Schedule management for a container.**

**Route:** `/schedules/:containerId` (params: **containerId**, **medicationName**)

**Features:**
- List schedules for the container (`schedulesApi.listByContainer(containerId)`)
- Add schedule (`schedulesApi.create`)
- Delete schedule (`schedulesApi.delete`)

**API Calls:**
- `schedulesApi.listByContainer(containerId)` — List schedules
- `schedulesApi.create` — Add schedule
- `schedulesApi.delete` — Delete schedule

### 4.8 Dose Detail Screen (`dose/[id].tsx`)

**Dynamic route for individual dose confirmation.**

**Route:** `/dose/:id` — The route param **`id` is the scheduleId**, NOT the dispense event ID. The dispense event ID is obtained after calling `dispensingApi.dispense()`.

**Features:**
- Medication details (name, pills per dose, slot)
- Scheduled time and current status
- Large "Confirm Taken" button
- "Delay" option with minute selector
- Status history for this dose

**API Calls:**
- `dispensingApi.confirm(eventId)` — Confirm intake (eventId from dispense response)
- `dispensingApi.delay(eventId, { minutes })` — Delay

### 4.9 Login Screen (`login.tsx`)

**Authentication entry point.**

**Features:**
- Email and password fields
- Login button
- "Create account" link to register
- Error display for invalid credentials
- Loading state during API call

### 4.10 Register Screen (`register.tsx`)

**New user registration.**

**Features:**
- Email, password, full name fields
- Role selection (Patient)
- Register button
- "Already have account" link to login
- Validation error display

---

## 5. Authentication

### 5.1 AuthContext

```typescript
// context/AuthContext.tsx
// The context exposes user and loading only. Token is NOT in the context type.
// Token is stored in AsyncStorage and set via api/client.ts setAuthToken().
interface AuthContextType {
  user: { id: string; email: string; fullName: string; role: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}
```

### 5.2 Token Storage

The mobile app uses **two-layer token storage**:

1. **AsyncStorage (persistent):** Token persisted to device storage via `@react-native-async-storage/async-storage` under key `"token"`
2. **In-memory (runtime):** Token also stored in `authToken` variable in `api/client.ts` for Axios interceptor

**On app launch:**
```
1. Read token from AsyncStorage
2. If token exists → set authToken in api/client.ts
3. Call GET /api/auth/me to validate token
4. If valid → set user state, navigate to Home
5. If invalid → clear AsyncStorage, navigate to Login
```

**On login/register:**
```
1. Call POST /api/auth/login (or /register)
2. Store token in AsyncStorage (persistent)
3. Set authToken in api/client.ts (in-memory)
4. Set user state from response
```

**On logout:**
```
1. Remove token from AsyncStorage
2. Clear authToken in api/client.ts
3. Clear user state → navigates to Login
```

### 5.3 API Client Authentication

```typescript
// api/client.ts
export let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

// Request interceptor adds Bearer token
api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// 401 response clears token
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) authToken = null;
    return Promise.reject(err);
  }
);
```

---

## 6. API Client

### 6.1 Base URL Configuration

```typescript
const baseURL = Constants.expoConfig?.extra?.apiUrl 
  ?? process.env.EXPO_PUBLIC_API_URL 
  ?? 'http://localhost:5000';
```

**Priority:**
1. Expo config extra (`app.json` → `expo.extra.apiUrl`)
2. Environment variable (`EXPO_PUBLIC_API_URL`)
3. Fallback: `http://localhost:5000`

### 6.2 Available API Functions

| Group | Methods |
|:------|:--------|
| `authApi` | register, login, me, meProfile |
| `devicesApi` | list, get, pause, resume |
| `containersApi` | listByDevice, create, update, delete |
| `schedulesApi` | today, listByContainer, create, update, delete |
| `dispensingApi` | dispense, confirm, delay |
| `historyApi` | events |
| `adherenceApi` | me (adherence summary) |
| `travelApi` | start, end |
| `notificationsApi` | list, markRead |

### 6.3 Error Handling

```typescript
// Utility function to extract user-friendly error messages
export function getApiErrorMessage(err: unknown): string {
  // Checks: response.data.detail → response.data.message → 
  //         response.data.errors (first) → generic message
}
```

### 6.4 Device DTO (Extended for Mobile)

The mobile client includes additional device fields:

```typescript
export type DeviceDto = {
  id: string;
  userId: string;
  name: string;
  type: 'Main' | 'Portable';
  status: 'Active' | 'Paused';
  timeZoneId?: string;
  lastHeartbeatAtUtc?: string;
  firmwareVersion?: string;
  isOnline: boolean;
  batteryLevel?: number;     // 0-100
  wifiSignal?: number;       // dBm
  temperature?: number;      // Celsius
  humidity?: number;          // 0-100
};
```

---

## 7. Notifications

### 7.1 Local Notifications

The app uses **Expo Notifications** for local push notifications via `scheduleNotifications.ts`:

**Notification Handler (foreground):**
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

**Android Channel:** `dose-reminders` (HIGH importance)

**Scheduling Flow:**
```
1. Home screen loads → calls scheduleDoseNotifications(todayItems, deviceId)
2. Cancels ALL previously scheduled notifications
3. Requests notification permission (creates Android channel if needed)
4. For each future dose → schedules local notification with:
   - Title: "Time for medication"
   - Body: "{medicationName} – {pillsPerDose} pill(s)"
   - Data: { scheduleId, containerId, deviceId, medicationName, pillsPerDose }
```

**Notification Tap Handler (in root _layout.tsx):**
```
When user taps notification:
  → addNotificationResponseListener() extracts data payload
  → Navigates to /dose/[id] with scheduleId, containerId, deviceId params
```

### 7.2 Notification Types

| Type | Trigger | Priority |
|:-----|:--------|:---------|
| Dose Reminder | Scheduled dose time (future only) | High |
| Missed Dose | Server-side (background hosted service) | Critical |
| Low Stock | Server-side (background hosted service) | Medium |

> **Note:** Only dose reminders are local notifications. Missed dose and low stock alerts come from the server as in-app notifications via the `/api/notifications` endpoint.

### 7.3 Expo Configuration

```json
// app.json
{
  "expo": {
    "plugins": ["expo-router", "expo-notifications", "expo-localization"]
  }
}
```

---

## 8. Build & Development

### 8.1 Setup Commands

```bash
# Install dependencies
cd mobile
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

### 8.2 Development

```bash
# Start Expo dev server
npx expo start

# Options:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app on physical device
```

### 8.3 Important: API URL for Physical Devices

When running on a physical device, `localhost` won't work. Use your machine's IP:

```bash
# Find your IP
# Windows: ipconfig
# Mac/Linux: ifconfig

# Set in .env:
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

### 8.4 Building for Production

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Or with EAS Build
npx eas build --platform ios
npx eas build --platform android
```

---

## 9. Expo Configuration

### 9.1 app.json

```json
{
  "expo": {
    "name": "Smart Medication Dispenser",
    "slug": "smart-medication-dispenser",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "smartdispenser",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.smartdispenser.mobile"
    },
    "android": {
      "package": "com.smartdispenser.mobile"
    },
    "plugins": ["expo-router", "expo-notifications", "expo-localization"]
  }
}
```

### 9.2 Key Configuration

| Setting | Value | Description |
|:--------|:------|:------------|
| `scheme` | smartdispenser | Deep link URL scheme |
| `userInterfaceStyle` | automatic | Follows system dark/light mode |
| `orientation` | portrait | Lock to portrait mode |
| `plugins` | expo-router, expo-notifications, expo-localization | Required Expo plugins |

---

## 10. Dependencies

### 10.1 Key Dependencies

| Package | Version | Purpose |
|:--------|:--------|:--------|
| `expo` | ~52.0.0 | Expo framework |
| `react-native` | 0.76.5 | Mobile UI framework |
| `expo-router` | ~4.0.0 | File-based navigation |
| `expo-notifications` | ~0.29.9 | Local push notifications |
| `@react-native-async-storage/async-storage` | 1.23.1 | Persistent token storage |
| `axios` | ^1.7.7 | HTTP client |
| `expo-constants` | ~17.0.3 | Access app configuration |
| `expo-linking` | ~7.0.3 | Deep linking |
| `expo-splash-screen` | ~0.29.18 | Splash screen management |
| `expo-localization` | ~16.0.1 | Locale / language detection |
| `expo-status-bar` | ~2.0.0 | Status bar styling |
| `react-native-safe-area-context` | 4.12.0 | Safe area insets |
| `react-native-screens` | ~4.4.0 | Native screen containers |

### 10.2 Package Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

## 11. Known Limitations (MVP)

| Limitation | Description | Future Plan |
|:-----------|:------------|:------------|
| **Token in AsyncStorage** | Uses AsyncStorage (not encrypted) | Migrate to Expo SecureStore for encrypted storage |
| **Local notifications only** | No FCM/APNs push server | Integrate Firebase Cloud Messaging |
| **No offline support** | Requires network for all actions | Add local cache + sync queue |
| **No biometric auth** | Password-only login | Add fingerprint/face authentication |
| **No image upload** | Medication images are URL-only | Add camera/gallery image upload |
| **Single language** | English only | Add i18n localization |

---

## 12. Push Notifications (Planned)

### 12.1 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 PUSH NOTIFICATION FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Backend Event                                                │
│  (Missed Dose, Low Stock)                                    │
│        │                                                      │
│        ▼                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │ Notification  │────▶│ Expo Push    │────▶│ FCM / APNs   │ │
│  │ Service       │     │ Server       │     │              │ │
│  └──────────────┘     └──────────────┘     └──────┬───────┘ │
│                                                     │         │
│                                                     ▼         │
│                                              ┌──────────────┐ │
│                                              │ Mobile Device │ │
│                                              │ (iOS/Android) │ │
│                                              └──────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 12.2 Expo Push Token Registration

```typescript
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  
  // Send token to backend
  await api.post('/api/devices/push-token', {
    token: token.data,
    platform: Platform.OS, // 'ios' or 'android'
  });
  
  return token.data;
}
```

### 12.3 Push Notification Types

| Notification | Title (EN) | Body Example | Action |
|:-------------|:-----------|:-------------|:-------|
| Dose Reminder | "Time for medication" | "Metformin 500mg — 2 pills" | Open dose screen |
| Missed Dose | "Missed dose alert" | "Metformin dose at 08:00 was not taken" | Open dose screen |
| Low Stock | "Refill needed" | "Vitamin D: 5 pills remaining" | Open containers |
| Battery Low | "Battery low" | "Travel Dispenser battery at 15%" | Open devices |
| Device Offline | "Device offline" | "Home Dispenser lost connection" | Open devices |
| Caregiver Alert | "Patient missed dose" | "John's Metformin dose at 08:00" | Open patient view |

### 12.4 Notification Channels (Android)

| Channel | ID | Importance | Sound | Vibrate |
|:--------|:---|:-----------|:------|:--------|
| Dose Reminders | `dose-reminders` | HIGH | Default | Yes |
| Alerts | `alerts` | MAX | Alarm | Yes |
| Device Status | `device-status` | DEFAULT | None | No |
| General | `general` | LOW | None | No |

---

## 13. Offline Support (Planned)

### 13.1 Offline Strategy

| Data | Offline Behavior | Sync Strategy |
|:-----|:----------------|:-------------|
| Today's schedule | Cached locally, shown immediately | Refresh on network restore |
| Dose confirmation | Queued locally, synced when online | Optimistic UI + background sync |
| Device list | Cached locally | Refresh on app foreground |
| Notifications | Last 50 cached locally | Fetch delta on reconnect |
| History | Last 7 days cached | Paginated sync |

### 13.2 Local Cache Implementation

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache with expiration
async function cacheData(key: string, data: any, ttlMinutes: number) {
  const item = {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  };
  await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
}

async function getCachedData<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`cache_${key}`);
  if (!raw) return null;
  const item = JSON.parse(raw);
  if (Date.now() > item.expiry) {
    await AsyncStorage.removeItem(`cache_${key}`);
    return null;
  }
  return item.data as T;
}
```

### 13.3 Offline Action Queue

```typescript
// Queue actions when offline, sync when online
interface QueuedAction {
  id: string;
  type: 'CONFIRM_DOSE' | 'DELAY_DOSE';
  payload: any;
  timestamp: string;
}

async function queueAction(action: QueuedAction) {
  const queue = await getCachedData<QueuedAction[]>('action_queue') || [];
  queue.push(action);
  await cacheData('action_queue', queue, 1440); // 24h TTL
}

async function syncQueue() {
  const queue = await getCachedData<QueuedAction[]>('action_queue') || [];
  for (const action of queue) {
    try {
      await processAction(action);
      // Remove from queue on success
    } catch (e) {
      break; // Stop on first failure, retry later
    }
  }
}
```

### 13.4 Network Status Detection

```typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncQueue(); // Sync queued actions when back online
  }
});
```

---

## 14. Internationalization (i18n) — Planned

### 14.1 Setup

| Setting | Value |
|:--------|:------|
| **Library** | react-i18next + expo-localization |
| **Languages** | fr-CH, de-CH, it-CH, en |
| **Detection** | System language → user preference → fallback (en) |

### 14.2 Implementation

```typescript
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, de: { translation: de }, it: { translation: it } },
  lng: Localization.getLocales()[0]?.languageCode || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### 14.3 Date Formatting

```typescript
import { format } from 'date-fns';
import { fr, de, it, enUS } from 'date-fns/locale';

const locales = { fr, de, it, en: enUS };

function formatDate(date: Date, formatStr: string = 'dd.MM.yyyy') {
  const locale = locales[i18n.language] || enUS;
  return format(date, formatStr, { locale });
}
```

---

## 15. Biometric Authentication (Planned)

### 15.1 Implementation with Expo SecureStore + LocalAuthentication

```typescript
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Store token securely (encrypted)
async function storeTokenSecurely(token: string) {
  await SecureStore.setItemAsync('auth_token', token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

// Biometric authentication on app launch
async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (!hasHardware || !isEnrolled) return false;
  
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Smart Medication Dispenser',
    cancelLabel: 'Use password',
    disableDeviceFallback: false,
  });
  
  return result.success;
}
```

### 15.2 Biometric Flow

```
App Launch
    │
    ├── Biometric enabled?
    │       │
    │       ├── Yes → Prompt biometric (Face ID / Fingerprint)
    │       │       │
    │       │       ├── Success → Load token from SecureStore → Home
    │       │       └── Fail → Show password login
    │       │
    │       └── No → Check token in SecureStore
    │               │
    │               ├── Valid → Home
    │               └── Invalid → Login screen
    │
    └── First launch → Login screen
```

---

## 16. Accessibility (a11y)

### 16.1 React Native Accessibility

| Feature | Implementation | Status |
|:--------|:-------------|:-------|
| **VoiceOver (iOS)** | `accessibilityLabel` on all interactive elements | Planned |
| **TalkBack (Android)** | `accessibilityLabel` on all interactive elements | Planned |
| **Font scaling** | Support system font size (up to 200%) | ✅ (React Native default) |
| **Touch targets** | Minimum 48x48dp touch targets | ✅ |
| **Color contrast** | 4.5:1 minimum (WCAG AA) | ✅ |
| **Screen reader roles** | `accessibilityRole` for buttons, headings | Planned |
| **Live regions** | `accessibilityLiveRegion` for status updates | Planned |

### 16.2 Elderly-Friendly Design

| Feature | Implementation |
|:--------|:-------------|
| **Large buttons** | 56dp minimum height for primary actions |
| **High contrast text** | Dark text on light backgrounds |
| **Simple navigation** | 5 tabs max, no nested menus |
| **Clear icons** | Icon + text labels (never icon-only) |
| **Confirmation dialogs** | "Are you sure?" for critical actions |
| **Audio feedback** | Sound on dose confirmation (device) |
| **Haptic feedback** | Vibration on button press |

---

## 17. State Management Architecture

### 17.1 State Strategy

| State Type | Storage | Scope | Persistence |
|:-----------|:--------|:------|:------------|
| **Auth state** | React Context + AsyncStorage | Global | Persisted to device |
| **Server data** | Component state (→ React Query) | Per screen | Memory |
| **Navigation state** | Expo Router | Global | URL/deep link |
| **Form state** | Local useState | Per screen | Memory |
| **Notification state** | Expo Notifications | System | OS-managed |

### 17.2 Auth State Flow

```
┌──────────────────────────────────────────────────┐
│                AUTH STATE MACHINE                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────┐  token found  ┌──────────┐         │
│  │ Loading  │─────────────▶│ Validating│         │
│  │ (init)   │              │ (API call)│         │
│  └────┬─────┘              └─────┬─────┘         │
│       │ no token                 │                │
│       ▼                   valid  │  invalid       │
│  ┌─────────┐              ┌──────▼─────┐         │
│  │  Logged  │◀─────────── │Authenticated│         │
│  │  Out     │  logout     │ (user set)  │         │
│  └─────────┘              └────────────┘         │
│       │                          │                │
│       │ login/register           │ 401 response   │
│       └──────────────────────────┘                │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 17.3 Data Fetching Per Screen

| Screen | API Calls | Refresh Strategy | Cache |
|:-------|:----------|:----------------|:------|
| Home | `schedulesApi.today()` | Pull-to-refresh + 30s interval | 60s stale |
| Devices | `devicesApi.list()` | Pull-to-refresh | 30s stale |
| History | `historyApi.events()` | Pull-to-refresh | No cache |
| Alerts | `notificationsApi.list()` | Pull-to-refresh + badge count | 60s stale |
| Profile | `authApi.meProfile()`, `adherenceApi.me()` | On focus | 60s stale |
| Dose Detail | `dispensingApi.confirm/delay()` | After action | No cache |

### 17.4 Deep Linking (Planned)

Deep links are **not implemented** in the current code. The following are planned:

| URL | Screen | Parameters |
|:----|:-------|:-----------|
| `smartdispenser://home` | Home tab | — |
| `smartdispenser://dose/{id}` | Dose detail | scheduleId, containerId, deviceId |
| `smartdispenser://devices` | Devices tab | — |
| `smartdispenser://notifications` | Alerts tab | — |

---

## 18. Feature Roadmap Alignment

### 18.1 Implementation Phases

| Feature | Phase | Timeline | Status |
|:--------|:------|:---------|:-------|
| Core medication management | MVP | Q4 2025 | ✅ Implemented |
| Local dose notifications | MVP | Q4 2025 | ✅ Implemented |
| Device management | MVP | Q4 2025 | ✅ Implemented |
| Push notifications (FCM/APNs) | Phase 2 | Q3-Q4 2026 | Planned |
| Offline support + sync | Phase 2 | Q3-Q4 2026 | Planned |
| Multi-language (FR/DE/IT/EN) | Phase 2 | Q3-Q4 2026 | Planned |
| Biometric authentication | Phase 2 | Q3-Q4 2026 | Planned |
| Voice assistant integration | Phase 3 | 2027 | Planned |
| Caregiver patient view | Phase 2 | Q3-Q4 2026 | Planned |
| Weekly/monthly adherence reports | Phase 2 | Q3-Q4 2026 | Planned |
| Smart home integration | Phase 3 | 2027 | Planned |

### 18.2 Platform Requirements

| Platform | Minimum Version | Target |
|:---------|:---------------|:-------|
| iOS | 15.0 | Latest (17+) |
| Android | 10 (API 29) | Latest (14+) |
| Expo SDK | ~52.0.0 | Latest stable |
| React Native | 0.76+ | Latest stable |
