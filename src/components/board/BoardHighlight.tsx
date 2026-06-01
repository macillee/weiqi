import type { HighlightType } from "@/lib/board";

type BoardHighlightProps = {
  cx: number;
  cy: number;
  radius: number;
  highlightType: HighlightType;
};

const highlightColors: Record<HighlightType, { fill: string; stroke: string }> = {
  correct: { fill: "rgba(34, 197, 94, 0.6)", stroke: "rgba(34, 197, 94, 0.9)" },
  wrong: { fill: "rgba(239, 68, 68, 0.6)", stroke: "rgba(239, 68, 68, 0.9)" },
  hint: { fill: "rgba(59, 130, 246, 0.0)", stroke: "rgba(59, 130, 246, 0.95)" },
  lastMove: { fill: "rgba(234, 179, 8, 0.5)", stroke: "rgba(234, 179, 8, 0.9)" },
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
        fill={highlightColors[highlightType].fill}
      />
    );
  }

  if (highlightType === "hint") {
    return (
      <g pointerEvents="none">
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.4}
          fill={highlightColors[highlightType].fill}
          stroke={highlightColors[highlightType].stroke}
          strokeWidth={2.5}
        />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius * 0.85}
      fill={highlightColors[highlightType].fill}
    />
  );
}
