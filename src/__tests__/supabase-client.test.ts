import { describe, it, expect, afterEach } from "vitest";
import { isSupabaseConfigured, createSupabaseClient } from "@/lib/supabase/client";

function clearSupabaseEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function setSupabaseEnv(url: string, key: string) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;
}

afterEach(() => {
  clearSupabaseEnv();
});

describe("isSupabaseConfigured", () => {
  it("returns false when both env vars are missing", () => {
    clearSupabaseEnv();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false when only URL is set", () => {
    clearSupabaseEnv();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false when only anon key is set", () => {
    clearSupabaseEnv();
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns true when both env vars are set", () => {
    setSupabaseEnv("https://example.supabase.co", "anon-key");
    expect(isSupabaseConfigured()).toBe(true);
  });
});

describe("createSupabaseClient", () => {
  it("returns null when both env vars are missing", () => {
    clearSupabaseEnv();
    expect(createSupabaseClient()).toBeNull();
  });

  it("does not throw when env vars are missing", () => {
    clearSupabaseEnv();
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it("returns a client when both env vars are set", () => {
    setSupabaseEnv("https://example.supabase.co", "anon-key");
    const client = createSupabaseClient();
    expect(client).not.toBeNull();
    expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe(
      "https://example.supabase.co",
    );
  });
});

describe("import safety", () => {
  it("module import does not throw when env vars are missing", async () => {
    clearSupabaseEnv();
    await expect(
      import("@/lib/supabase/client"),
    ).resolves.toBeDefined();
  });

  it("module import does not throw when env vars are set", async () => {
    setSupabaseEnv("https://example.supabase.co", "anon-key");
    await expect(
      import("@/lib/supabase/client"),
    ).resolves.toBeDefined();
  });

  it("module import does not throw auth hook", async () => {
    await expect(
      import("@/lib/supabase/auth"),
    ).resolves.toBeDefined();
  });
});
