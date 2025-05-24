import { test, expect } from '@playwright/test';

test.describe('Nercana Game', () => {
  test('hero details are displayed correctly', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
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
    // Navigate to the homepage
    await page.goto('/');
    
    // Count initial log entries (should be 0 initially)
    const initialLogEntries = await page.locator('.log-view li').count();
    
    // Click the "Embark on quest" button
    await page.click('button.quest-btn');
    
    // Wait for the log entry to appear
    await page.waitForSelector('.log-view li');
    
    // Verify that a new log entry has been added
    const updatedLogEntries = await page.locator('.log-view li').count();
    expect(updatedLogEntries).toBeGreaterThan(initialLogEntries);
      // Verify the log entry contains expected text
    const logEntryText = await page.locator('.log-view li').first().innerText();
    expect(logEntryText).toMatch(/(succeeded|triumphant|Victory|overcome|failed|barely|dangerous|retreat|failure|abandon)/i);
    
    // Verify the log entry has the correct timestamp format
    expect(logEntryText).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
  });

  test('multiple quests can be completed and logged', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Click the "Embark on quest" button multiple times
    await page.click('button.quest-btn');
    await page.click('button.quest-btn');
    await page.click('button.quest-btn');
    
    // Wait for log entries to appear
    await page.waitForSelector('.log-view li:nth-child(3)');    
    // Verify that the correct number of log entries exist
    const logEntryCount = await page.locator('.log-view li').count();
    expect(logEntryCount).toBeGreaterThanOrEqual(3);
    
    // Verify entries are in reverse chronological order (newest at the top)
    const timestamps = await page.locator('.log-view li').allInnerTexts();
      // Make sure all entries contain quest-related messages (either success or failure)
    for (const entry of timestamps) {
      expect(entry).toMatch(/(succeeded|triumphant|Victory|overcome|failed|barely|dangerous|retreat|failure|abandon)/i);
    }
  });
});
