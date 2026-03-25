# Web Portal Documentation

**Smart Medication Dispenser — React + TypeScript + Vite Caregiver Portal**

**Version 2.1 — February 2026**

---

## Document Information

| Field | Value |
|:------|:------|
| **Document Version** | 2.1 |
| **Last Updated** | February 2026 |
| **Author** | Smart Medication Dispenser Engineering Team |
| **Audience** | Frontend Engineers |
| **Related Documents** | [01_SOFTWARE_ARCHITECTURE.md](./01_SOFTWARE_ARCHITECTURE.md), [02_BACKEND_API.md](./02_BACKEND_API.md), [07_AUTHENTICATION.md](./07_AUTHENTICATION.md) |

---

## 1. Overview

The web portal is a **single-page application (SPA)** built for caregivers and administrators to manage medication dispensers, monitor patient adherence, and configure integrations.

| Aspect | Detail |
|:-------|:-------|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS 3.x |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Routing** | React Router v6 (BrowserRouter) |
| **HTTP Client** | Axios |
| **State Management** | React Context (AuthContext) |
| **Charts** | Recharts |
| **Animations** | Motion (imported from `motion/react`) |
| **Icons** | Lucide React |
| **Form Validation** | React Hook Form + Zod |
| **Toast Notifications** | Sonner |
| **Dev Server** | http://localhost:5173 |

---

## 2. Project Structure

```
web/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build & dev server config
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS plugins
├── .env                          # Environment variables
├── .env.example                  # Example env file
│
├── public/
│   └── vite.svg                  # Static assets
│
└── src/
    ├── main.tsx                  # React DOM render entry
    ├── App.tsx                   # Root component (routing)
    ├── index.css                 # Global styles + Tailwind imports
    ├── vite-env.d.ts             # Vite type definitions
    │
    ├── api/
    │   └── client.ts             # Axios instance + all API functions
    │
    ├── pages/                    # 12 page components
    │   ├── Dashboard.tsx         # Home dashboard with adherence & today's schedule
    │   ├── Devices.tsx           # Device list management
    │   ├── DeviceDetail.tsx      # Single device detail view
    │   ├── Containers.tsx        # Container (slot) management per device
    │   ├── Schedules.tsx         # Schedule management per container
    │   ├── History.tsx           # Dispense event history
    │   ├── Travel.tsx            # Travel mode management
    │   ├── Notifications.tsx     # Notification center
    │   ├── Integrations.tsx      # Webhooks & API key management
    │   ├── Settings.tsx          # Profile, system health, notifications, region/language
    │   ├── Login.tsx             # Login page
    │   └── Register.tsx          # Registration page
    │
    ├── components/
    │   ├── Layout.tsx            # Main layout with top header and horizontal navigation
    │   └── ProtectedRoute.tsx    # Auth guard (redirects to /login)
    │
    ├── app/components/
    │   ├── figma/
    │   │   └── ImageWithFallback.tsx
    │   └── ui/                   # shadcn/ui components
    │       ├── alert-dialog.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── progress.tsx
    │       ├── select.tsx
    │       ├── sonner.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       └── utils.ts
    │
    ├── contexts/
    │   └── AuthContext.tsx        # Authentication provider
    │
    ├── lib/
    │   └── deviceTypes.ts        # Device type constants
    │
    ├── styles/
    │   ├── theme.css             # CSS custom properties (colors, sizes)
    │   └── responsive.css        # Mobile-responsive breakpoints
    │
    └── utils/
        └── apiError.ts           # API error message extraction
```

---

## 3. Routing

### 3.1 Route Map

```
/                        → Dashboard (protected)
├── /login               → Login page (public)
├── /register            → Registration page (public)
├── /devices             → Device list (protected)
│   └── /devices/:deviceId           → Device detail (protected)
│       └── /devices/:deviceId/containers → Containers for device (protected)
├── /schedules           → Redirects to /devices (Navigate component)
├── /containers/:containerId/schedules → Schedules for container (protected)
├── /history             → Dispense event history (protected)
├── /travel              → Travel mode management (protected)
├── /notifications       → Notification center (protected)
├── /integrations        → Webhooks & API keys (protected)
├── /settings            → Settings (profile, system health, notifications, region/language) (protected)
└── /*                   → Redirect to / (catch-all)
```

### 3.2 Route Configuration

```tsx
// App.tsx — simplified route structure
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes (require JWT) */}
  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="devices" element={<Devices />} />
    <Route path="devices/:deviceId" element={<DeviceDetail />} />
    <Route path="devices/:deviceId/containers" element={<Containers />} />
    <Route path="schedules" element={<Navigate to="/devices" replace />} />
    <Route path="containers/:containerId/schedules" element={<Schedules />} />
    <Route path="history" element={<History />} />
    <Route path="travel" element={<Travel />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="integrations" element={<Integrations />} />
    <Route path="settings" element={<Settings />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### 3.3 Protected Route Component

```tsx
// ProtectedRoute.tsx
// If no token in context (localStorage key 'token') → redirect to /login
// Otherwise → render children
```

---

## 4. Authentication (AuthContext)

### 4.1 Authentication Flow

The web portal's AuthContext uses the **real API** via `api/client.ts`: `authApi.login()`, `authApi.register()`, and `authApi.me()` for authentication.

**Flow:**
```
1. User enters email/password on Login page
2. AuthContext calls authApi.login() → POST /api/auth/login → returns { token, email, fullName, role, userId }
3. AuthContext stores token under key 'token' in localStorage
4. Axios interceptor adds "Authorization: Bearer <token>" to all requests (reads from localStorage.token)
5. On 401 response → clear token → redirect to /login
6. On page load → check localStorage for existing token → authApi.me() (GET /api/auth/me) to validate and load user
```

### 4.2 AuthContext API

| Property/Method | Type | Description |
|:----------------|:-----|:------------|
| `user` | User \| null | Current user info (id, email, fullName, role) |
| `loading` | boolean | True while checking auth on mount |
| `login(email, password)` | async function | Login and store token + user data |
| `register(email, password, fullName, role)` | async function | Register and store token + user data |
| `logout()` | function | Clear token, clear user data |

### 4.3 Token Management

- **Storage Key:** `token` (JWT string) in `localStorage`; user data is refreshed via `authApi.me()` when needed
- **Axios Interceptor (api/client.ts):** Automatically attaches `Bearer <token>` from `localStorage.token`
- **401 Handling (api/client.ts):** Clears token and redirects to `/login`

---

## 5. API Client

### 5.1 Axios Configuration

```typescript
// api/client.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### 5.2 API Function Groups

| Group | Functions | Description |
|:------|:---------|:------------|
| `authApi` | register, login, me, meProfile | Authentication |
| `devicesApi` | list, get, create, pause, resume, heartbeat | Device management |
| `containersApi` | listByDevice, create, update, delete | Container CRUD |
| `schedulesApi` | listByContainer, create, update, delete, today | Schedule management |
| `dispensingApi` | dispense, confirm, delay | Dose lifecycle |
| `travelApi` | start, end | Travel mode |
| `historyApi` | events | Event history |
| `adherenceApi` | me | Adherence statistics |
| `notificationsApi` | list, markRead | Notifications |
| `integrationsApi` | getWebhooks, createWebhook, deleteWebhook, getDeviceApiKeys, createDeviceApiKey, deleteDeviceApiKey | Integrations |

### 5.3 TypeScript Types (API Contract)

All request/response types are defined in `api/client.ts`:

| Type | Properties |
|:-----|:-----------|
| `AuthResponse` | token, email, fullName, role, userId |
| `DeviceDto` | id, userId, name, type, status, timeZoneId, lastHeartbeatAtUtc |
| `ContainerDto` | id, deviceId, slotNumber, medicationName, quantity, pillsPerDose, lowStockThreshold, medicationImageUrl?, sourceContainerId? |
| `ScheduleDto` | id, containerId, timeOfDay, daysOfWeekBitmask, startDate, endDate, notes |
| `DispenseEventDto` | id, deviceId, containerId, scheduleId, scheduledAtUtc, status, timestamps |
| `NotificationDto` | id, type, title, body, isRead, createdAtUtc |
| `AdherenceSummaryDto` | totalScheduled, confirmed, missed, pending, adherencePercent |
| `TravelSessionDto` | id, mainDeviceId, portableDeviceId, startedAtUtc, endedAtUtc, plannedEndDateUtc |
| `WebhookEndpointDto` | id, url, isActive, description, lastTriggeredAtUtc, lastStatus |
| `DeviceApiKeyDto` | id, name, createdAtUtc, lastUsedAtUtc |

---

## 6. Pages

### 6.1 Dashboard

**Route:** `/` (index)

**Features:**
- Adherence summary (percentage, confirmed/missed/pending counts)
- Today's medication schedule for selected device
- Quick actions (dispense, confirm, view history)
- Device status overview

### 6.2 Devices

**Route:** `/devices`

**Features:**
- List all user's devices with status badges
- Create new device (Main or Portable)
- Pause/Resume device dispensing
- Navigate to device detail / containers

### 6.3 Device Detail

**Route:** `/devices/:deviceId`

**Features:**
- Device information (name, type, status, last heartbeat)
- Hardware status (battery, WiFi signal, temperature, humidity)
- Container overview for this device
- Recent dispense events

### 6.4 Containers

**Route:** `/devices/:deviceId/containers`

**Features:**
- List all medication slots for a device
- Create container (slot number, medication name, quantity, pills per dose)
- Update container (refill quantity, change medication)
- Delete container (only if no schedules reference it)
- Low stock indicator

### 6.5 Schedules

**Route:** `/containers/:containerId/schedules`

**Features:**
- List schedules for a container
- Create schedule (time of day, days of week, date range, notes)
- Edit schedule
- Delete schedule
- Days of week bitmask picker

### 6.6 History

**Route:** `/history`

**Features:**
- Dispense event timeline with status badges
- Filter by date range (from/to)
- Filter by device
- Status colors: Confirmed (green), Missed (red), Pending (yellow), Delayed (orange)

### 6.7 Travel

**Route:** `/travel`

**Features:**
- Start travel session (select portable device, set duration)
- View active travel session
- End travel session
- Container copy status

### 6.8 Notifications

**Route:** `/notifications`

**Features:**
- Notification list with type badges
- Mark as read
- Notification types: Missed Dose, Low Stock, Travel, Device errors
- Unread count indicator

### 6.9 Integrations

**Route:** `/integrations`

**Features:**
- **Outgoing Webhooks:** Create, list, delete webhook endpoints
- **Device API Keys:** Create per device, list, revoke
- API key shown only once on creation (copy prompt)
- Webhook delivery status (last triggered, HTTP status)

### 6.10 Login

**Route:** `/login`

**Features:**
- Email/password form
- Error messages for invalid credentials
- Link to registration
- Auto-redirect if already logged in

### 6.11 Register

**Route:** `/register`

**Features:**
- Email, password, full name, role selection
- Role picker (Patient, Caregiver)
- Validation errors
- Auto-login after successful registration

### 6.12 Settings

**Route:** `/settings`

**Features:**
- Profile management
- System health
- Notification preferences
- Region/language settings

---

## 7. UI Components & Libraries

### 7.1 shadcn/ui Components (Radix UI Primitives)

| Component | File | Usage |
|:----------|:-----|:------|
| AlertDialog | `alert-dialog.tsx` | Confirmation dialogs (delete actions) |
| Badge | `badge.tsx` | Status badges (Active, Paused, Missed, etc.) |
| Button | `button.tsx` | All clickable actions |
| Card | `card.tsx` | Content containers |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Progress | `progress.tsx` | Adherence percentage bar |
| Select | `select.tsx` | Dropdowns (device type, role, etc.) |
| Sonner (Toaster) | `sonner.tsx` | Toast notifications |
| Tabs | `tabs.tsx` | Tab navigation within pages |
| Textarea | `textarea.tsx` | Multi-line text input |

### 7.2 Additional Libraries

| Library | Package | Usage |
|:--------|:--------|:------|
| **Recharts** | `recharts` | Dashboard charts (AreaChart, RadialBarChart, PieChart) |
| **Motion** | `motion` (imported from `motion/react`) | Page transitions, hover animations, layout animations |
| **Lucide React** | `lucide-react` | Icon library (Pill, Box, Bell, Clock, etc.) |
| **React Hook Form** | `react-hook-form` + `@hookform/resolvers` | Form state management |
| **Zod** | `zod` | Schema validation for forms |
| **Class Variance Authority** | `class-variance-authority` | Component variant styling |
| **Tailwind Merge** | `tailwind-merge` + `clsx` | Class name merging utilities |

---

## 8. Styling

### 8.1 Tailwind CSS

Configuration in `tailwind.config.js` extends default theme with project-specific colors and spacing.

### 8.2 Theme CSS

Custom CSS properties in `styles/theme.css` define the color palette:

- Primary colors (indigo/purple: #4F46E5, #6366F1)
- Semantic colors (success, warning, error)
- Surface colors (backgrounds, borders)
- Typography scale

### 8.3 Responsive Design

`styles/responsive.css` handles mobile breakpoints:

| Breakpoint | Width | Target |
|:-----------|:------|:-------|
| `sm` | ≥640px | Mobile landscape |
| `md` | ≥768px | Tablet |
| `lg` | ≥1024px | Desktop |
| `xl` | ≥1280px | Large desktop |

---

## 9. Build & Development

### 9.1 Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

**Key features:**
- **Path alias:** `@/` maps to `src/` for clean imports
- **API proxy:** `/api/*` requests proxied to backend at `localhost:5000`
- **Hot Module Replacement (HMR):** Instant updates during development

### 9.2 Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

### 9.3 Build Output

```bash
npm run build
# → dist/
#   ├── index.html
#   └── assets/
#       ├── index-[hash].js
#       └── index-[hash].css
```

---

## 10. Development Workflow

### 10.1 Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` under the protected `<Route>` group
3. Add navigation link in the header navigation in `src/components/Layout.tsx`
4. If new API calls needed, add functions in `src/api/client.ts`

### 10.2 Adding a New API Call

1. Define TypeScript types in `src/api/client.ts`
2. Add API function to the appropriate group (e.g., `devicesApi`)
3. Use in page component: `const { data } = await devicesApi.list()`

### 10.3 Adding a New UI Component

1. Copy shadcn/ui component to `src/app/components/ui/`
2. Import in page: `import { Button } from '@/app/components/ui/button'`

---

## 11. Internationalization (i18n)

### 11.1 Setup

i18n is configured in `src/i18n.ts` (react-i18next + i18next) but **is not yet wired into the application**: it is not imported in `main.tsx`, and no component uses `useTranslation`. Locale files exist for **English (en), French (fr), and German (de)** only (no Italian). Each language has a single **translation.json** file (no namespace-based files).

| Setting | Value |
|:--------|:------|
| **Library** | react-i18next + i18next |
| **Config file** | src/i18n.ts |
| **Languages** | English (en), French (fr), German (de) |
| **Default** | English (en) |
| **File structure** | Single `translation.json` per language (e.g. `locales/en/translation.json`) |
| **Status** | Configured but not yet wired into the app |

### 11.2 Translation File Structure

```
public/
└── locales/
    ├── en/
    │   └── translation.json
    ├── fr/
    │   └── translation.json
    └── de/
        └── translation.json
```

### 11.3 Usage (when wired)

Once i18n is imported in `main.tsx`, components can use `useTranslation()` and the `t()` function. Until then, all UI strings are hardcoded.

### 11.4 Swiss Number & Date Formatting

```tsx
// Swiss date format: DD.MM.YYYY
const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : locale === 'fr' ? 'fr-CH' : 'en-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(date));

// Swiss number format: 1'000.50
const formatNumber = (num: number, locale: string) =>
  new Intl.NumberFormat(locale.endsWith('-CH') ? locale : `${locale}-CH`).format(num);

// Currency: CHF 44.99
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount);
```

---

## 12. Testing Strategy

**Planned.** Vitest, React Testing Library, MSW, and Playwright are **not** in `package.json`. Current npm scripts are only: `dev`, `build`, `preview`. Testing tooling and test suites are planned for a future release.

---

## 13. Accessibility (a11y)

### 13.1 WCAG 2.1 Level AA Compliance

| Criteria | Implementation | Status |
|:---------|:-------------|:-------|
| **Color contrast** | 4.5:1 minimum ratio (Tailwind theme colors) | ✅ |
| **Keyboard navigation** | All interactive elements focusable | ✅ (via Radix UI) |
| **Screen reader** | Semantic HTML + ARIA labels | ✅ (via shadcn/ui) |
| **Focus indicators** | Visible focus ring on all elements | ✅ |
| **Form labels** | All inputs have associated labels | ✅ |
| **Error messages** | Linked to form fields via aria-describedby | Planned |
| **Skip navigation** | Skip to main content link | Planned |
| **Alt text** | All images have alt text | ✅ |
| **Headings** | Proper heading hierarchy (h1-h6) | ✅ |
| **Responsive text** | Supports 200% zoom without horizontal scroll | ✅ |

### 13.2 Accessibility-Specific Features (Elderly Users)

| Feature | Implementation |
|:--------|:-------------|
| **Large touch targets** | Minimum 44x44px buttons (Tailwind: `min-h-11 min-w-11`) |
| **High contrast mode** | CSS media query `prefers-contrast: high` |
| **Reduced motion** | CSS media query `prefers-reduced-motion: reduce` |
| **Font scaling** | rem-based sizes, respects user preference |
| **Simple navigation** | Maximum 2 levels of navigation depth |
| **Clear status indicators** | Color + icon + text (never color alone) |

### 13.3 Testing Accessibility

```bash
# Automated a11y testing
npx axe-core/cli http://localhost:5173

# In Playwright E2E tests
import { injectAxe, checkA11y } from 'axe-playwright';

test('dashboard is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## 14. Performance Optimization

### 14.1 Bundle Optimization

| Technique | Implementation | Impact |
|:----------|:-------------|:-------|
| **Static imports** | All page components are statically imported (no React.lazy) | Simpler bundle |
| **Tree shaking** | Vite built-in (ES modules) | Remove unused code |
| **Image optimization** | WebP format, lazy loading | Faster page loads |
| **Gzip/Brotli** | Nginx compression | 60-70% size reduction |
| **Vendor chunking** | Vite manual chunks for large deps | Better caching |

**Planned Enhancement:** Route-level code splitting with React.lazy() and Suspense for reduced initial bundle size.

### 14.2 API Request Optimization

| Technique | Implementation |
|:----------|:-------------|
| **Fetch on mount** | useEffect + API calls (no React Query) |
| **Loading/error state** | Local state per page |
| **Debounced search** | 300ms debounce on search inputs where used |

**Planned Enhancement:** React Query (or similar) for request deduplication, background refetch, and optimistic updates.

### 14.3 Performance Targets

| Metric | Target | Tool |
|:-------|:-------|:-----|
| Lighthouse Performance | > 90 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Bundle size (gzipped) | < 200KB | `vite-bundle-analyzer` |

---

## 15. State Management Architecture

### 15.1 State Strategy

| State Type | Library | Scope | Persistence |
|:-----------|:--------|:------|:------------|
| **Auth state** | React Context | Global | localStorage |
| **Server state** | useEffect + API calls (React Query planned) | Component tree | Memory |
| **Form state** | React Hook Form | Per form | Memory |
| **UI state** | React useState | Per component | Memory |
| **Navigation state** | React Router | Global | URL |

### 15.2 AuthContext State Shape

```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'Patient' | 'Caregiver' | 'Admin';
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

### 15.3 Data Fetching (Current)

Pages use **useEffect** plus direct API calls (e.g. `devicesApi.list()`, `schedulesApi.today()`). No React Query hooks (useDevices, useTodaySchedule, etc.) are installed or used. **Planned Enhancement:** React Query for caching, deduplication, and optimistic updates.

### 15.4 Data Fetching Patterns

| Pattern | When to Use | Implementation |
|:--------|:-----------|:-------------|
| **Fetch on mount** | Page-level data | useEffect + API call |
| **Fetch on interaction** | Button clicks | Event handler + loading state |
| **Polling** | Live device status | setInterval |
| **Optimistic update** | Confirm dose, mark read | Instant UI update, rollback on error (manual state) |

---

## 16. Component Architecture

### 16.1 Component Hierarchy

```
App.tsx
├── AuthProvider (context)
├── BrowserRouter
│   ├── Login / Register (public)
│   └── ProtectedRoute
│       └── Layout
│           ├── Header (top bar with horizontal navigation)
│           │   ├── NavLink × 7 (Dashboard, Devices, Schedules, History, Travel, Integrations, Settings)
│           │   ├── Notifications (bell icon in header)
│           │   └── UserMenu (logout)
│           └── Outlet (page content)
│               ├── Dashboard
│               │   ├── AdherenceSummaryCard
│               │   ├── TodayScheduleList
│               │   │   └── DoseCard × N
│               │   ├── DeviceStatusCard
│               │   └── AdherenceChart (Recharts)
│               ├── Devices
│               │   ├── DeviceCard × N
│               │   └── CreateDeviceDialog
│               ├── DeviceDetail
│               │   ├── DeviceInfoCard
│               │   ├── HardwareStatusCard
│               │   └── ContainerSlotList
│               ├── Containers
│               │   ├── ContainerCard × N
│               │   ├── CreateContainerForm
│               │   └── EditContainerDialog
│               ├── Schedules
│               │   ├── ScheduleCard × N
│               │   ├── CreateScheduleForm
│               │   │   ├── TimeOfDayPicker
│               │   │   └── DaysOfWeekSelector
│               │   └── EditScheduleDialog
│               ├── History
│               │   ├── DateRangeFilter
│               │   ├── DeviceSelector
│               │   └── EventTimeline
│               │       └── EventCard × N
│               ├── Travel
│               │   ├── ActiveTravelCard
│               │   └── StartTravelForm
│               ├── Notifications
│               │   ├── NotificationCard × N
│               │   └── UnreadBadge
│               ├── Integrations
│               │   ├── WebhookList
│               │   │   └── WebhookCard × N
│               │   ├── CreateWebhookForm
│               │   ├── ApiKeyList
│               │   │   └── ApiKeyCard × N
│               │   └── CreateApiKeyForm
│               └── Settings
│                   ├── Profile
│                   ├── System health
│                   ├── Notification preferences
│                   └── Region/language
```

### 16.2 Status and Inline UI

Status rendering is done **inline** using a `getStatusBadge()` helper (e.g. for device/dose status). There are no separate shared components for StatusBadge, LoadingSpinner, EmptyState, ErrorAlert, ConfirmDialog, DateRangePicker, or DeviceSelector; dialogs and filters use shadcn/ui primitives (e.g. AlertDialog, Select) and inline markup where needed.

### 16.3 Search & Filtering Capabilities

| Page | Search | Filters | Sort |
|:-----|:-------|:--------|:-----|
| Devices | By name | Type (Main/Portable), Status (Active/Paused), Online/Offline | Name, Last heartbeat |
| History | — | Date range, Device, Status (Confirmed/Missed/Pending) | Date (desc) |
| Notifications | — | Type, Read/Unread | Date (desc) |
| Containers | By medication name | Device, Low stock | Slot number |
