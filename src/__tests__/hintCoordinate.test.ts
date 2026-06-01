import { describe, it, expect } from "vitest";
import {
  extractHintCoordinate,
  extractHintCoordinates,
  getRevealedHintCoordinates,
} from "@/lib/hintCoordinate";

describe("extractHintCoordinate", () => {
  it("parses a single (x, y) coordinate", () => {
    expect(extractHintCoordinate("第一步：黑棋下在中间 (3,4)", 9)).toEqual({
      x: 3,
      y: 4,
    });
  });

  it("parses (x,y) without surrounding whitespace", () => {
    expect(extractHintCoordinate("下在(0,0) 就能守住自己的地盘", 9)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("parses coordinates with extra spaces", () => {
    expect(extractHintCoordinate("下在 ( 6 , 6 ) 附近", 9)).toEqual({
      x: 6,
      y: 6,
    });
  });

  it("returns the first in-range coordinate when multiple are present", () => {
    expect(
      extractHintCoordinate("从 (0,0) 到 (4,4) 再到 (8,8)", 9),
    ).toEqual({ x: 0, y: 0 });
  });

  it("skips out-of-range coordinates and returns the next in-range one", () => {
    expect(extractHintCoordinate("试 (9,9) 然后下在 (2,2)", 9)).toEqual({
      x: 2,
      y: 2,
    });
  });

  it("returns null when no coordinate pattern is present", () => {
    expect(extractHintCoordinate("白棋上面、左边、下面都有黑棋", 9)).toBeNull();
  });

  it("returns null when the only coordinate is out of range", () => {
    expect(extractHintCoordinate("下在 (9,9) 才能赢", 9)).toBeNull();
  });

  it("returns null for negative coordinates", () => {
    expect(extractHintCoordinate("下在 (-1, 3) 就行", 9)).toBeNull();
  });

  it("returns null for malformed patterns", () => {
    expect(extractHintCoordinate("下在 3,4 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (3 4) 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (3,) 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (,4) 就行", 9)).toBeNull();
  });

  it("returns null for empty or non-string input", () => {
    expect(extractHintCoordinate("", 9)).toBeNull();
    expect(extractHintCoordinate(null, 9)).toBeNull();
    expect(extractHintCoordinate(undefined, 9)).toBeNull();
  });

  it("returns null when boardSize is invalid", () => {
    expect(extractHintCoordinate("下在 (3,4)", 0)).toBeNull();
    expect(extractHintCoordinate("下在 (3,4)", -1)).toBeNull();
    expect(extractHintCoordinate("下在 (3,4)", 1.5)).toBeNull();
  });

  it("respects the provided boardSize boundary", () => {
    expect(extractHintCoordinate("下在 (3,3)", 4)).toEqual({ x: 3, y: 3 });
    expect(extractHintCoordinate("下在 (4,4)", 4)).toBeNull();
  });
});

describe("extractHintCoordinates", () => {
  it("returns coordinates from each hint that contains one", () => {
    const hints = [
      "第一步：黑棋下在中间 (3,4)",
      "白棋被包围了",
      "下在 (2,2) 就能守住自己的地盘",
    ];
    expect(extractHintCoordinates(hints, 9)).toEqual([
      { x: 3, y: 4 },
      { x: 2, y: 2 },
    ]);
  });

  it("returns an empty array when no hints contain coordinates", () => {
    expect(
      extractHintCoordinates(["上面", "左边", "中间"], 9),
    ).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(extractHintCoordinates([], 9)).toEqual([]);
  });
});

describe("getRevealedHintCoordinates (regression: do not leak future hints)", () => {
  it("returns no coordinates when visibleCount is 0", () => {
    const hints = ["第一条 (1,1)", "第二条 (2,2)"];
    expect(getRevealedHintCoordinates(hints, 0, 9)).toEqual([]);
  });

  it("only uses the first visible hint when visibleCount is 1", () => {
    const hints = ["第一条 (1,1)", "第二条 (2,2)"];
    expect(getRevealedHintCoordinates(hints, 1, 9)).toEqual([
      { x: 1, y: 1 },
    ]);
    expect(
      getRevealedHintCoordinates(hints, 1, 9).some(
        (p) => p.x === 2 && p.y === 2,
      ),
    ).toBe(false);
  });

  it("reveals additional coordinates only when visibleCount grows", () => {
    const hints = ["第一条 (1,1)", "第二条 (2,2)", "第三条 (3,3)"];
    expect(getRevealedHintCoordinates(hints, 1, 9)).toEqual([
      { x: 1, y: 1 },
    ]);
    expect(getRevealedHintCoordinates(hints, 2, 9)).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    expect(getRevealedHintCoordinates(hints, 3, 9)).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);
  });

  it("clamps visibleCount to hints.length", () => {
    const hints = ["第一条 (1,1)"];
    expect(getRevealedHintCoordinates(hints, 99, 9)).toEqual([
      { x: 1, y: 1 },
    ]);
  });

  it("treats negative visibleCount as 0", () => {
    const hints = ["第一条 (1,1)"];
    expect(getRevealedHintCoordinates(hints, -3, 9)).toEqual([]);
  });

  it("ignores non-coord hints entirely", () => {
    const hints = ["上面", "下在 (2,2) 就行", "左边"];
    expect(getRevealedHintCoordinates(hints, 1, 9)).toEqual([]);
    expect(getRevealedHintCoordinates(hints, 2, 9)).toEqual([
      { x: 2, y: 2 },
    ]);
  });
});
