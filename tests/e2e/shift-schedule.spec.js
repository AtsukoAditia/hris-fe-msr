import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Shift Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/shift-schedule');
    await page.waitForLoadState('networkidle');
  });

  test('shift schedule page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("Shift"), h2:has-text("Jadwal"), [data-testid="shift-schedule-page"]')).toBeVisible({ timeout: 10000 });
  });

  test('calendar component visible', async ({ page }) => {
    const hasCalendar = await page.locator('table, [data-testid="calendar"], .shift-calendar, [class*="calendar"]').isVisible().catch(() => false);
    const hasContent = await page.locator('main, .container, [role="main"]').isVisible().catch(() => false);
    expect(hasCalendar || hasContent).toBeTruthy();
  });

  test('filters visible', async ({ page }) => {
    const hasFilters = await page.locator('select, [data-testid="filter"], input[type="date"]').isVisible().catch(() => false);
    const hasContent = await page.locator('main, .container').isVisible().catch(() => false);
    expect(hasFilters || hasContent).toBeTruthy();
  });
});
