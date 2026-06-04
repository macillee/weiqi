import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import HintPanel from "@/components/problem/HintPanel";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) {
    act(() => {
      root!.unmount();
    });
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
});

function mount(props: {
  hints: string[];
  visibleCount: number;
  onShowHint: () => void;
  allShown: boolean;
}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container!);
    root!.render(<HintPanel {...props} />);
  });
  return container!;
}

describe("HintPanel", () => {
  it("renders the empty-state copy when no hint is revealed", () => {
    const c = mount({
      hints: ["第一条", "第二条"],
      visibleCount: 0,
      onShowHint: () => {},
      allShown: false,
    });
    expect(c.textContent).toContain("还没有提示");
    expect(c.querySelectorAll('[data-testid^="hint-card-"]').length).toBe(0);
  });

  it("renders a different copy when the problem has no hints at all", () => {
    const c = mount({
      hints: [],
      visibleCount: 0,
      onShowHint: () => {},
      allShown: false,
    });
    expect(c.textContent).toContain("这道题没有提示");
  });

  it("renders only the first N hint cards based on visibleCount", () => {
    const c = mount({
      hints: ["第一条", "第二条", "第三条"],
      visibleCount: 2,
      onShowHint: () => {},
      allShown: false,
    });
    const cards = c.querySelectorAll('[data-testid^="hint-card-"]');
    expect(cards.length).toBe(2);
    expect(cards[0].getAttribute("data-hint-index")).toBe("0");
    expect(cards[1].getAttribute("data-hint-index")).toBe("1");
    expect(c.textContent).toContain("第一条");
    expect(c.textContent).toContain("第二条");
    expect(c.textContent).not.toContain("第三条");
  });

  it("hides the show-hint button when all hints are revealed", () => {
    const c = mount({
      hints: ["第一条"],
      visibleCount: 1,
      onShowHint: () => {},
      allShown: true,
    });
    const btn = c.querySelector("button");
    expect(btn).toBeNull();
  });

  it("hides the show-hint button when there are no hints at all", () => {
    const c = mount({
      hints: [],
      visibleCount: 0,
      onShowHint: () => {},
      allShown: true,
    });
    const btn = c.querySelector("button");
    expect(btn).toBeNull();
  });

  it("shows the show-hint button and calls onShowHint when clicked", () => {
    const onShowHint = vi.fn();
    const c = mount({
      hints: ["第一条", "第二条"],
      visibleCount: 1,
      onShowHint,
      allShown: false,
    });
    const btn = Array.from(c.querySelectorAll("button")).find(
      (b) => b.textContent === "显示提示",
    );
    expect(btn).toBeDefined();
    act(() => {
      btn!.click();
    });
    expect(onShowHint).toHaveBeenCalledTimes(1);
  });

  it("does not reveal hints beyond visibleCount when the button is clicked", () => {
    const c = mount({
      hints: ["第一条", "第二条", "第三条"],
      visibleCount: 1,
      onShowHint: () => {},
      allShown: false,
    });
    const cards = c.querySelectorAll('[data-testid^="hint-card-"]');
    expect(cards.length).toBe(1);
    expect(c.textContent).not.toContain("第二条");
  });

  it("numbers revealed hint cards starting from 1", () => {
    const c = mount({
      hints: ["第一条", "第二条", "第三条"],
      visibleCount: 3,
      onShowHint: () => {},
      allShown: true,
    });
    expect(c.textContent).toContain("1");
    expect(c.textContent).toContain("2");
    expect(c.textContent).toContain("3");
  });

  it("shows the visible/total counter in the header", () => {
    const c = mount({
      hints: ["第一条", "第二条", "第三条"],
      visibleCount: 2,
      onShowHint: () => {},
      allShown: false,
    });
    expect(c.textContent).toContain("(2/3)");
  });
});
