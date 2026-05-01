## TracPour Dashboard MVP

Managed Expo / React Native mobile MVP for tracking one active concrete pour at a time. The app currently runs on typed mock data, with `src/lib/api.ts` kept as the frontend boundary that can later switch to backend API calls.

## Run

```bash
npm install
npx expo start
```

## App Flow

- If no active pour exists, `src/app/index.tsx` routes to `src/app/create-job.tsx`.
- Starting a pour creates the active job in the mock API, seeds representative load, activity, and ticket records, and routes to `/live`.
- Active pour tabs:
  - `src/app/live.tsx`: yardage progress dashboard
  - `src/app/tickets.tsx`: simple ticket download link list
  - `src/app/history.tsx`: engine start/stop activity timeline

## Data Layer

- `src/hooks/use-dashboard-data.ts`: screen-facing hook for active pour, loads, activity, tickets, and derived dashboard metrics
- `src/lib/api.ts`: central API interface and future backend integration point
- `src/lib/mock-data.ts`: current AsyncStorage-backed mock pour/load/activity/ticket state
- `src/lib/types.ts`: domain types
- `src/lib/dashboard.ts`: derived dashboard summary calculations

Mock state is persisted locally only to keep the MVP usable across refreshes before the backend exists. The future backend/database should become the source of truth for active pours and related records.

## Backend Integration Later

Do not put raw event handling in the mobile app. The backend service receives HTTP event ingestion from the Raspberry Pi or a local bridge service, processes events into app-friendly pour, load, and activity records, then exposes those records through API endpoints consumed from `src/lib/api.ts`. Trucking ticket records can arrive through a separate backend/API ingestion path and do not need to be linked to loads until there is a reliable matching rule.

Likely API-facing methods already represented in the frontend:

- `getActivePour()`
- `startPour()`
- `getLoadsForActivePour()`
- `getPourActivity()`
- `getTicketsForActivePour()`
- `getDashboardSummary()`

## Backend

The backend lives in `backend/` as a separate Node/Fastify service with Supabase Postgres persistence.

Local setup:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Before running it, create a Supabase project and run `backend/supabase/schema.sql` in the Supabase SQL editor. Vercel can continue deploying the Expo frontend from the repo root. Railway can deploy the backend from the `backend/` root directory.
