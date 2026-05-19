"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  function validate(): string | null {
    if (!email.trim()) return "请输入邮箱。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "邮箱格式不正确。";
    if (!password) return "请输入密码。";
    if (password.length < 6) return "密码至少 6 位。";
    if (mode === "signup" && password !== confirmPassword) return "两次密码不一致。";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const result =
      mode === "signin"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else if (result.success) {
      router.push("/");
    }
  }

  function toggleMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-900 mb-1">账号登录</h1>
            <p className="text-amber-700 text-sm">云端功能尚未配置</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <p className="text-gray-600 mb-4">
              当前未配置 Supabase 云端服务，暂时无法使用登录功能。
            </p>
            <p className="text-sm text-gray-500 mb-6">
              您可以继续使用本地匿名模式做题。
            </p>

            <Link
              href="/"
              className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl p-4 shadow text-center transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-1">
            {mode === "signin" ? "家长登录" : "注册账号"}
          </h1>
          <p className="text-amber-700 text-sm">
            {mode === "signin"
              ? "登录后可以同步孩子的学习进度"
              : "创建账号，保存学习进度"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none"
              placeholder="至少 6 位"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-900 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none"
                placeholder="再次输入密码"
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl font-medium transition-colors"
          >
            {loading
              ? "处理中..."
              : mode === "signin"
                ? "登录"
                : "注册"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={toggleMode}
            className="text-sm text-amber-600 hover:text-amber-800"
          >
            {mode === "signin" ? "没有账号？注册一个" : "已有账号？去登录"}
          </button>
        </div>

        <Link
          href="/"
          className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl p-4 shadow text-center transition-colors mt-6"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
