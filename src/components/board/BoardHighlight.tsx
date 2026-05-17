import type { HighlightType } from "@/lib/board";

type BoardHighlightProps = {
  cx: number;
  cy: number;
  radius: number;
  highlightType: HighlightType;
};

const highlightColors: Record<HighlightType, string> = {
  correct: "rgba(34, 197, 94, 0.6)",
  wrong: "rgba(239, 68, 68, 0.6)",
  hint: "rgba(59, 130, 246, 0.6)",
  lastMove: "rgba(234, 179, 8, 0.5)",
};

export default function BoardHighlight({
  cx,
  cy,
  radius,
  highlightType,
}: BoardHighlightProps) {
  if (highlightType === "lastMove") {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.35}
        fill={highlightColors[highlightType]}
      />
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius * 0.85}
      fill={highlightColors[highlightType]}
    />
  );
}
