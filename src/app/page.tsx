import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          欢迎回来，小棋手！
        </h1>
        <p className="text-amber-700">今天也要加油哦。</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <Link
          href="/practice"
          className="block w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">📝</div>
          <div className="text-xl font-bold">今日练习</div>
          <div className="text-sm text-green-100 mt-1">
            完成今天的练习题
          </div>
        </Link>

        <Link
          href="/levels"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-xl font-bold">闯关地图</div>
          <div className="text-sm text-blue-100 mt-1">
            挑战不同的关卡
          </div>
        </Link>

        <Link
          href="/demo"
          className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-2xl p-4 shadow text-center transition-colors"
        >
          <div className="text-lg font-bold">题目演示</div>
          <div className="text-sm text-amber-800 mt-1">
            浏览所有题目
          </div>
        </Link>
      </div>
    </div>
  );
}
