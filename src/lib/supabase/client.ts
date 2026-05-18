import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns true if Supabase environment variables are configured.
 * When false, the app should continue in local-only mode.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
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
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl!, supabaseAnonKey!);
}
