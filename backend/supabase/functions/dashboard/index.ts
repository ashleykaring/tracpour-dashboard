import { withSupabase } from 'npm:@supabase/server@1.9.2';
import ExcelJS from 'npm:exceljs@4.4.0';

import { handleDashboard } from './service.ts';

// ctx.supabase uses the caller's verified JWT and enforces RLS. No privileged
// client or service-role key is used for dashboard operations.
Deno.serve(withSupabase({ auth: 'user' }, (request, ctx) =>
  handleDashboard(request, ctx.supabase, ctx.userClaims!.id, ExcelJS)
));
