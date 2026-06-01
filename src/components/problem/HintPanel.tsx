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
  const total = hints.length;
  const revealed = hints.slice(0, visibleCount);

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
          <span aria-hidden="true">💡</span>
          <span>提示</span>
          {total > 0 && (
            <span className="text-xs text-amber-600 font-normal">
              ({visibleCount}/{total})
            </span>
          )}
        </span>
        {!allShown && total > 0 && (
          <button
            type="button"
            onClick={onShowHint}
            className="text-sm px-3 py-1 rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 font-medium transition-colors"
          >
            显示提示
          </button>
        )}
      </div>

      {visibleCount === 0 && (
        <p className="text-sm text-amber-600 italic">
          {total === 0 ? "这道题没有提示。" : "还没有提示，先想一想吧。"}
        </p>
      )}

      <ul className="space-y-2">
        {revealed.map((hint, i) => {
          const isLast = i === revealed.length - 1;
          return (
            <li
              key={i}
              data-testid={`hint-card-${i}`}
              data-hint-index={i}
              className={`flex gap-3 items-start text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 shadow-sm ${
                isLast && visibleCount > 0
                  ? "animate-hint-fade-in"
                  : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold"
              >
                {i + 1}
              </span>
              <span className="text-amber-800 leading-relaxed">{hint}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
