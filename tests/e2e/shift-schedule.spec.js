import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Shift Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin@hris.test', 'password123');
    await page.goto('/shift-schedule');
    await page.waitForLoadState('domcontentloaded');
  });

  test('shift schedule page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("Shift Schedule")').first()).toBeVisible({ timeout: 10000 });
  });

  test('calendar component visible', async ({ page }) => {
    await expect(page.locator('table, .calendar, [class*="calendar"], [class*="schedule"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('filters visible', async ({ page }) => {
    // ShiftScheduleFilters component
    await expect(page.locator('select, [class*="filter"], input[type="date"]').first()).toBeVisible({ timeout: 10000 });
  });
});
