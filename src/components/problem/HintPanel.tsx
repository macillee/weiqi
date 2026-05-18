type HintPanelProps = {
  hints: string[];
  visibleCount: number;
  onShowHint: () => void;
  allShown: boolean;
};

export default function HintPanel({
  hints,
  visibleCount,
  onShowHint,
  allShown,
}: HintPanelProps) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-amber-800">提示</span>
        {!allShown && (
          <button
            onClick={onShowHint}
            className="text-sm px-3 py-1 rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 font-medium"
          >
            显示提示
          </button>
        )}
      </div>
      {visibleCount === 0 && (
        <p className="text-sm text-amber-600 italic">还没有提示，先想一想吧。</p>
      )}
      <ul className="space-y-1">
        {hints.slice(0, visibleCount).map((hint, i) => (
          <li
            key={i}
            className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2"
          >
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
}
