import { test, expect } from "@playwright/test";

test.describe("The add student functionality", () => {
  test("should appear", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Enter new student's name:")).toBeVisible();
  });

  test("should allow submission", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Enter new student's name:").focus();
    await page.keyboard.type("Hank");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Record created for student 'Hank' with ID ")).toHaveCount(1);
  });
});
