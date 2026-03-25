# Smart Medication Dispenser – Web (Caregiver Portal)

**MVP scope:** [../software-docs/MVP_APPLICATION.md](../software-docs/MVP_APPLICATION.md)

React + TypeScript (Vite) web app for caregivers/admins. Uses Tailwind CSS, React Router, Axios, React Hook Form + Zod.

## Run

1. Copy `.env.example` to `.env` and set `VITE_API_URL` if the API is not on the same host (e.g. `http://localhost:5000`). Use `VITE_MVP_MODE=false` to hide the MVP badge in the header.
2. With dev server proxy (default), the API is expected at `http://localhost:5000`. Start the backend first.
3. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173. Use demo credentials (see root README) to sign in.

## Build

```bash
npm run build
npm run preview
```

## Pages

- **Login / Register** – Auth
- **Dashboard** – Next dose, adherence summary, low stock
- **Devices** – List, pause/resume, link to containers
- **Device detail** – Today schedule
- **Containers** – List by device, delete
- **Schedules** – List by container, delete
- **History** – Events table by device
- **Travel** – Start/end travel mode
- **Notifications** – List, mark read
