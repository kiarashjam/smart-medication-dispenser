# Documentation vs. Codebase Implementation Checklist

This document compares the following documentation files to the actual codebase at `smart-medication-dispenser/`:

- **05_WEB_PORTAL.md** (software-docs)
- **06_MOBILE_APP.md** (software-docs)
- **07_SECURITY.md** / **08_TESTING.md**: These exact paths do not exist in `software-docs/`. The checklist uses **technical-docs/04_SECURITY.md** for security and **software-docs/15_TESTING_STRATEGY.md** for testing.

---

## 1. 05_WEB_PORTAL.md

### 1.1 Pages (web/src/pages/)

| Doc Page        | File Expected     | Status            | Notes                                      |
|----------------|-------------------|-------------------|--------------------------------------------|
| Dashboard      | Dashboard.tsx     | IMPLEMENTED       | Present                                    |
| Devices        | Devices.tsx       | IMPLEMENTED       | Present                                    |
| DeviceDetail   | DeviceDetail.tsx  | IMPLEMENTED       | Present                                    |
| Containers     | Containers.tsx    | IMPLEMENTED       | Present                                    |
| Schedules      | Schedules.tsx     | IMPLEMENTED       | Present                                    |
| History        | History.tsx       | IMPLEMENTED       | Present                                    |
| Travel         | Travel.tsx        | IMPLEMENTED       | Present                                    |
| Notifications  | Notifications.tsx | IMPLEMENTED       | Present                                    |
| Integrations   | Integrations.tsx  | IMPLEMENTED       | Present                                    |
| Login          | Login.tsx         | IMPLEMENTED       | Present                                    |
| Register       | Register.tsx      | IMPLEMENTED       | Present                                    |
| Settings       | —                 | IMPLEMENTED (extra)| Doc lists 11 pages; Settings exists in code, not in doc |

### 1.2 Components (web/src/components/ & app/components/)

| Doc Component / Location | Status            | Notes                                      |
|--------------------------|-------------------|--------------------------------------------|
| Layout.tsx               | IMPLEMENTED       | In `src/components/`                       |
| ProtectedRoute.tsx       | IMPLEMENTED       | In `src/components/`                       |
| app/components/figma/ImageWithFallback.tsx | IMPLEMENTED | Present                                    |
| app/components/ui/ (shadcn) | IMPLEMENTED    | alert-dialog, badge, button, card, input, label, progress, select, sonner, tabs, textarea, utils — all present |

### 1.3 Routing (App.tsx)

| Doc Route | Status        | Notes                                                                 |
|-----------|---------------|-----------------------------------------------------------------------|
| / → Dashboard | IMPLEMENTED | Index route under ProtectedRoute + Layout                             |
| /login    | IMPLEMENTED   | Public                                                                |
| /register | IMPLEMENTED   | Public                                                                |
| /devices  | IMPLEMENTED   | Protected                                                             |
| /devices/:deviceId | IMPLEMENTED | Protected                                                        |
| /devices/:deviceId/containers | IMPLEMENTED | Protected                          |
| /containers/:containerId/schedules | IMPLEMENTED | Protected                      |
| /history  | IMPLEMENTED   | Protected                                                             |
| /travel   | IMPLEMENTED   | Protected                                                             |
| /notifications | IMPLEMENTED | Protected                                                          |
| /integrations | IMPLEMENTED | Protected                                                           |
| Catch-all → / | IMPLEMENTED | `path="*"` → `<Navigate to="/" />`                             |
| /settings | IMPLEMENTED (extra) | Present; not in doc route map                    |

### 1.4 API Client (web/src/api/client.ts)

| Doc API Group / Functions | Status        | Notes                                                                 |
|---------------------------|---------------|-----------------------------------------------------------------------|
| authApi: register, login, me, meProfile | IMPLEMENTED | All present                                                      |
| devicesApi: list, get, create, pause, resume, heartbeat | IMPLEMENTED | All present (create uses POST /api/devices)                    |
| containersApi: listByDevice, create, update, delete | IMPLEMENTED | All present                                                    |
| schedulesApi: listByContainer, create, update, delete, today | IMPLEMENTED | today uses /api/devices/{id}/today-schedule                    |
| dispensingApi: dispense, confirm, delay | IMPLEMENTED | All present                                                      |
| travelApi: start, end     | IMPLEMENTED   | Present                                                              |
| historyApi: events       | IMPLEMENTED   | Present                                                              |
| adherenceApi: me         | IMPLEMENTED   | Present                                                              |
| notificationsApi: list, markRead | IMPLEMENTED | markRead is POST (doc 08 says PUT; backend may differ)          |
| integrationsApi: getWebhooks, createWebhook, deleteWebhook, getDeviceApiKeys, createDeviceApiKey, deleteDeviceApiKey | IMPLEMENTED | All present |

### 1.5 Axios / Auth Behavior

| Doc Feature | Status        | Notes                                                                 |
|-------------|---------------|-----------------------------------------------------------------------|
| Request interceptor: Bearer token from storage | IMPLEMENTED | Uses `localStorage.getItem('token')`                             |
| Response interceptor: 401 → clear token, redirect /login | IMPLEMENTED | Present in client.ts                                            |
| AuthContext uses real API | IMPLEMENTED | Uses authApi.login/register/me; doc mentioned mock optional, code uses real API |

### 1.6 Project Structure / Lib

| Doc Item | Status          | Notes                                                                 |
|----------|-----------------|-----------------------------------------------------------------------|
| lib/deviceTypes.ts | IMPLEMENTED | Present                                                              |
| lib/mockData.ts    | NOT IMPLEMENTED | Doc lists it; not in codebase (mock auth removed in favor of real API) |
| utils/apiError.ts  | IMPLEMENTED | Present (extraction of API error messages)                           |
| styles/theme.css, responsive.css | IMPLEMENTED | Present                                              |

### 1.7 Additional Doc Features (05)

| Feature | Status            | Notes                                                                 |
|---------|-------------------|-----------------------------------------------------------------------|
| React.lazy for routes | NOT IMPLEMENTED | App.tsx uses direct imports; no Suspense + lazy for pages        |
| react-i18next / locales | NOT IMPLEMENTED | No i18n in package.json; no public/locales; doc describes full i18n setup |
| Vitest / RTL / MSW / Playwright | NOT IMPLEMENTED | No test deps in web/package.json; no src/__tests__, no e2e/ in web  |
| Recharts, Motion, Lucide, React Hook Form, Zod, Sonner | IMPLEMENTED | Present in package.json or used in code (Recharts, motion, etc.)  |

---

## 2. 06_MOBILE_APP.md

### 2.1 Screens (mobile/app/)

| Doc Screen / Route | File / Location | Status        | Notes                                      |
|--------------------|-----------------|---------------|--------------------------------------------|
| Home               | (tabs)/home.tsx | IMPLEMENTED   | Present                                    |
| Devices            | (tabs)/devices.tsx | IMPLEMENTED | Present                                 |
| History            | (tabs)/history.tsx | IMPLEMENTED | Present                                 |
| Notifications      | (tabs)/notifications.tsx | IMPLEMENTED | Present (tab label "Alerts")          |
| Dose detail        | dose/[id].tsx   | IMPLEMENTED   | Present; nav uses scheduleId as id in params |
| Login              | login.tsx       | IMPLEMENTED   | Present                                    |
| Register           | register.tsx    | IMPLEMENTED   | Present                                    |
| Profile            | (tabs)/profile.tsx | IMPLEMENTED (extra) | Doc lists 4 tabs; code has 5th tab Profile |
| Containers per device | containers/[deviceId].tsx | IMPLEMENTED | Present              |
| Schedules per container | schedules/[containerId].tsx | IMPLEMENTED | Present            |

### 2.2 Tab Bar (mobile/app/(tabs)/_layout.tsx)

| Doc Tab | Status        | Notes                                      |
|---------|---------------|--------------------------------------------|
| Home    | IMPLEMENTED   | Present                                    |
| Devices | IMPLEMENTED   | Present                                    |
| History | IMPLEMENTED   | Present                                    |
| Notifications | IMPLEMENTED | Present (labeled "Alerts"); unread badge implemented |

### 2.3 API Client (mobile/src/api/client.ts)

| Doc API Group / Methods | Status        | Notes                                                                 |
|-------------------------|---------------|-----------------------------------------------------------------------|
| authApi: register, login, me, meProfile | IMPLEMENTED | Present                                                          |
| devicesApi: list, get, pause, resume | IMPLEMENTED | get present; doc does not require create for mobile              |
| schedulesApi: today    | IMPLEMENTED   | Present; also listByContainer, create, update, delete in code        |
| dispensingApi: dispense, confirm, delay | IMPLEMENTED | Present                                                        |
| historyApi: events      | IMPLEMENTED   | Present                                                              |
| notificationsApi: list, markRead | IMPLEMENTED | Present                                                        |
| setAuthToken / authToken, interceptors | IMPLEMENTED | Bearer on request; 401 clears token                          |
| getApiErrorMessage      | IMPLEMENTED   | Present                                                              |
| DeviceDto extended (isOnline, batteryLevel, wifiSignal, etc.) | IMPLEMENTED | Present in client types        |

### 2.4 Authentication (mobile)

| Doc Feature | Status        | Notes                                                                 |
|-------------|---------------|-----------------------------------------------------------------------|
| AuthContext: token, user, login, register, logout, loading | IMPLEMENTED | Present in context/AuthContext.tsx                               |
| AsyncStorage key "token" | IMPLEMENTED | TOKEN_KEY = 'token'                                             |
| On launch: restore token → setAuthToken → GET /me | IMPLEMENTED | In AuthProvider useEffect                                      |
| On login/register: store token in AsyncStorage + setAuthToken | IMPLEMENTED | Present                        |

### 2.5 Notifications (mobile)

| Doc Feature | Status        | Notes                                                                 |
|-------------|---------------|-----------------------------------------------------------------------|
| Expo Notifications: setNotificationHandler (alert, sound, badge) | IMPLEMENTED | In scheduleNotifications.ts   |
| Android channel dose-reminders (HIGH) | IMPLEMENTED | CHANNEL_ID = 'dose-reminders'                          |
| scheduleDoseNotifications(todayItems, deviceId) | IMPLEMENTED | Cancels previous, requests permission, schedules future doses |
| Notification tap → navigate to dose screen | IMPLEMENTED | addNotificationResponseListener in _layout.tsx, pushes /dose/[id] with params |
| deviceEvents.ts (device event type utilities) | IMPLEMENTED | Present in src/api/deviceEvents.ts |

### 2.6 Project Structure

| Doc Item | Status          | Notes                                                                 |
|----------|-----------------|-----------------------------------------------------------------------|
| app/_layout.tsx (root, AuthProvider) | IMPLEMENTED | Present                                                          |
| app/index.tsx (redirect) | IMPLEMENTED | Present                                                          |
| src/context/AuthContext.tsx | IMPLEMENTED | Present                                                          |
| src/notifications/scheduleNotifications.ts | IMPLEMENTED | Present                                                    |

### 2.7 Planned / Not Required by Doc

| Feature | Status            | Notes (doc states planned/MVP limitation)                            |
|---------|-------------------|----------------------------------------------------------------------|
| FCM/APNs push      | NOT IMPLEMENTED   | Doc: planned                                                         |
| Offline support    | NOT IMPLEMENTED   | Doc: planned                                                         |
| i18n (FR/DE/IT/EN) | NOT IMPLEMENTED   | Doc: planned                                                         |
| Biometric auth     | NOT IMPLEMENTED   | Doc: planned                                                         |
| SecureStore for token | NOT IMPLEMENTED | Doc: known limitation, AsyncStorage used                            |

---

## 3. Security (technical-docs/04_SECURITY.md)

Verification in backend (`backend/src/Api` and Application/Infrastructure).

### 3.1 Backend Security

| Doc Requirement | Status        | Notes                                                                 |
|-----------------|---------------|-----------------------------------------------------------------------|
| JWT authentication (HS256, issuer, audience, lifetime) | IMPLEMENTED | Program.cs: AddAuthentication(JwtBearer), TokenValidationParameters |
| JWT middleware (UseAuthentication) | IMPLEMENTED | app.UseAuthentication(); UseAuthorization()                        |
| CORS            | IMPLEMENTED   | app.UseCors(policy => AllowAnyOrigin/Method/Header) — doc says tighten in prod |
| Rate limiting   | IMPLEMENTED   | AddRateLimiter: global (user/IP), "auth" policy (10/15min), "device" policy     |
| Input validation (FluentValidation) | IMPLEMENTED | Application: ValidationBehavior + validators; GlobalExceptionMiddleware handles ValidationException |
| Global exception handling | IMPLEMENTED | GlobalExceptionMiddleware returns consistent JSON                     |

### 3.2 Web Auth vs. Security Doc

| Doc Flow | Status        | Notes                                                                 |
|----------|---------------|-----------------------------------------------------------------------|
| Token in localStorage, Bearer on requests | IMPLEMENTED | Web client + AuthContext use 'token' key and real API             |
| 401 → clear token, redirect to /login | IMPLEMENTED | api/client.ts response interceptor                               |

### 3.3 Mobile Auth vs. Security Doc

| Doc Flow | Status        | Notes                                                                 |
|----------|---------------|-----------------------------------------------------------------------|
| Token in AsyncStorage; Bearer on requests | IMPLEMENTED | AuthContext + setAuthToken + client interceptors                   |
| 401 → clear token (no redirect to login in client; router handles) | IMPLEMENTED | Client clears authToken; app flow leads to login when unauthenticated |

### 3.4 Not Verified in Code (device/infra)

| Item | Status            | Notes (per doc, often device or infra)                               |
|------|-------------------|----------------------------------------------------------------------|
| TLS 1.3 only       | NOT VERIFIED      | Server/load balancer configuration                                   |
| Certificate pinning | NOT VERIFIED    | Firmware / device side                                               |
| X-API-Key for webhooks/integrations | Backend may implement; not fully traced in this checklist      |
| MFA, RBAC details  | NOT VERIFIED      | Doc describes; would require controller/authorization checks        |

---

## 4. Testing (software-docs/15_TESTING_STRATEGY.md)

### 4.1 Backend Tests (structure and existence)

| Doc Structure / Area | Status            | Notes                                                                 |
|----------------------|-------------------|-----------------------------------------------------------------------|
| tests/Application.Tests/ (Application/, Domain/, Infrastructure/) | PARTIAL | Application.Tests exists; structure is flatter (no full Application/Devices, Containers, etc. subfolders as in doc) |
| tests/Domain.Tests/  | IMPLEMENTED       | Domain.Tests exists                                                    |
| Unit tests (xUnit, Moq) | IMPLEMENTED    | ConfirmDispenseCommandHandlerTests, MissedDoseLogicTests, TravelModeLogicTests, DeviceApi*, DomainTests |
| Integration tests (WebApplicationFactory, in-memory DB) | NOT IMPLEMENTED | No IntegrationTests project or WebApplicationFactory found in backend/tests |
| AuthControllerTests, DevicesControllerTests, etc. (API-* integration) | NOT IMPLEMENTED | No controller-level integration test files found                      |
| Test IDs (APP-001–APP-035, DOM-*, API-*–API-066) | NOT IMPLEMENTED | Doc defines catalog; tests do not use these IDs in names              |

### 4.2 Web Portal Tests

| Doc Item | Status            | Notes                                                                 |
|----------|-------------------|-----------------------------------------------------------------------|
| Vitest, React Testing Library, MSW, Playwright | NOT IMPLEMENTED | Not in web/package.json; no test scripts                             |
| src/__tests__/pages/ (e.g. Dashboard, Devices, Login) | NOT IMPLEMENTED | No __tests__ under web/src                                           |
| src/__tests__/components/ (e.g. ProtectedRoute) | NOT IMPLEMENTED | No such folder                                                        |
| src/__tests__/api/client.test.ts | NOT IMPLEMENTED | No such file                                                          |
| __mocks__/handlers.ts (MSW) | NOT IMPLEMENTED | No __mocks__ under web/src                                            |
| e2e/ (Playwright: login, dashboard, devices specs) | NOT IMPLEMENTED | No e2e/ directory in web                                              |
| vitest.config.ts     | NOT IMPLEMENTED | Not present                                                            |

### 4.3 Mobile Tests

| Doc Item | Status            | Notes                                                                 |
|----------|-------------------|-----------------------------------------------------------------------|
| Jest + coverage, Detox E2E | NOT IMPLEMENTED | No mobile test structure or Detox config found in app/repo (only node_modules references) |
| Test IDs MOB-001–MOB-024 | NOT IMPLEMENTED | No such tests in codebase                                             |
| e2e/login.e2e.js (Detox) | NOT IMPLEMENTED | No e2e/ in mobile                                                     |

### 4.4 E2E / Playwright / CI

| Doc Item | Status            | Notes                                                                 |
|----------|-------------------|-----------------------------------------------------------------------|
| Playwright config (playwright.config.ts) | NOT IMPLEMENTED | Not in web                             |
| E2E test IDs E2E-001–E2E-009 | NOT IMPLEMENTED | No E2E tests in repo                                                   |
| CI/CD test gates (backend, frontend, integration, e2e, security, a11y) | NOT VERIFIED | No GitHub Actions workflow files inspected; doc describes desired pipeline |

### 4.5 Coverage / Tooling

| Doc Item | Status            | Notes                                                                 |
|----------|-------------------|-----------------------------------------------------------------------|
| Backend: Coverlet, coverage targets | NOT VERIFIED | Not confirmed in this check                                           |
| Web: @vitest/coverage | NOT IMPLEMENTED | No Vitest in web                                                   |
| Codecov integration | NOT VERIFIED | Not confirmed in repo                                                 |

---

## Summary Table

| Document | Implemented | Not Implemented / Partial |
|----------|-------------|---------------------------|
| **05_WEB_PORTAL** | All 11 doc pages + Settings; Layout, ProtectedRoute, UI components, figma/ImageWithFallback; full routing; full API client; Axios interceptors; AuthContext with real API; theme/responsive styles; utils; Recharts/Motion/Lucide/RHF/Zod/Sonner. | lib/mockData.ts; React.lazy routes; i18n and public/locales; entire test stack (Vitest, RTL, MSW, Playwright) and test file structure. |
| **06_MOBILE_APP** | All doc screens + Profile, containers, schedules; 4 doc tabs + unread badge; API client (all groups + getApiErrorMessage, extended DeviceDto); AuthContext + AsyncStorage + setAuthToken; Expo notifications (handler, channel, scheduling, tap → dose screen). | FCM/APNs, offline, i18n, biometric, SecureStore (all documented as planned/limitations). |
| **Security (04)** | JWT auth and middleware, CORS, rate limiting, FluentValidation, global exception middleware; web and mobile auth flows (token storage, 401 handling). | TLS/cert pinning, X-API-Key/MFA/RBAC not fully verified; device/infra security not checked. |
| **Testing (15)** | Backend unit tests (Application + Domain) and some structure. | No backend integration/controller tests; no web tests (Vitest/RTL/MSW/Playwright) or e2e/; no mobile Jest/Detox or e2e; no test ID usage; CI/coverage not verified. |

---

**Note on 07_SECURITY.md and 08_TESTING.md:**  
The paths `software-docs/07_SECURITY.md` and `software-docs/08_TESTING.md` do not exist. The security section above is based on **technical-docs/04_SECURITY.md**. The testing section is based on **software-docs/15_TESTING_STRATEGY.md**.
