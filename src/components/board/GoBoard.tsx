"use client";

import type { GoBoardProps, Stone, Highlight } from "@/lib/board";
import { isPointOnBoard } from "@/lib/board";
import StoneComponent from "./Stone";
import BoardHighlight from "./BoardHighlight";
import BoardPoint from "./BoardPoint";

const BOARD_PADDING = 40;
const CELL_SIZE = 40;
const LABEL_FONT_SIZE = 12;
const CHINESE_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

function getStarPoints(size: number): Array<{ x: number; y: number }> {
  if (size === 9) {
    return [
      { x: 2, y: 2 },
      { x: 2, y: 6 },
      { x: 4, y: 4 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
    ];
  }
  if (size === 13) {
    return [
      { x: 3, y: 3 },
      { x: 3, y: 9 },
      { x: 6, y: 6 },
      { x: 9, y: 3 },
      { x: 9, y: 9 },
    ];
  }
  return [
    { x: 3, y: 3 },
    { x: 3, y: 9 },
    { x: 3, y: 15 },
    { x: 9, y: 3 },
    { x: 9, y: 9 },
    { x: 9, y: 15 },
    { x: 15, y: 3 },
    { x: 15, y: 9 },
    { x: 15, y: 15 },
  ];
}

function coordToPixel(coord: number): number {
  return BOARD_PADDING + coord * CELL_SIZE;
}

export default function GoBoard({
  size,
  stones,
  disabled = false,
  lastMove,
  highlights = [],
  onPointClick,
}: GoBoardProps) {
  const svgSize = BOARD_PADDING * 2 + (size - 1) * CELL_SIZE;
  const stoneRadius = CELL_SIZE * 0.42;
  const starPoints = getStarPoints(size);

  function isOccupied(x: number, y: number): boolean {
    return stones.some((s) => s.x === x && s.y === y);
  }

  function handlePointClick(x: number, y: number) {
    if (!isPointOnBoard({ x, y }, size)) return;
    if (isOccupied(x, y)) return;
    if (disabled) return;
    onPointClick?.(x, y);
  }

  const gridLines = [];
  for (let i = 0; i < size; i++) {
    const pos = coordToPixel(i);
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={BOARD_PADDING}
        y1={pos}
        x2={BOARD_PADDING + (size - 1) * CELL_SIZE}
        y2={pos}
        stroke="#333"
        strokeWidth={1}
      />,
      <line
        key={`v-${i}`}
        x1={pos}
        y1={BOARD_PADDING}
        x2={pos}
        y2={BOARD_PADDING + (size - 1) * CELL_SIZE}
        stroke="#333"
        strokeWidth={1}
      />,
    );
  }

  const starPointElements = starPoints.map((sp, i) => (
    <circle
      key={`star-${i}`}
      cx={coordToPixel(sp.x)}
      cy={coordToPixel(sp.y)}
      r={4}
      fill="#333"
    />
  ));

  const highlightElements = highlights.map((hl: Highlight, i: number) => (
    <BoardHighlight
      key={`hl-${i}`}
      cx={coordToPixel(hl.x)}
      cy={coordToPixel(hl.y)}
      radius={stoneRadius}
      highlightType={hl.type}
    />
  ));

  const stoneElements = stones.map((stone: Stone, i: number) => (
    <StoneComponent
      key={`stone-${i}`}
      cx={coordToPixel(stone.x)}
      cy={coordToPixel(stone.y)}
      radius={stoneRadius}
      color={stone.color}
    />
  ));

  const lastMoveElement =
    lastMove && isPointOnBoard(lastMove, size) ? (
      <BoardHighlight
        key="lastMove"
        cx={coordToPixel(lastMove.x)}
        cy={coordToPixel(lastMove.y)}
        radius={stoneRadius}
        highlightType="lastMove"
      />
    ) : null;

  const pointClickAreas = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      pointClickAreas.push(
        <BoardPoint
          key={`point-${x}-${y}`}
          boardX={x}
          boardY={y}
          cx={coordToPixel(x)}
          cy={coordToPixel(y)}
          cellSize={CELL_SIZE}
          disabled={disabled}
          occupied={isOccupied(x, y)}
          onClick={() => handlePointClick(x, y)}
        />,
      );
    }
  }

  const labelY = BOARD_PADDING / 2;
  const labelYBottom = svgSize - BOARD_PADDING / 2;
  const labelX = BOARD_PADDING / 2;
  const labelXRight = svgSize - BOARD_PADDING / 2;

  const coordinateLabels = [];
  for (let i = 0; i < size; i++) {
    const pos = coordToPixel(i);
    const ch = CHINESE_NUMBERS[i];
    coordinateLabels.push(
      <text
        key={`label-top-${i}`}
        x={pos}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={LABEL_FONT_SIZE}
        fill="#333"
      >
        {ch}
      </text>,
      <text
        key={`label-bottom-${i}`}
        x={pos}
        y={labelYBottom}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={LABEL_FONT_SIZE}
        fill="#333"
      >
        {ch}
      </text>,
      <text
        key={`label-left-${i}`}
        x={labelX}
        y={pos}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={LABEL_FONT_SIZE}
        fill="#333"
      >
        {ch}
      </text>,
      <text
        key={`label-right-${i}`}
        x={labelXRight}
        y={pos}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={LABEL_FONT_SIZE}
        fill="#333"
      >
        {ch}
      </text>,
    );
  }

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width="100%"
      style={{ maxWidth: svgSize }}
      className="select-none"
      role="img"
      aria-label={`${size}x${size} Go board`}
    >
      <rect
        x={0}
        y={0}
        width={svgSize}
        height={svgSize}
        fill="#dcb35c"
        rx={4}
      />
      {gridLines}
      {starPointElements}
      {coordinateLabels}
      {highlightElements}
      {stoneElements}
      {lastMoveElement}
      {pointClickAreas}
    </svg>
  );
}
