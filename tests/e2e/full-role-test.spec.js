import { test, expect } from '@playwright/test';

const SCREENSHOTS = 'test-results/full-role-test';

// Role credentials
const roles = {
  admin: { email: 'admin@hris.test', password: 'password123', name: 'Admin HRIS', dashboard: '/dashboard' },
  hr: { email: 'hr@hris.test', password: 'password123', name: 'HR Staff', dashboard: '/dashboard' },
  manager: { email: 'manager@hris.test', password: 'password123', name: 'Manager Operasional', dashboard: '/dashboard' },
  employee: { email: 'employee@hris.test', password: 'password123', name: 'Employee Demo', dashboard: '/dashboard' },
};

async function login(page, email, password) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

async function shot(page, name) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true });
}

// ═══════════════════════════════════════════════════
// LOGIN / LOGOUT
// ═══════════════════════════════════════════════════
test.describe('Login/Logout All Roles', () => {
  for (const [role, creds] of Object.entries(roles)) {
    test(`${role} login and logout`, async ({ page }) => {
      // Login
      await login(page, creds.email, creds.password);
      await shot(page, `login-${role}-dashboard`);
      expect(page.url()).toContain('/dashboard');

      // Verify user name visible
      await expect(page.locator(`text=${creds.name}`).first()).toBeVisible({ timeout: 10000 });

      // Logout
      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Keluar"), a:has-text("Logout")').first();
      if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForURL('**/login', { timeout: 10000 });
        await shot(page, `logout-${role}`);
      }
    });
  }
});

// ═══════════════════════════════════════════════════
// INVALID LOGIN
// ═══════════════════════════════════════════════════
test.describe('Error Cases', () => {
  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-50, [role="alert"], .text-red-600').first()).toBeVisible({ timeout: 10000 });
    await shot(page, 'error-invalid-login');
  });

  test('unauthenticated redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    await shot(page, 'error-redirect-login');
  });
});

// ═══════════════════════════════════════════════════
// ADMIN ROLE - FULL FLOW
// ═══════════════════════════════════════════════════
test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin@hris.test', 'password123');
  });

  test('dashboard loads with stats', async ({ page }) => {
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    await shot(page, 'admin-dashboard');
  });

  test('attendance page', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-attendance');
    await expect(page.locator('body')).toBeVisible();
  });

  test('leave page', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-leave');
  });

  test('shift schedule page', async ({ page }) => {
    await page.goto('/shift-schedule');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-shift-schedule');
  });

  test('employee list', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-employees');
  });

  test('documents page', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-documents');
  });

  test('payroll page', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-payroll');
  });

  test('master data page', async ({ page }) => {
    await page.goto('/master-data');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-master-data');
  });

  test('profile page', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-profile');
  });
});

// ═══════════════════════════════════════════════════
// HR ROLE - FULL FLOW
// ═══════════════════════════════════════════════════
test.describe('HR Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'hr@hris.test', 'password123');
  });

  test('dashboard', async ({ page }) => {
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    await shot(page, 'hr-dashboard');
  });

  test('attendance', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    await shot(page, 'hr-attendance');
  });

  test('leave management', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    await shot(page, 'hr-leave');
  });

  test('shift schedule', async ({ page }) => {
    await page.goto('/shift-schedule');
    await page.waitForLoadState('networkidle');
    await shot(page, 'hr-shift-schedule');
  });

  test('employees', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    await shot(page, 'hr-employees');
  });

  test('payroll', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
    await shot(page, 'hr-payroll');
  });
});

// ═══════════════════════════════════════════════════
// MANAGER ROLE - FULL FLOW
// ═══════════════════════════════════════════════════
test.describe('Manager Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'manager@hris.test', 'password123');
  });

  test('dashboard', async ({ page }) => {
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    await shot(page, 'manager-dashboard');
  });

  test('attendance', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    await shot(page, 'manager-attendance');
  });

  test('leave approval', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    await shot(page, 'manager-leave');
  });

  test('shift schedule', async ({ page }) => {
    await page.goto('/shift-schedule');
    await page.waitForLoadState('networkidle');
    await shot(page, 'manager-shift-schedule');
  });

  test('team documents', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await shot(page, 'manager-documents');
  });
});

// ═══════════════════════════════════════════════════
// EMPLOYEE ROLE - FULL FLOW
// ═══════════════════════════════════════════════════
test.describe('Employee Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'employee@hris.test', 'password123');
  });

  test('dashboard', async ({ page }) => {
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    await shot(page, 'employee-dashboard');
  });

  test('clock in/out', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    await shot(page, 'employee-attendance');
  });

  test('leave request', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    await shot(page, 'employee-leave');
  });

  test('my documents', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await shot(page, 'employee-documents');
  });

  test('my profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await shot(page, 'employee-profile');
  });

  test('my payslip', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
    await shot(page, 'employee-payroll');
  });
});

// ═══════════════════════════════════════════════════
// MOBILE RESPONSIVE
// ═══════════════════════════════════════════════════
test.describe('Mobile Responsive (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('admin mobile dashboard', async ({ page }) => {
    await login(page, 'admin@hris.test', 'password123');
    await shot(page, 'mobile-admin-dashboard');
  });

  test('employee mobile attendance', async ({ page }) => {
    await login(page, 'employee@hris.test', 'password123');
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    await shot(page, 'mobile-employee-attendance');
  });

  test('hr mobile leave', async ({ page }) => {
    await login(page, 'hr@hris.test', 'password123');
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
    await shot(page, 'mobile-hr-leave');
  });

  test('login mobile', async ({ page }) => {
    await page.goto('/login');
    await shot(page, 'mobile-login');
  });
});
