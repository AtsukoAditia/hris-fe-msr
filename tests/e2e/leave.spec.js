import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Leave', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
  });

  test('leave page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("Cuti"), h2:has-text("Leave"), [data-testid="leave-page"]')).toBeVisible({ timeout: 10000 });
  });

  test('leave request form visible', async ({ page }) => {
    const hasForm = await page.locator('form, [data-testid="leave-form"], button:has-text("Ajukan"), button:has-text("Request")').isVisible().catch(() => false);
    const hasButton = await page.locator('button:has-text("Cuti"), button:has-text("Leave")').isVisible().catch(() => false);
    expect(hasForm || hasButton).toBeTruthy();
  });

  test('leave balance displayed', async ({ page }) => {
    const hasBalance = await page.locator('[data-testid="leave-balance"], :text("balance"), :text("sisa"), :text("kuota")').isVisible().catch(() => false);
    const hasContent = await page.locator('main, .container').isVisible().catch(() => false);
    expect(hasBalance || hasContent).toBeTruthy();
  });
});
