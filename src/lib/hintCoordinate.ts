export type Point = { x: number; y: number };

const COORD_PATTERN = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;

export function extractHintCoordinate(
  text: string | null | undefined,
  boardSize: number,
): Point | null {
  if (typeof text !== "string") return null;
  if (!Number.isInteger(boardSize) || boardSize <= 0) return null;

  COORD_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = COORD_PATTERN.exec(text);
  while (match !== null) {
    const x = Number.parseInt(match[1], 10);
    const y = Number.parseInt(match[2], 10);
    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
      return { x, y };
    }
    match = COORD_PATTERN.exec(text);
  }
  return null;
}

export function extractHintCoordinates(
  hints: ReadonlyArray<string>,
  boardSize: number,
): Point[] {
  const out: Point[] = [];
  for (const hint of hints) {
    const p = extractHintCoordinate(hint, boardSize);
    if (p !== null) out.push(p);
  }
  return out;
}

export function getRevealedHintCoordinates(
  hints: ReadonlyArray<string>,
  visibleCount: number,
  boardSize: number,
): Point[] {
  const safeCount = Math.max(0, Math.min(visibleCount, hints.length));
  if (safeCount === 0) return [];
  return extractHintCoordinates(hints.slice(0, safeCount), boardSize);
}
