"use client";

import { useEffect, useState } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createSupabaseClient } from "./client";
import { classifySupabaseError, type SupabaseError } from "./supabase-error";

/**
 * React hook that provides the current Supabase session and
 * auth state. Returns null session when Supabase is not
 * configured, keeping local mode functional.
 *
 * Cloud-failure tolerance:
 * - If Supabase is not configured, returns null session immediately.
 * - If Supabase Cloud is unreachable, catches the error and returns
 *   null session (local mode continues).
 * - Network errors are NOT thrown to the UI.
 */
export function useSupabaseAuth(): {
  session: Session | null;
  isLoading: boolean;
  error: SupabaseError | null;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SupabaseError | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- Supabase client init must happen client-side */
  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Get initial session
    client.auth
      .getSession()
      .then(({ data: { session }, error: authError }) => {
        if (!cancelled) {
          if (authError) {
            setError(classifySupabaseError(authError));
          }
          setSession(session);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(classifySupabaseError(err));
          setIsLoading(false);
        }
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setIsLoading(false);
        setError(null);
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { session, isLoading, error };
}
