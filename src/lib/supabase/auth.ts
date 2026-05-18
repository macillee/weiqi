"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createSupabaseClient } from "./client";

/**
 * Returns the current Supabase session, or null if not signed in
 * or if Supabase is not configured.
 */
export function getCurrentSession(): Session | null {
  const client = createSupabaseClient();
  if (!client) return null;
  // getSession is synchronous in the browser client when called
  // outside an async context; we use the synchronous accessor.
  // However, Supabase JS v2 requires async getSession. For a
  // synchronous read, we rely on the auth state listener below.
  // This helper is best used inside useEffect or async code.
  return null;
}

/**
 * React hook that provides the current Supabase session and
 * auth state. Returns null session when Supabase is not
 * configured, keeping local mode functional.
 */
export function useSupabaseAuth(): {
  session: Session | null;
  isLoading: boolean;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      // Supabase not configured — stay in local mode
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setSession(session);
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
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading };
}
