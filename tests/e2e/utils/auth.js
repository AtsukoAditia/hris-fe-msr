/**
 * Authentication helpers for E2E tests
 */

export async function login(page, email = 'admin@hris.com', password = 'password') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[name="email"], input[type="email"], input#email', email);
  await page.fill('input[name="password"], input[type="password"], input#password', password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

export async function logout(page) {
  // Click logout button/link
  const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL('**/login');
  }
}
