## TracPour Backend

HTTP API for the TracPour MVP. This service owns event ingestion, event processing, and app-friendly API responses. Supabase Postgres stores pours, loads, activity events, trucking tickets, and raw incoming events.

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

## Railway

Use `backend` as the Railway root directory.

Recommended commands:

- Build: `npm install && npm run build`
- Start: `npm run start`

Set these Railway environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`
