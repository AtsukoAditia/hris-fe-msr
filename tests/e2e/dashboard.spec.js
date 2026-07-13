import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard"), [data-testid="dashboard-page"]')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard has content', async ({ page }) => {
    const hasContent = await page.locator('main, .container, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
