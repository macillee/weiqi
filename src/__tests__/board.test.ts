import { describe, it, expect } from "vitest";
import {
  isPointOnBoard,
  isPointEmpty,
  getNeighbors,
  getGroup,
  countLiberties,
} from "@/lib/board";
import type { Stone } from "@/lib/board";

describe("isPointOnBoard", () => {
  it("returns true for valid 9x9 coordinates", () => {
    expect(isPointOnBoard({ x: 0, y: 0 }, 9)).toBe(true);
    expect(isPointOnBoard({ x: 8, y: 8 }, 9)).toBe(true);
    expect(isPointOnBoard({ x: 4, y: 4 }, 9)).toBe(true);
  });

  it("returns false for out-of-range coordinates", () => {
    expect(isPointOnBoard({ x: -1, y: 0 }, 9)).toBe(false);
    expect(isPointOnBoard({ x: 0, y: -1 }, 9)).toBe(false);
    expect(isPointOnBoard({ x: 9, y: 0 }, 9)).toBe(false);
    expect(isPointOnBoard({ x: 0, y: 9 }, 9)).toBe(false);
  });
});

describe("isPointEmpty", () => {
  const stones: Stone[] = [
    { x: 3, y: 3, color: "black" },
    { x: 4, y: 4, color: "white" },
  ];

  it("returns true for empty points", () => {
    expect(isPointEmpty({ x: 0, y: 0 }, stones)).toBe(true);
    expect(isPointEmpty({ x: 5, y: 5 }, stones)).toBe(true);
  });

  it("returns false for occupied points", () => {
    expect(isPointEmpty({ x: 3, y: 3 }, stones)).toBe(false);
    expect(isPointEmpty({ x: 4, y: 4 }, stones)).toBe(false);
  });
});

describe("getNeighbors", () => {
  it("returns 4 neighbors for center point", () => {
    const neighbors = getNeighbors({ x: 4, y: 4 }, 9);
    expect(neighbors).toEqual([
      { x: 4, y: 3 },
      { x: 4, y: 5 },
      { x: 3, y: 4 },
      { x: 5, y: 4 },
    ]);
  });

  it("returns 2 neighbors for corner point", () => {
    const neighbors = getNeighbors({ x: 0, y: 0 }, 9);
    expect(neighbors).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ]);
  });

  it("returns 3 neighbors for edge point", () => {
    const neighbors = getNeighbors({ x: 0, y: 4 }, 9);
    expect(neighbors).toEqual([
      { x: 0, y: 3 },
      { x: 0, y: 5 },
      { x: 1, y: 4 },
    ]);
  });
});

describe("getGroup", () => {
  it("returns single stone when no adjacent same-color stones", () => {
    const stones: Stone[] = [{ x: 4, y: 4, color: "black" }];
    const group = getGroup({ x: 4, y: 4 }, stones, 9);
    expect(group).toEqual([{ x: 4, y: 4, color: "black" }]);
  });

  it("returns connected group of same-color stones", () => {
    const stones: Stone[] = [
      { x: 3, y: 3, color: "black" },
      { x: 4, y: 3, color: "black" },
      { x: 5, y: 3, color: "white" },
    ];
    const group = getGroup({ x: 3, y: 3 }, stones, 9);
    expect(group.length).toBe(2);
    expect(group.some((s) => s.x === 3 && s.y === 3)).toBe(true);
    expect(group.some((s) => s.x === 4 && s.y === 3)).toBe(true);
  });

  it("does not include opposite-color stones", () => {
    const stones: Stone[] = [
      { x: 3, y: 3, color: "black" },
      { x: 4, y: 3, color: "white" },
    ];
    const group = getGroup({ x: 3, y: 3 }, stones, 9);
    expect(group.length).toBe(1);
    expect(group[0].color).toBe("black");
  });
});

describe("countLiberties", () => {
  it("counts 4 liberties for single stone in center", () => {
    const stones: Stone[] = [{ x: 4, y: 4, color: "black" }];
    const group = getGroup({ x: 4, y: 4 }, stones, 9);
    expect(countLiberties(group, stones, 9)).toBe(4);
  });

  it("counts 3 liberties for single stone on edge", () => {
    const stones: Stone[] = [{ x: 0, y: 4, color: "black" }];
    const group = getGroup({ x: 0, y: 4 }, stones, 9);
    expect(countLiberties(group, stones, 9)).toBe(3);
  });

  it("counts 2 liberties for single stone in corner", () => {
    const stones: Stone[] = [{ x: 0, y: 0, color: "black" }];
    const group = getGroup({ x: 0, y: 0 }, stones, 9);
    expect(countLiberties(group, stones, 9)).toBe(2);
  });

  it("counts shared liberties for connected group", () => {
    const stones: Stone[] = [
      { x: 3, y: 3, color: "black" },
      { x: 4, y: 3, color: "black" },
    ];
    const group = getGroup({ x: 3, y: 3 }, stones, 9);
    expect(countLiberties(group, stones, 9)).toBe(6);
  });

  it("counts 0 liberties when fully surrounded", () => {
    const stones: Stone[] = [
      { x: 4, y: 4, color: "black" },
      { x: 3, y: 4, color: "white" },
      { x: 5, y: 4, color: "white" },
      { x: 4, y: 3, color: "white" },
      { x: 4, y: 5, color: "white" },
    ];
    const group = getGroup({ x: 4, y: 4 }, stones, 9);
    expect(countLiberties(group, stones, 9)).toBe(0);
  });
});
