"use client";

import { createSupabaseClient } from "./client";
import { classifySupabaseError, type SupabaseError } from "./supabase-error";

export type AuthResult = {
  success: boolean;
  error: SupabaseError | null;
};

/**
 * Signs in with email and password.
 * Returns { success, error }. Never throws.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: classifySupabaseError(error) };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: classifySupabaseError(err) };
  }
}

/**
 * Signs up with email and password.
 * Returns { success, error }. Never throws.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { error } = await client.auth.signUp({
      email,
      password,
    });
    if (error) {
      return { success: false, error: classifySupabaseError(error) };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: classifySupabaseError(err) };
  }
}

/**
 * Signs out the current user.
 * Returns { success, error }. Never throws.
 */
export async function signOutUser(): Promise<AuthResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      return { success: false, error: classifySupabaseError(error) };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: classifySupabaseError(err) };
  }
}
