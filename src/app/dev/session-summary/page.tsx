"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/progress";
import { buildSessionSummaryInput } from "@/lib/session-summary-input";
import { summarizeLearningSession } from "@/lib/session-summary";
import type { ParentSessionSummary } from "@/lib/session-summary";

export default function DevSessionSummaryPage() {
  const [summary, setSummary] = useState<ParentSessionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage init must happen client-side */
    const progress = loadProgress();
    const input = buildSessionSummaryInput(progress);
    const result = summarizeLearningSession(input);
    setSummary(result);
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded">
          <p className="font-bold">🔧 开发者调试面板</p>
          <p className="text-sm mt-1">
            此页面仅用于开发调试。数据仅存储在本地浏览器中，不会发送到任何服务器。
          </p>
          <p className="text-sm mt-1">
            这不是成绩或排名，仅作为练习参考。
          </p>
        </div>

        {!summary || summary.totalAttempted === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <p className="text-gray-500 text-lg">暂无练习数据</p>
            <p className="text-gray-400 text-sm mt-2">
              完成一些练习后，这里会显示摘要。
            </p>
            <Link
              href="/practice"
              className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              开始练习
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
              <h2 className="text-lg font-bold mb-3">会话概要</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="信号质量" value={summary.signalQuality} />
                <InfoItem label="总题数" value={String(summary.totalAttempted)} />
                <InfoItem label="一次做对" value={String(summary.totalCorrectFirstTry)} />
                <InfoItem label="重试次数" value={String(summary.totalRetried)} />
                <InfoItem label="使用提示" value={String(summary.totalHintsUsed)} />
                <InfoItem label="多步题尝试" value={String(summary.multiStepAttempted)} />
                <InfoItem label="多步题完成" value={String(summary.multiStepCompleted)} />
              </div>
            </div>

            {summary.warnings.length > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 rounded text-sm text-orange-800">
                {summary.warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            )}

            {summary.categories.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold mb-3">分类统计</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-1 pr-2">分类</th>
                      <th className="py-1 pr-2">题数</th>
                      <th className="py-1 pr-2">一次做对</th>
                      <th className="py-1 pr-2">重试</th>
                      <th className="py-1 pr-2">提示</th>
                      <th className="py-1 pr-2">多步</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.categories.map((c) => (
                      <tr key={c.category} className="border-b border-gray-100">
                        <td className="py-1 pr-2">{c.category}</td>
                        <td className="py-1 pr-2">{c.attempted}</td>
                        <td className="py-1 pr-2">{c.correctFirstTry}</td>
                        <td className="py-1 pr-2">{c.retried}</td>
                        <td className="py-1 pr-2">{c.hintsUsed}</td>
                        <td className="py-1 pr-2">
                          {c.multiStepAttempted > 0
                            ? `${c.multiStepCompleted}/${c.multiStepAttempted}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {summary.levels.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold mb-3">难度分布</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-1 pr-2">级别</th>
                      <th className="py-1 pr-2">题数</th>
                      <th className="py-1 pr-2">一次做对</th>
                      <th className="py-1 pr-2">提示</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.levels.map((l) => (
                      <tr key={l.level} className="border-b border-gray-100">
                        <td className="py-1 pr-2">L{l.level}</td>
                        <td className="py-1 pr-2">{l.attempted}</td>
                        <td className="py-1 pr-2">{l.correctFirstTry}</td>
                        <td className="py-1 pr-2">{l.hintsUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {summary.strengths.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold mb-3 text-green-700">👍 表现不错</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {summary.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.shakyConcepts.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold mb-3 text-amber-700">📝 可以继续巩固</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {summary.shakyConcepts.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.suggestedNextFocus.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold mb-3 text-blue-700">🎯 明日建议</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {summary.suggestedNextFocus.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded text-sm text-green-800">
              <p className="font-bold">家长笔记</p>
              <p className="mt-1">{summary.parentNote}</p>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              <p>会话 ID: {summary.sessionId}</p>
              <p>生成时间: {summary.reviewedAt}</p>
            </div>
          </>
        )}

        <div className="text-center mt-4">
          <Link href="/" className="text-blue-500 hover:text-blue-700 text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
