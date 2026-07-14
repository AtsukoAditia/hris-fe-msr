import { test, expect } from '@playwright/test';
import { login, logout } from './utils/auth';

test.describe('Login Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Check login form elements exist (react-hook-form register)
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // App shows error in a red alert div
    await expect(page.locator('.bg-red-50, [role="alert"], .text-red-600').first()).toBeVisible({ timeout: 10000 });
  });

  test('valid login redirects to dashboard', async ({ page }) => {
    await login(page);

    expect(page.url()).toContain('/dashboard');
  });

  test('logout redirects to login page', async ({ page }) => {
    await login(page);
    await logout(page);

    expect(page.url()).toContain('/login');
  });
});
