import { expect, test } from '@playwright/test'
import { installOrganizationApiMocks } from './fixtures/organizationApi'
import { expectModalFitsViewport, expectNoDocumentOverflow, selectContainingOption } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installOrganizationApiMocks(page)
})

test('Employee Manager create form and filters work on mobile', async ({ page }, testInfo) => {
  await page.goto('/employee')
  await expect(page.getByText('managed.employee@hris.test')).toBeVisible()

  await page.getByRole('button', { name: 'Tambah Pegawai' }).click()
  await expectModalFitsViewport(page, 'Tambah Pegawai')
  await page.locator('input[name="name"]').fill('Mobile Employee')
  await page.locator('input[name="email"]').fill('mobile.employee@hris.test')
  await page.locator('input[name="nik"]').fill('3171000000000120')
  await page.locator('select[name="department_id"]').selectOption('1')
  await page.locator('select[name="position_id"]').selectOption('11')
  await page.locator('select[name="branch_id"]').selectOption('1')
  await page.locator('select[name="manager_id"]').selectOption('20')
  await page.locator('input[name="join_date"]').fill('2026-06-17')

  const createRequestPromise = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/employees'))
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  const createRequest = await createRequestPromise
  expect(createRequest.postDataJSON()).toMatchObject({
    department_id: 1,
    position_id: 11,
    branch_id: 1,
    manager_id: 20,
  })
  await expect(page.getByText('Data karyawan berhasil ditambahkan.')).toBeVisible()

  const managerFilter = selectContainingOption(page, 'Semua Atasan')
  const managerRequestPromise = page.waitForRequest((request) => new URL(request.url()).searchParams.get('manager_id') === '20')
  await managerFilter.selectOption('20')
  await managerRequestPromise
  await expect(page.getByText('managed.employee@hris.test')).toBeVisible()

  const unassignedRequestPromise = page.waitForRequest((request) => new URL(request.url()).searchParams.get('manager_id') === 'none')
  await managerFilter.selectOption('none')
  await unassignedRequestPromise
  await expect(page.getByText('engineering.lead@hris.test')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await testInfo.attach('employee-manager-form-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
