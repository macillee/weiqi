import { describe, it, expect, beforeEach, vi } from "vitest";
import { classifySupabaseError, getSyncErrorMessage, isRecoverableError } from "@/lib/supabase/supabase-error";

describe("isSupabaseConfigured", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false when both env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false when only URL is set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false when only anon key is set", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns true when both env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    expect(isSupabaseConfigured()).toBe(true);
  });
});

describe("createSupabaseClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns null when both env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createSupabaseClient } = await import("@/lib/supabase/client");
    expect(createSupabaseClient()).toBeNull();
  });

  it("does not throw when env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { createSupabaseClient } = await import("@/lib/supabase/client");
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it("returns a client when both env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { createSupabaseClient } = await import("@/lib/supabase/client");
    const client = createSupabaseClient();
    expect(client).not.toBeNull();
  });
});

describe("classifySupabaseError", () => {
  it("classifies network errors correctly", () => {
    const err = classifySupabaseError(new Error("fetch failed"));
    expect(err.type).toBe("network_error");
  });

  it("classifies server errors correctly", () => {
    const err = classifySupabaseError(new Error("500 Internal Server Error"));
    expect(err.type).toBe("server_error");
  });

  it("classifies auth errors correctly", () => {
    const err = classifySupabaseError(new Error("session expired"));
    expect(err.type).toBe("auth_error");
  });

  it("classifies permission errors correctly", () => {
    const err = classifySupabaseError(new Error("403 Forbidden"));
    expect(err.type).toBe("permission_error");
  });

  it("classifies unknown errors correctly", () => {
    const err = classifySupabaseError(new Error("something weird happened"));
    expect(err.type).toBe("unknown");
  });

  it("handles non-Error input gracefully", () => {
    const err = classifySupabaseError("string error");
    expect(err.type).toBe("unknown");
  });

  it("handles null input gracefully", () => {
    const err = classifySupabaseError(null);
    expect(err.type).toBe("unknown");
  });
});

describe("getSyncErrorMessage", () => {
  it("returns Chinese message for network error", () => {
    const msg = getSyncErrorMessage({ type: "network_error", message: "" });
    expect(msg).toContain("网络连接失败");
    expect(msg).toContain("本地");
  });

  it("returns Chinese message for not_configured", () => {
    const msg = getSyncErrorMessage({ type: "not_configured", message: "" });
    expect(msg).toContain("尚未配置");
  });

  it("returns Chinese message for auth error", () => {
    const msg = getSyncErrorMessage({ type: "auth_error", message: "" });
    expect(msg).toContain("重新登录");
  });
});

describe("isRecoverableError", () => {
  it("returns true for network_error", () => {
    expect(isRecoverableError({ type: "network_error", message: "" })).toBe(true);
  });

  it("returns true for server_error", () => {
    expect(isRecoverableError({ type: "server_error", message: "" })).toBe(true);
  });

  it("returns false for auth_error", () => {
    expect(isRecoverableError({ type: "auth_error", message: "" })).toBe(false);
  });

  it("returns false for permission_error", () => {
    expect(isRecoverableError({ type: "permission_error", message: "" })).toBe(false);
  });

  it("returns false for not_configured", () => {
    expect(isRecoverableError({ type: "not_configured", message: "" })).toBe(false);
  });
});

describe("import safety", () => {
  it("module import does not throw when env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await expect(
      import("@/lib/supabase/client"),
    ).resolves.toBeDefined();
  });

  it("module import of auth does not throw", async () => {
    await expect(
      import("@/lib/supabase/auth"),
    ).resolves.toBeDefined();
  });
});
