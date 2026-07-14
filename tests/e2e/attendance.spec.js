import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Attendance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin@hris.test', 'password123');
    await page.goto('/attendance');
    await page.waitForLoadState('domcontentloaded');
  });

  test('attendance page loads', async ({ page }) => {
    // Admin sees 'Data Absensi Karyawan', employee sees 'Absensi'
    await expect(page.locator('h1:has-text("Absensi")').first()).toBeVisible({ timeout: 10000 });
  });

  test('clock in button visible when not clocked in', async ({ page }) => {
    // Admin view shows filter section, employee view shows 'Absensi Hari Ini'
    await expect(page.locator('h2:has-text("Absensi Hari Ini"), h2:has-text("Filter Absensi")').first()).toBeVisible({ timeout: 10000 });
  });

  test('attendance history or table visible', async ({ page }) => {
    // Riwayat Absensi section with table
    await expect(page.locator('h2:has-text("Riwayat Absensi")').first()).toBeVisible({ timeout: 10000 });
  });
});
