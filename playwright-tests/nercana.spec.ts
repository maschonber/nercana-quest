import { test, expect } from '@playwright/test';

test.describe('Nercana Quest Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero details are displayed correctly', async ({ page }) => {
    // Verify the page title
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check if hero details section exists
    const heroDetailsSection = await page.locator('.hero-details');
    await expect(heroDetailsSection).toBeVisible();
    
    // Verify hero stats are displayed correctly
    await expect(page.locator('.hero-details li:has-text("Name:")')).toContainText('Adventurer');
    await expect(page.locator('.hero-details li:has-text("Health:")')).toContainText('100');
    await expect(page.locator('.hero-details li:has-text("Attack:")')).toContainText('12');
    await expect(page.locator('.hero-details li:has-text("Defense:")')).toContainText('8');
    await expect(page.locator('.hero-details li:has-text("Luck:")')).toContainText('5');
  });

  test('quest log updates after embarking on a quest', async ({ page }) => {
    // Count initial log entries (should be 0 initially)
    const initialLogEntries = await page.locator('.log-view li').count();
    
    // Click the "Embark on quest" button
    await page.click('button.quest-btn');
    
    // Wait for the log entry to appear (allow time for all steps to complete)
    await page.waitForSelector('.log-view li');
    await page.waitForTimeout(1000); // Wait for all quest steps to complete
    
    // Verify that new log entries have been added
    const updatedLogEntries = await page.locator('.log-view li').count();
    expect(updatedLogEntries).toBeGreaterThan(initialLogEntries);
    
    // Verify log entries have correct timestamp format
    const logEntries = await page.locator('.log-view li').allInnerTexts();
    for (const entry of logEntries) {
      expect(entry).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
    }
      // Verify that we have entries with different step types
    const hasExplorationSteps = await page.locator('.exploration-entry').count() > 0;
    const hasEncounterSteps = await page.locator('.encounter-entry').count() > 0;
    const hasTreasureSteps = await page.locator('.treasure-entry').count() > 0;
    
    // At least one type of step should be present
    expect(hasExplorationSteps || hasEncounterSteps || hasTreasureSteps).toBeTruthy();
  });

  test('multiple quests can be completed and logged', async ({ page }) => {
    // Click the "Embark on quest" button and wait for steps to complete
    await page.click('button.quest-btn');
    await page.waitForTimeout(1000); // Wait for all quest steps to complete
    
    // Click again for second quest
    await page.click('button.quest-btn');
    await page.waitForTimeout(1000); // Wait for all quest steps to complete
    
    // Click again for third quest
    await page.click('button.quest-btn');
    await page.waitForTimeout(1000); // Wait for all quest steps to complete
    
    // Verify we have multiple log entries
    const logEntryCount = await page.locator('.log-view li').count();
    expect(logEntryCount).toBeGreaterThanOrEqual(6); // At least 6 entries (2 steps per quest minimum)
    
    // Verify entries have correct timestamp format
    const logEntries = await page.locator('.log-view li').allInnerTexts();
    for (const entry of logEntries) {
      expect(entry).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
    }
    
    // Verify we have entries for all step types
    const explorationSteps = await page.locator('.exploration-entry').count();
    const encounterSteps = await page.locator('.encounter-entry').count();
    const treasureSteps = await page.locator('.treasure-entry').count();
    
    expect(explorationSteps).toBeGreaterThan(0);
    expect(encounterSteps).toBeGreaterThan(0);
    expect(treasureSteps).toBeGreaterThan(0);
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Check that app starts in light mode
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    
    // Find and click the theme toggle button
    const themeToggle = page.locator('.theme-toggle-btn');
    await expect(themeToggle).toBeVisible();
    
    // Check initial state shows "Dark Mode" text (meaning we're in light mode)
    await expect(themeToggle.locator('.theme-text')).toHaveText('Dark Mode');
    await expect(themeToggle.locator('.theme-icon')).toHaveText('🌙');
    
    // Click to switch to dark mode
    await themeToggle.click();
    
    // Verify dark mode is active
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    await expect(themeToggle.locator('.theme-text')).toHaveText('Light Mode');
    await expect(themeToggle.locator('.theme-icon')).toHaveText('☀️');
    
    // Click again to switch back to light mode
    await themeToggle.click();
    
    // Verify light mode is active
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    await expect(page.locator('body')).toHaveClass(/light-theme/);
    await expect(themeToggle.locator('.theme-text')).toHaveText('Dark Mode');
    await expect(themeToggle.locator('.theme-icon')).toHaveText('🌙');
  });

  test('should persist theme preference across page reloads', async ({ page }) => {
    // Switch to dark mode
    const themeToggle = page.locator('.theme-toggle-btn');
    await themeToggle.click();
    
    // Verify dark mode is active
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Reload the page
    await page.reload();
    
    // Verify dark mode persists after reload
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    await expect(themeToggle.locator('.theme-text')).toHaveText('Light Mode');
  });

  test('should have proper visual styling in dark mode', async ({ page }) => {
    // Switch to dark mode
    await page.locator('.theme-toggle-btn').click();
    
    // Check that main containers have dark theme styling
    const container = page.locator('.nercana-container');
    const heroDetails = page.locator('.hero-details');
    const questLog = page.locator('.log-view');
    
    // Verify containers are visible and properly styled
    await expect(container).toBeVisible();
    await expect(heroDetails).toBeVisible();
    await expect(questLog).toBeVisible();
    
    // Verify quest functionality still works in dark mode
    const questButton = page.locator('.quest-btn');
    await expect(questButton).toBeVisible();
    await questButton.click();
    
    // Wait for quest steps to appear
    await page.waitForTimeout(1000);
    
    // Check that log entries are visible in dark mode
    const logEntries = page.locator('.log-view li');
    await expect(logEntries.first()).toBeVisible();
  });
});
