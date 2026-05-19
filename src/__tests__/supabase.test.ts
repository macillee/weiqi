import { describe, it, expect } from "vitest";
import { classifySupabaseError, getSyncErrorMessage, isRecoverableError } from "@/lib/supabase/supabase-error";

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


