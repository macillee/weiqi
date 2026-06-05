import { test, expect } from "@playwright/test";

test.describe("Settings page smoke", () => {
  test("renders with audio toggle", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.locator("h1")).toContainText("设置");
    await expect(page.getByText("声音设置")).toBeVisible();

    const audioToggle = page.getByRole("switch");
    await expect(audioToggle).toBeVisible();
    await expect(audioToggle).toBeChecked();
  });
});
