# Smart Medication Dispenser – Mobile (Patient App)

**MVP scope:** [../software-docs/MVP_APPLICATION.md](../software-docs/MVP_APPLICATION.md)

**MVP badge:** Set `EXPO_PUBLIC_MVP_MODE=true` in `.env` (see `.env.example`) to show an MVP label on tab screen headers.

React Native (Expo) + TypeScript patient app. Expo Router for navigation, Axios for API, AsyncStorage for auth token.

## Run

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to your API (e.g. `http://localhost:5000`). For a physical device use your machine’s LAN IP (e.g. `http://192.168.1.10:5000`).
2. Install and start:

```bash
npm install
npx expo start
```

3. Scan the QR code with Expo Go (Android) or Camera (iOS), or press `a` for Android emulator / `i` for iOS simulator.

Use demo credentials (see root README) to sign in.

## Screens

- **Login / Register** – Auth
- **Home** – Today’s schedule, device selector, tap dose to open dose screen
- **Dose** – Dispense + Confirm intake
- **Devices** – List, pause/resume
- **History** – Last 7 days of events
- **Notifications** – List, mark read

## Behavior

- Fetches today’s schedule on app open and when refreshing Home.
- Notification opens dose screen: configure Expo Notifications and deep link when needed.
- Travel mode is respected: use the device selector on Home when the patient has multiple devices (e.g. portable during travel).
