import { expect, test } from '@playwright/test'
import { installOrganizationApiMocks } from './fixtures/organizationApi'
import { expectModalFitsViewport, expectNoDocumentOverflow, expectScrollableTable } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installOrganizationApiMocks(page)
})

test('Organization Master tabs and forms remain usable on mobile', async ({ page }, testInfo) => {
  await page.goto('/master-data')

  await expect(page.getByRole('heading', { name: 'Master Organisasi' })).toBeVisible()
  await expect(page.getByText('Information Technology')).toBeVisible()
  await expectNoDocumentOverflow(page)
  await expectScrollableTable(page)

  await page.getByRole('button', { name: 'Buka menu navigasi' }).click()
  await expect(page.getByRole('link', { name: /Karyawan/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Departemen/ })).toBeVisible()
  await page.getByRole('link', { name: /Departemen/ }).click()

  await page.getByRole('button', { name: 'Tambah Departemen' }).click()
  await expectModalFitsViewport(page, 'Tambah Departemen')
  await page.getByLabel('Kode').fill('OPS')
  await page.getByLabel('Nama Departemen').fill('Operations')
  await page.getByRole('button', { name: 'Batal' }).click()

  await page.getByRole('button', { name: 'Jabatan', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Master Jabatan' })).toBeVisible()
  await expect(page.getByText('Software Engineer')).toBeVisible()
  await expectNoDocumentOverflow(page)
  await expectScrollableTable(page)

  await page.getByRole('button', { name: 'Tambah Jabatan' }).click()
  await expectModalFitsViewport(page, 'Tambah Jabatan')
  await page.locator('select[name="department_id"]').selectOption('1')
  await page.locator('input[name="code"]').fill('QA-ENGINEER')
  await page.locator('input[name="name"]').fill('QA Engineer')
  await page.getByRole('button', { name: 'Batal' }).click()

  await page.getByRole('button', { name: 'Cabang / Lokasi', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Master Cabang / Lokasi Kerja' })).toBeVisible()
  await expect(page.getByText('Head Office Jakarta')).toBeVisible()
  await expectNoDocumentOverflow(page)
  await expectScrollableTable(page)

  await page.getByRole('button', { name: 'Tambah Cabang' }).click()
  await expectModalFitsViewport(page, 'Tambah Cabang')
  await page.getByLabel('Kode Cabang').fill('BDG')
  await page.getByLabel('Nama Cabang').fill('Bandung Branch')
  await page.getByLabel('Latitude').fill('-6.9175')
  await page.getByLabel('Longitude').fill('107.6191')
  await page.getByLabel('Radius Absensi (meter)').fill('100')
  await page.getByRole('button', { name: 'Batal' }).click()

  await expectNoDocumentOverflow(page)
  await testInfo.attach('organization-master-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
