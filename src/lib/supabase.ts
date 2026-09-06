import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Server-side singleton client (with WebSocket support for Node if needed)
let serverClient: any = null;

export function getSupabaseServerClient(): any {
  if (!serverClient) {
    let wsTransport: any = undefined;
    if (typeof window === 'undefined') {
      try {
        wsTransport = require('ws');
      } catch {
        // ws optional
      }
    }

    serverClient = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      ...(wsTransport ? { realtime: { transport: wsTransport } } : {}),
    });
  }
  return serverClient;
}

export const supabase: any = getSupabaseServerClient();
