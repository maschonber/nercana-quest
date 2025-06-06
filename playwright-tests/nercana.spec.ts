import { test, expect } from '@playwright/test';

// Playwright dummy test to ensure Playwright is set up correctly - will be expanded later

test.describe('Nercana Quest Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  test('station resources are displayed in header', async ({ page }) => {
    // Check if resource display component exists in header
    const resourceDisplay = page.locator('.resource-display');
    await expect(resourceDisplay).toBeVisible();

    // Verify goo resource is displayed
    const gooResource = page.locator('.resource-item:has-text("🟢")');
    await expect(gooResource).toBeVisible();
    await expect(gooResource).toContainText('0'); // Initial value should be 0

    // Verify metal resource is displayed
    const metalResource = page.locator('.resource-item:has-text("⚙️")');
    await expect(metalResource).toBeVisible();
    await expect(metalResource).toContainText('0'); // Initial value should be 0
  });
});
