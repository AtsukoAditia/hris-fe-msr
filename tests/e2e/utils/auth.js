/**
 * Authentication helpers for E2E tests
 */

export async function login(page, email = 'admin@hris.test', password = 'password123') {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click login button (text: "Masuk")
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 30000 });
}

export async function logout(page) {
  // Sidebar is always visible on desktop (lg:translate-x-0)
  const logoutBtn = page.locator('button:has-text("Logout")').first();
  await logoutBtn.waitFor({ state: 'visible', timeout: 10000 });
  await logoutBtn.click();
  // ProtectedRoute detects !isAuthenticated and renders <Navigate to="/login" />
  await page.waitForURL('**/login', { timeout: 10000 });
}
