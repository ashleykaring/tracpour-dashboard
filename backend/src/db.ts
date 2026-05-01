import { createClient } from '@supabase/supabase-js';

import { config } from './config';

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function throwIfSupabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export function requireData<T>(data: T | null, message: string): T {
  if (!data) {
    throw new Error(message);
  }

  return data;
}
