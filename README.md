## TracPour Dashboard MVP

Expo / React Native app for tracking one active concrete pour at a time. The frontend calls the Fastify backend in `backend/`, which persists pours, loads, engine activity, trucking tickets, and raw events in Supabase Postgres. Command Alkon-style supplier order data remains mocked, including when connected to the backend.

## Run locally

Set up the backend first:

1. Create or use an existing Supabase project and apply `backend/supabase/schema.sql`.
2. Copy `backend/.env.example` to `backend/.env` and populate `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Start the backend in its own terminal:

```bash
cd backend
npm install
npm run dev
```

Keep the Supabase service-role key in the backend only. See [backend/README.md](backend/README.md) for the API and ingestion payloads.

Create `.env.local` at the repository root:

```bash
EXPO_PUBLIC_USE_BACKEND=true
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

Then start the frontend from the repository root:

```bash
npm install
npx expo start
```

When testing on a physical device, use the computer's LAN IP instead of `localhost`. Restart Expo after changing environment variables.

## App flow

- Startup checks the backend for an active pour and opens either setup or the live dashboard.
- Setup accepts a job name, positive expected yardage, a supplier selection, and an optional supplier order number. The supplier choices are placeholders for the retained supplier mocks.
- Starting a pour saves the entered details in Supabase. Real pours start without seeded loads or activity. An existing active pour must be completed before another can start.
- The live, tickets, and history tabs refresh every 10 seconds. Failed requests show an error and retry control; a failed refresh keeps the last successfully loaded data visible.
- The Pi or bridge posts truck and engine events to `POST /api/events`. A separate ticket processor posts ticket data to `POST /api/tickets`.
- Tickets can be opened individually or exported to Excel while the pour is active.
- End Pour asks for confirmation, completes the pour through the API, and returns to setup only after completion succeeds.

## Data layer

- `src/lib/api.ts`: frontend API boundary for pour creation/completion, loads, activity, tickets, supplier orders, and summary data. Backend requests time out after 15 seconds and do not fall back to mock data on failure.
- `src/hooks/use-dashboard-data.ts`: polling, request-error handling, and derived dashboard metrics.
- `src/lib/dashboard.ts`: yardage and truck-count calculations.
- `src/lib/types.ts`: frontend domain types.
- `backend/src/routes.ts`: app API, event ingestion, ticket ingestion, and Excel export.
- `backend/src/services/`: database operations and event processing.
- `backend/supabase/schema.sql`: database tables and schema updates.
- `src/lib/mock-data.ts`: separate AsyncStorage-backed fixtures for local mock-only testing.

To intentionally use local mock-only mode, set `EXPO_PUBLIC_USE_BACKEND=false`. Alternatively, remove both frontend environment variables. Leaving `EXPO_PUBLIC_USE_BACKEND=true` without an API URL produces a configuration error. Mock-only mode seeds example loads, activity, and tickets and keeps them in local storage; it does not write to Supabase or support Excel export. Deployed web hosts reject mock-only mode.

## Supplier data and current limitations

Supplier order figures remain intentionally mocked. The existing Command Alkon-style and CEMEX Go-style placeholders return fixed quantities, mix design, truck counts, and ETA when a supplier plant and order number are supplied. Their mock labels do not represent live supplier connections. The mock `lastSyncedAt` value is generated when requested.

Truck-based yardage uses a default of 9.5 CY per completed load. Ticket quantities are stored separately and do not update load totals. Event processing uses server receipt time rather than the supplied event timestamp. History shows the active pour's engine events; completed-pour browsing is not implemented. The backend currently has no application authentication.

## Deployment

Deploy the Expo frontend from the repository root and the backend from `backend/`. For example, Vercel can host the static frontend and Railway can run the backend.

Set the frontend build environment to:

```bash
EXPO_PUBLIC_USE_BACKEND=true
EXPO_PUBLIC_API_BASE_URL=https://your-backend-host
```

Rebuild/redeploy the frontend after changing these values. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the platform's `PORT` in the backend environment, and apply the database schema. Point the Pi/bridge and ticket processor at the deployed backend's ingestion endpoints. `GET /health` checks that the HTTP service is running; it does not verify database connectivity.

## Verification

```bash
npx tsc --noEmit
npm run lint
cd backend
npm run build
```

For a full-stack smoke check against a test database, create a pour with custom details, ingest truck and engine events and a ticket, verify the dashboard/history/tickets and Excel export, then end the pour and create a second pour. Also stop the backend temporarily to check visible errors and recovery using Retry.
