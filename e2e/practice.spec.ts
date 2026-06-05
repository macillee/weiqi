import { test, expect } from "@playwright/test";

test.describe("Practice page smoke", () => {
  test("renders idle state with start button", async ({ page }) => {
    await page.goto("/practice");

    await expect(page.locator("h1")).toContainText("今日练习");
    await expect(page.getByText("每天练一练，棋力天天涨！")).toBeVisible();

    const startBtn = page.getByText("开始练习");
    await expect(startBtn).toBeVisible();
  });
});
