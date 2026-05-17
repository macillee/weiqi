export type StoneColor = "black" | "white";

export type Stone = {
  x: number;
  y: number;
  color: StoneColor;
};

export type HighlightType = "correct" | "wrong" | "hint" | "lastMove";

export type Highlight = {
  x: number;
  y: number;
  type: HighlightType;
};

export type GoBoardProps = {
  size: 9 | 13 | 19;
  stones: Stone[];
  disabled?: boolean;
  lastMove?: { x: number; y: number };
  highlights?: Highlight[];
  onPointClick?: (x: number, y: number) => void;
};

export function isPointOnBoard(
  point: { x: number; y: number },
  size: number,
): boolean {
  return point.x >= 0 && point.x < size && point.y >= 0 && point.y < size;
}

export function isPointEmpty(
  point: { x: number; y: number },
  stones: Stone[],
): boolean {
  return !stones.some(
    (s) => s.x === point.x && s.y === point.y,
  );
}

export function getNeighbors(
  point: { x: number; y: number },
  size: number,
): Array<{ x: number; y: number }> {
  const neighbors: Array<{ x: number; y: number }> = [];
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  for (const d of dirs) {
    const nx = point.x + d.x;
    const ny = point.y + d.y;
    if (isPointOnBoard({ x: nx, y: ny }, size)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

export function getGroup(
  point: { x: number; y: number },
  stones: Stone[],
  size: number,
): Stone[] {
  const stoneAtPoint = stones.find(
    (s) => s.x === point.x && s.y === point.y,
  );
  if (!stoneAtPoint) return [];

  const group: Stone[] = [];
  const visited = new Set<string>();
  const queue = [{ x: point.x, y: point.y }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const currentStone = stones.find(
      (s) => s.x === current.x && s.y === current.y,
    );
    if (currentStone) {
      group.push(currentStone);
      const neighbors = getNeighbors(current, size);
      for (const n of neighbors) {
        const nKey = `${n.x},${n.y}`;
        if (!visited.has(nKey)) {
          const nStone = stones.find(
            (s) => s.x === n.x && s.y === n.y,
          );
          if (nStone && nStone.color === stoneAtPoint.color) {
            queue.push(n);
          }
        }
      }
    }
  }

  return group;
}

export function countLiberties(
  group: Stone[],
  stones: Stone[],
  size: number,
): number {
  const libertySet = new Set<string>();
  for (const stone of group) {
    const neighbors = getNeighbors(stone, size);
    for (const n of neighbors) {
      if (isPointEmpty(n, stones)) {
        libertySet.add(`${n.x},${n.y}`);
      }
    }
  }
  return libertySet.size;
}
