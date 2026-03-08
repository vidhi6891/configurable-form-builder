import { expect, test } from "@playwright/test";

test.describe("ConfigurableFormBuilder", () => {
  test("builds, validates, exports, and persists form state", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: "Add text field" }).first().click();
    await page.getByPlaceholder("Field label").first().fill("Name");
    await page.getByRole("checkbox", { name: "Required" }).first().check();

    await expect(page.getByText("This field is required.")).toBeVisible();

    await page.getByPlaceholder("Enter text").first().fill("Alice");
    await expect(page.getByText("Preview is valid.")).toBeVisible();

    await page.getByRole("button", { name: "Export form configuration as JSON" }).click();
    await expect(page.getByPlaceholder("Click export to generate JSON...")).toContainText('"label": "Name"');

    await page.reload();
    await expect(page.locator('input[value="Name"]').first()).toBeVisible();
  });
});
