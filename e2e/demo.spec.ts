import { test, expect } from "@playwright/test";

test.describe("Demo page smoke", () => {
  test("loads a problem with board and controls", async ({ page }) => {
    await page.goto("/demo");

    await expect(page.locator("text=返回")).toBeVisible();
    // v0.20.0d: Pack B pilot expanded the library from 101 to 110.
    await expect(page.locator("text=第 1 / 110 题")).toBeVisible();

    await expect(page.getByText("CAP-001")).toBeVisible();
    await expect(page.getByRole("img", { name: "9x9 Go board" })).toBeVisible();
    await expect(page.getByText("显示提示")).toBeVisible();
  });
});
