import { test, expect } from "@playwright/test";

test.describe("Demo page smoke", () => {
  test("loads a problem with board and controls", async ({ page }) => {
    await page.goto("/demo");

    await expect(page.locator("text=返回")).toBeVisible();
    await expect(page.locator("text=第 1 / 77 题")).toBeVisible();

    await expect(page.getByText("CAP-001")).toBeVisible();
    await expect(page.getByText("ESC-001")).toBeVisible();

    await page.evaluate(() => localStorage.clear());
  });
});
