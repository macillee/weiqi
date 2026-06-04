import { test, expect } from "@playwright/test";

test.describe("Home page smoke", () => {
  test("boots and renders the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("欢迎回来，小棋手！");

    await expect(page.getByRole("link", { name: "今日练习" })).toBeVisible();
    await expect(page.getByRole("link", { name: "闯关地图" })).toBeVisible();
    await expect(page.getByRole("link", { name: "错题本" })).toBeVisible();
    await expect(page.getByRole("link", { name: "学习报告" })).toBeVisible();
  });
});
