"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import {
  fetchChildProfiles,
  createChildProfile,
  type ChildProfile,
} from "@/lib/supabase/child-profiles";
import {
  getSelectedChildProfileId,
  setSelectedChildProfileId,
} from "@/lib/selected-child";
import type { SupabaseError } from "@/lib/supabase/supabase-error";

export default function ChildrenPage() {
  const router = useRouter();
  const { session, isLoading: authLoading } = useSupabaseAuth();

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SupabaseError | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [goExperience, setGoExperience] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<SupabaseError | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [authLoading, session, router]);

  // Load child profiles
  useEffect(() => {
    if (!session) return;
    const parentUserId = session.user.id;

    async function load() {
      setLoading(true);
      const result = await fetchChildProfiles();
      if (result.success && result.data) {
        setProfiles(result.data as ChildProfile[]);
        const current = getSelectedChildProfileId(parentUserId);
        setSelectedId(current);
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
    }

    load();
  }, [session]);

  const handleSelect = (id: string) => {
    if (!session) return;
    setSelectedChildProfileId(session.user.id, id);
    setSelectedId(id);
    router.push("/");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setCreateError(null);

    const result = await createChildProfile({
      display_name: name.trim(),
      age_range: ageRange || undefined,
      go_experience: goExperience || undefined,
    });

    if (result.success && result.data) {
      setProfiles((prev) => [...prev, result.data as ChildProfile]);
      setShowForm(false);
      setName("");
      setAgeRange("");
      setGoExperience("");
    } else if (result.error) {
      setCreateError(result.error);
    }

    setCreating(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-700">加载中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            孩子档案
          </h1>
          <p className="text-amber-700 text-sm">
            选择或创建一个孩子档案
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-amber-700">加载中...</p>
          </div>
        ) : (
          <>
            {/* Existing profiles */}
            <div className="space-y-3 mb-6">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedId === profile.id
                      ? "border-green-500 bg-green-50"
                      : "border-amber-200 bg-white hover:border-amber-400"
                  }`}
                >
                  <div className="font-bold text-amber-900">
                    {profile.display_name}
                    {selectedId === profile.id && (
                      <span className="ml-2 text-green-600 text-sm">
                        ✓ 已选择
                      </span>
                    )}
                  </div>
                  {(profile.age_range || profile.go_experience) && (
                    <div className="text-sm text-amber-600 mt-1">
                      {profile.age_range && `${profile.age_range}岁`}
                      {profile.age_range && profile.go_experience && " · "}
                      {profile.go_experience &&
                        {
                          new: "刚学",
                          about_6_months: "学了半年",
                          about_1_year: "学了一年",
                          more_than_1_year: "学了一年多",
                        }[profile.go_experience]}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Create new profile */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl p-4 font-bold transition-colors"
              >
                + 添加孩子档案
              </button>
            ) : (
              <form
                onSubmit={handleCreate}
                className="bg-white rounded-xl p-4 border border-amber-200 space-y-3"
              >
                <h2 className="font-bold text-amber-900">添加孩子档案</h2>

                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm">{createError.message}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    昵称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：小明"
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    年龄范围（可选）
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">请选择</option>
                    <option value="6-8">6-8 岁</option>
                    <option value="9-10">9-10 岁</option>
                    <option value="11-12">11-12 岁</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    围棋经验（可选）
                  </label>
                  <select
                    value={goExperience}
                    onChange={(e) => setGoExperience(e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">请选择</option>
                    <option value="new">刚学</option>
                    <option value="about_6_months">学了半年</option>
                    <option value="about_1_year">学了一年</option>
                    <option value="more_than_1_year">学了一年多</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-amber-300 text-white rounded-lg py-2 font-bold transition-colors"
                  >
                    {creating ? "创建中..." : "创建"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setCreateError(null);
                    }}
                    className="flex-1 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-lg py-2 font-bold transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-amber-500 hover:text-amber-700"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
