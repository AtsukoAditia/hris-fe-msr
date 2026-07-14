import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Leave', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin@hris.test', 'password123');
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
  });

  test('leave page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("Cuti")').first()).toBeVisible({ timeout: 10000 });
  });

  test('leave request form visible', async ({ page }) => {
    // "Ajukan Cuti" button
    await expect(page.locator(':text("Ajukan Cuti")').first()).toBeVisible({ timeout: 10000 });
  });

  test('leave balance displayed', async ({ page }) => {
    // BalanceCard with "Sisa Cuti"
    await expect(page.locator(':text("Sisa Cuti")').first()).toBeVisible({ timeout: 10000 });
  });
});
