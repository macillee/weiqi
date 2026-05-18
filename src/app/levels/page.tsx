import Link from "next/link";
import { chapters } from "@/lib/chapters";

export default function LevelsPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          闯关地图
        </h1>
        <p className="text-amber-700">选择一个章节开始闯关吧！</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {chapters.map((chapter) => {
          const totalProblems = chapter.levels.reduce(
            (sum, l) => sum + l.problemIds.length,
            0,
          );
          return (
            <Link
              key={chapter.id}
              href={`/levels/${chapter.id}`}
              className="block bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{chapter.emoji}</div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-amber-900">
                    {chapter.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {chapter.description}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    {chapter.levels.length} 关 · {totalProblems} 道题
                  </div>
                </div>
                <div className="text-amber-400 text-xl">→</div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/"
        className="mt-8 text-amber-600 hover:text-amber-800 text-sm"
      >
        ← 返回首页
      </Link>
    </div>
  );
}
