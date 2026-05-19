import { createSupabaseClient } from "./client";
import { classifySupabaseError, type SupabaseError } from "./supabase-error";

export type ChildProfile = {
  id: string;
  parent_user_id: string;
  display_name: string;
  age_range: string | null;
  go_experience: string | null;
  created_at: string;
  updated_at: string;
};

export type ChildProfileResult = {
  success: boolean;
  data: ChildProfile | ChildProfile[] | null;
  error: SupabaseError | null;
};

/**
 * Fetches all child profiles for the current authenticated parent.
 * Returns empty array if no profiles exist or if not authenticated.
 */
export async function fetchChildProfiles(): Promise<ChildProfileResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      data: [],
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { data, error } = await client
      .from("child_profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: data as ChildProfile[] | null, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: classifySupabaseError(err),
    };
  }
}

/**
 * Creates a new child profile for the current authenticated parent.
 */
export async function createChildProfile(input: {
  display_name: string;
  age_range?: string;
  go_experience?: string;
}): Promise<ChildProfileResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      data: null,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { data, error } = await client
      .from("child_profiles")
      .insert({
        display_name: input.display_name,
        age_range: input.age_range || null,
        go_experience: input.go_experience || null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as ChildProfile, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: classifySupabaseError(err),
    };
  }
}

/**
 * Updates an existing child profile.
 * Only the parent who owns the profile can update it.
 */
export async function updateChildProfile(
  id: string,
  updates: {
    display_name?: string;
    age_range?: string;
    go_experience?: string;
  },
): Promise<ChildProfileResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      data: null,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { data, error } = await client
      .from("child_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as ChildProfile, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: classifySupabaseError(err),
    };
  }
}

/**
 * Deletes a child profile.
 * Only the parent who owns the profile can delete it.
 */
export async function deleteChildProfile(id: string): Promise<ChildProfileResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      success: false,
      data: null,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const { error } = await client
      .from("child_profiles")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true, data: null, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: classifySupabaseError(err),
    };
  }
}
