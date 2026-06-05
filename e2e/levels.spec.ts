import { test, expect } from "@playwright/test";

test.describe("Levels page smoke", () => {
  test("renders all 6 chapter entries", async ({ page }) => {
    await page.goto("/levels");

    await expect(page.locator("h1")).toContainText("闯关地图");

    const chapterTitles = ["吃子小岛", "逃跑森林", "连接桥", "布局城堡", "死活山洞", "官子山谷"];
    for (const title of chapterTitles) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }
  });
});
