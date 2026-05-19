import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if Supabase environment variables are configured.
 * When false, the app should continue in local-only mode.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
}

/**
 * Creates a Supabase browser client.
 *
 * If environment variables are missing, returns null.
 * Callers MUST check for null before using the client.
 * This ensures the local anonymous mode never crashes
 * due to missing Supabase configuration.
 */
export function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(url && key)) {
    return null;
  }
  return createClient(url, key);
}
