import { test, expect } from "@playwright/test";

test.describe("Chapter page smoke", () => {
  test("capture chapter loads with levels", async ({ page }) => {
    await page.goto("/levels/capture");

    await expect(page.locator("h1")).toContainText("吃子小岛");
    await expect(page.getByText("学会吃掉对方的棋子")).toBeVisible();
    await expect(page.getByText("第 1 关", { exact: true })).toBeVisible();
    await expect(page.getByText("第 10 关", { exact: true })).toBeVisible();
    await expect(page.getByText("← 返回闯关地图")).toBeVisible();
  });
});
