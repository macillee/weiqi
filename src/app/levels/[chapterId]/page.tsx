"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterById, type LevelNode } from "@/lib/chapters";
import { loadProblems, type Problem } from "@/lib/problems";
import ProblemPlayer from "@/components/problem/ProblemPlayer";

type ViewMode = "list" | "playing";

export default function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const resolvedParams = React.use(params);
  const chapter = getChapterById(resolvedParams.chapterId);
  if (!chapter) notFound();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);

  function startLevel(level: LevelNode) {
    const allProblems = loadProblems();
    const levelProblems = level.problemIds
      .map((id) => allProblems.find((p) => p.id === id))
      .filter((p): p is Problem => p !== undefined);
    setProblems(levelProblems);
    setCurrentLevel(level);
    setCurrentProblemIndex(0);
    setViewMode("playing");
  }

  const handleNext = useCallback(() => {
    if (currentProblemIndex + 1 < problems.length) {
      setCurrentProblemIndex((prev) => prev + 1);
    } else {
      setViewMode("list");
    }
  }, [currentProblemIndex, problems.length]);

  if (viewMode === "playing" && currentLevel && problems.length > 0) {
    const problem = problems[currentProblemIndex];
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 bg-amber-100">
            <button
              onClick={() => setViewMode("list")}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              ← 返回关卡
            </button>
            <div className="text-sm font-medium text-amber-800">
              {currentLevel.title} · 第 {currentProblemIndex + 1} / {problems.length} 题
            </div>
          </div>

          <div className="w-full bg-amber-200 h-2">
            <div
              className="bg-green-500 h-2 transition-all"
              style={{
                width: `${((currentProblemIndex) / problems.length) * 100}%`,
              }}
            />
          </div>

          <ProblemPlayer problem={problem} onNext={handleNext} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{chapter.emoji}</div>
        <h1 className="text-2xl font-bold text-amber-900">{chapter.title}</h1>
        <p className="text-amber-700 mt-1">{chapter.description}</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {chapter.levels.map((level) => {
          const allProblems = loadProblems();
          const levelProblems = level.problemIds.filter(
            (id) => allProblems.find((p) => p.id === id),
          );
          return (
            <button
              key={level.id}
              onClick={() => startLevel(level)}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-amber-900">{level.title}</div>
                <div className="text-sm text-gray-500">
                  {levelProblems.length} 道题
                </div>
              </div>
              <div className="text-green-500 font-bold text-lg">开始 →</div>
            </button>
          );
        })}
      </div>

      <Link
        href="/levels"
        className="mt-8 text-amber-600 hover:text-amber-800 text-sm"
      >
        ← 返回闯关地图
      </Link>
    </div>
  );
}
