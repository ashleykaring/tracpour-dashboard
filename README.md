## TracPour Dashboard

Expo / React Native app for tracking concrete pours. The current transition uses Supabase Auth, a user-owned PostgreSQL schema with RLS, and an authenticated Supabase Edge Function for dashboard operations. Each user can have one active pour. Supplier order information is still mocked.

## Set up the Supabase project

Use a new, empty Supabase project. Enable the Data API and RLS for new tables; leave automatic API grants for new tables off. In the SQL Editor, run these files in order:

1. `backend/supabase/user_owned_schema.sql`
2. `backend/supabase/phase3_dashboard.sql`

The schema is a clean installation, not a migration for the old database. If the first file has already been run, run only the second. Test the SQL in a disposable project using `backend/supabase/tests/user_owned_schema.sql` and `backend/supabase/tests/phase3_dashboard.sql`. Both test scripts roll back their fixtures.

Deploy the `dashboard` function from the repository root using the Supabase CLI. Replace `YOUR_PROJECT_REF` with the project reference from the Supabase dashboard:

```bash
npx supabase login
npx supabase functions deploy dashboard --project-ref YOUR_PROJECT_REF --workdir backend --use-api
```

Use `--use-api` to deploy without local Docker. Leave JWT verification enabled. The Edge Function uses the caller's verified session and a user-scoped database client. It does not use a service-role key. It includes authenticated ticket creation, but the old unauthenticated external ticket endpoint is not supported; a separate integration authentication method is still needed for external processors.

In Supabase Authentication URL Configuration, set the Site URL to the app's web origin and add the web origin and `reset-password` URL to the redirect allow list (for local web, usually `http://localhost:8081` and `http://localhost:8081/reset-password`). Add `tracpourdash://**` for native development/production builds. Expo Go may use a different `exp://` URL; allow the actual development URL when testing it. Add the deployed web URL before production. Email confirmation and password recovery require allowed redirects that match the running app. Production email delivery may require an SMTP provider in Supabase.

## Run the app

Copy the new project's URL and publishable key (or legacy `anon` key) into `.env.local` in the repository root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Never put a Supabase secret or service-role key in an `EXPO_PUBLIC_` variable; those values are bundled into the app. Restart Expo after changing the environment. Native sessions use AsyncStorage and web sessions use browser storage.

```bash
npm install
npx expo start --web
```

After signing in, create and complete a pour. Another user should see only their own pours, tickets, and dashboard data. Ticket export downloads an authenticated Excel workbook on web or opens the native sharing sheet. The device provisioning and Pi event ingestion phases are not implemented yet, so new loads and activity will not arrive automatically.

## Verification

```bash
npx tsc --noEmit
npm run lint
cd backend
npm run test:dashboard
```

The dashboard test uses a simulated user-scoped database; the SQL tests must also be run against a disposable Supabase database to verify actual RLS and database constraints. Test the deployed function with two real accounts, including sign-out, account switching, pour creation/completion, and Excel export. Test password recovery and mobile sharing/deep links on their target platforms.

## Legacy backend

`backend/src` and `backend/supabase/schema.sql` are the old unauthenticated Railway MVP, kept as reference while the replacement is built. Do not connect the new app to that backend or use its service-role key in the app. The old Pi and ticket endpoints do not use per-user ownership and must not be treated as part of the new Supabase setup. See `backend/README.md` for legacy endpoint details.
