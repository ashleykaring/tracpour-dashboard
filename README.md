## TracPour Dashboard MVP

Simple Expo Router mobile dashboard for one active concrete job at a time. The app currently runs entirely on typed mock data and is structured so the data layer can be replaced later without rewriting screen components.

## Run

```bash
npm install
npx expo start
```

## Structure

- `src/app/live.tsx`: live yardage dashboard
- `src/app/tickets.tsx`: completed and incomplete ticket lists
- `src/app/history.tsx`: chronological completed load timeline
- `src/lib/types.ts`: domain types
- `src/lib/api.ts`: data access abstraction used by screens
- `src/lib/mock-data.ts`: current local mock job and load records
- `src/lib/supabase.ts`: placeholder backend client entry point

## Swapping Mock Data For A Backend

Keep screen components unchanged and replace the implementation inside `src/lib/api.ts`.

Current functions to preserve:

- `getActiveJob()`
- `getLoadsForActiveJob()`

Later, wire your backend client in `src/lib/supabase.ts` and move `mockJob` / `mockLoads` queries to real fetches. That keeps routing, presentation components, and derived dashboard metrics isolated from the storage layer.
