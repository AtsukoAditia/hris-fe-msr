import { expect, test } from '@playwright/test'
import { installPayrollApiMocks } from './fixtures/payrollApi'
import { expectModalFitsViewport, expectNoDocumentOverflow } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installPayrollApiMocks(page)
})

test('Payroll workspace remains usable on mobile', async ({ page }, testInfo) => {
  await page.goto('/payroll')

  await expect(page.getByRole('heading', { name: 'Payroll' })).toBeVisible()
  await expect(page.getByText('Budi Santoso')).toBeVisible()
  await expect(page.getByText('June 2026')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByRole('button', { name: 'Buka menu navigasi' }).click()
  await expect(page.getByRole('link', { name: /Payroll/ })).toBeVisible()
  await page.getByRole('link', { name: /Payroll/ }).click()

  await page.getByRole('button', { name: 'Detail' }).click()
  await expectModalFitsViewport(page, 'Detail Payroll')
  await expect(page.getByText('Basic Salary')).toBeVisible()
  await expect(page.getByText('Absence Deduction')).toBeVisible()
  await page.getByRole('button', { name: 'Tutup', exact: true }).click()

  await page.getByRole('button', { name: 'Periode', exact: true }).click()
  await expect(page.getByText('June 2026')).toBeVisible()
  await expectNoDocumentOverflow(page)
  await page.getByRole('button', { name: /Tambah Periode/ }).click()
  await expectModalFitsViewport(page, 'Tambah Periode Payroll')
  await page.getByLabel('Nama Periode').fill('July 2026')
  await page.getByRole('button', { name: 'Batal' }).click()

  await page.getByRole('button', { name: 'Profil Gaji', exact: true }).click()
  await expect(page.getByText('Budi Santoso')).toBeVisible()
  await expect(page.getByText(/10\.000\.000/)).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByRole('button', { name: 'Komponen', exact: true }).click()
  await expect(page.getByText('Transport Allowance')).toBeVisible()
  await page.getByRole('button', { name: /Tambah Komponen/ }).click()
  await expectModalFitsViewport(page, 'Tambah Komponen Gaji')
  await page.getByLabel('Kode').fill('MEAL')
  await page.getByRole('button', { name: 'Batal' }).click()

  await expectNoDocumentOverflow(page)
  await testInfo.attach('payroll-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
