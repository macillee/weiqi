import { describe, it, expect, afterEach } from "vitest";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from "@/lib/supabase/auth-actions";

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

afterEach(() => {
  clearSupabaseEnv();
});

describe("signInWithEmail — missing env", () => {
  it("returns not_configured when env vars are missing", async () => {
    clearSupabaseEnv();
    const result = await signInWithEmail("test@example.com", "password");
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_configured");
    expect(result.error?.message).toContain("尚未配置");
  });

  it("does not throw when env vars are missing", async () => {
    clearSupabaseEnv();
    await expect(
      signInWithEmail("test@example.com", "password"),
    ).resolves.toBeDefined();
  });
});

describe("signUpWithEmail — missing env", () => {
  it("returns not_configured when env vars are missing", async () => {
    clearSupabaseEnv();
    const result = await signUpWithEmail("test@example.com", "password");
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_configured");
    expect(result.error?.message).toContain("尚未配置");
  });

  it("does not throw when env vars are missing", async () => {
    clearSupabaseEnv();
    await expect(
      signUpWithEmail("test@example.com", "password"),
    ).resolves.toBeDefined();
  });
});

describe("signOutUser — missing env", () => {
  it("returns not_configured when env vars are missing", async () => {
    clearSupabaseEnv();
    const result = await signOutUser();
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_configured");
    expect(result.error?.message).toContain("尚未配置");
  });

  it("does not throw when env vars are missing", async () => {
    clearSupabaseEnv();
    await expect(signOutUser()).resolves.toBeDefined();
  });
});
