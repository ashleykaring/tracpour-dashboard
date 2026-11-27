## TracPour Backend

The Fastify service described below is the legacy Railway MVP. The new app uses the authenticated `supabase/functions/dashboard` Edge Function and the user-owned schema instead. The function and `phase3_dashboard.sql` must be deployed to the new Supabase project before the dashboard will work; see the root README for setup. Pi ingestion and external ticket processor authentication are not migrated yet.

## User-owned Supabase schema (phase 1)

`supabase/user_owned_schema.sql` is a separate clean-install foundation for the planned Supabase-only backend. It is not compatible with the current Fastify API: the API still uses a service-role client, has no user authentication, and does not supply ownership or device fields. Do not apply the new schema to the current application's database. The setup below still describes the existing MVP and its original `supabase/schema.sql`.

For an isolated test, create a new empty Supabase project or local Supabase database and run `user_owned_schema.sql` once as an administrative role. It deliberately fails rather than silently changing an existing schema. The schema requires PostgreSQL 15 or newer. Do not expose the `private` schema through the Supabase Data API. The planned Edge Functions will need a narrowly scoped trusted database operation to access credential hashes; those functions and device provisioning are not implemented yet.

Run `supabase/tests/user_owned_schema.sql` against that disposable database as an administrative role, with errors stopping execution. For example, with the PostgreSQL client installed:

```bash
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/user_owned_schema.sql
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/user_owned_schema.sql
```

Run these commands from `backend/`. The test transaction creates two temporary auth users and rolls back its fixtures. The SQL files can also be run in order in the test project's SQL editor. Never run the test in a production project. The earlier `design/organizations_and_devices.draft.sql` describes an abandoned organization-based approach and is not part of this schema.

Authenticated users can access their own application rows under RLS. Devices and raw events are client-readable only; trusted server operations will handle provisioning, revocation, and ingestion in later phases. The private credential table stores only a 32-byte key digest and is inaccessible to anonymous and authenticated clients. Existing data is not migrated.

## Local Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

5. Install and run:

```bash
cd backend
npm install
npm run dev
```

The local API runs on `http://localhost:4000` by default.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend. It belongs only in this backend service.

## App API

- `GET /health`
- `GET /api/pours/active`
- `POST /api/pours/start`
- `POST /api/pours/active/complete`
- `GET /api/pours/active/loads`
- `GET /api/pours/active/activity`
- `GET /api/pours/active/tickets`
- `GET /api/pours/active/tickets.xlsx`
- `GET /api/pours/active/supplier-order`
- `GET /api/pours/active/summary`
- `POST /api/tickets`

## Event Ingestion

The Raspberry Pi or local bridge service posts events over HTTP:

```http
POST /api/events
```

Body:

```json
{
  "type": "truck_leave",
  "timestamp": "2026-05-01T18:30:00.000Z"
}
```

Allowed event types:

- `truck_enter`
- `truck_leave`
- `engine_start`
- `engine_stop`

Behavior:

- Every accepted event is saved in `raw_events`.
- If there is no active pour, the raw event is stored unassigned.
- `engine_start` and `engine_stop` create activity records for the active pour.
- `truck_enter` creates one in-progress load for the active pour if no load is already in progress.
- `truck_leave` completes the in-progress load, or creates a completed load directly if no matching enter event exists.
- Completed loads count as `9.5 CY`.

## Ticket Ingestion

External ticket processing can post ticket links to the backend:

```http
POST /api/tickets
```

Body:

```json
{
  "jobId": "optional-pour-id",
  "ticketNumber": "TP-1042",
  "downloadUrl": "https://example.com/tickets/tp-1042.pdf",
  "truckLabel": "Truck 14",
  "yardage": 9.5,
  "deliveredAt": "2026-05-01T18:30:00.000Z"
}
```

QR ticket payloads can also use:

```json
{
  "quant": 9.5,
  "truck": "14",
  "downloadUrl": "https://example.com/tickets/tp-1042.pdf"
}
```

Behavior:

- If `jobId` is omitted, the ticket is attached to the active pour.
- If `jobId` is provided, the ticket can be attached to that pour even after the pour is completed.
- If no pour is active and `jobId` is omitted, the ticket is saved as unassigned.
- When a new pour starts, unassigned tickets created in the last 24 hours attach to that pour.
- `ticketNumber` or `downloadUrl` is required.
- `quant` is normalized to `yardage`; `truck` is normalized to `truckLabel`.
- Tickets are stored separately from loads because truck events currently do not include a truck ID.
- Re-posting the same `ticketNumber` or `downloadUrl` for the same pour updates the existing ticket record.
- `GET /api/pours/active/tickets.xlsx` downloads the current active pour's stored tickets as an Excel workbook.

## Railway

Use `backend` as the Railway root directory.

Recommended commands:

- Build: `npm install && npm run build`
- Start: `npm run start`

Set these Railway environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`
