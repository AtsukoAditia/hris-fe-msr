import { test, expect } from '@playwright/test';
import { login, logout } from './utils/auth';

test.describe('Login Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check login form elements exist
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'wrong@email.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.toast-error, .error-message, [role="alert"], .text-red')).toBeVisible({ timeout: 10000 });
  });

  test('valid login redirects to dashboard', async ({ page }) => {
    await login(page);

    // Should be on dashboard
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Dashboard, h1:has-text("Dashboard"), h2:has-text("Dashboard")')).toBeVisible();
  });

  test('logout redirects to login page', async ({ page }) => {
    await login(page);
    await logout(page);

    // Should be back on login
    expect(page.url()).toContain('/login');
  });
});
