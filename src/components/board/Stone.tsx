import type { StoneColor } from "@/lib/board";

type StoneProps = {
  cx: number;
  cy: number;
  radius: number;
  color: StoneColor;
};

export default function Stone({ cx, cy, radius, color }: StoneProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={color === "black" ? "#1a1a1a" : "#f5f5f5"}
      stroke={color === "black" ? "#000" : "#999"}
      strokeWidth={1}
    >
      {color === "white" && (
        <circle
          cx={cx - radius * 0.25}
          cy={cy - radius * 0.25}
          r={radius * 0.35}
          fill="white"
          opacity={0.6}
        />
      )}
    </circle>
  );
}
