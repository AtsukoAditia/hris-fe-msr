import { expect, test } from '@playwright/test'
import { installOrganizationApiMocks } from './fixtures/organizationApi'
import { expectModalFitsViewport, expectNoDocumentOverflow, expectScrollableTable } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installOrganizationApiMocks(page)
})

test('Employee Manager table, edit, and detail work on mobile', async ({ page }, testInfo) => {
  await page.goto('/employee')

  await expect(page.getByRole('heading', { name: 'Management Pegawai' })).toBeVisible()
  await expect(page.getByText('managed.employee@hris.test')).toBeVisible()
  await expect(page.getByText('Engineering Lead').first()).toBeVisible()
  await expectNoDocumentOverflow(page)
  await expectScrollableTable(page)

  const managedRow = page.getByRole('row').filter({ hasText: 'Managed Employee' })
  await managedRow.getByTitle('Edit').click()
  await expectModalFitsViewport(page, 'Edit Pegawai')

  const managerField = page.locator('select[name="manager_id"]')
  await expect(managerField).toHaveValue('20')
  await expect(managerField.locator('option[value="99"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Batal' }).click()

  await managedRow.getByTitle('Detail').click()
  await expectModalFitsViewport(page, 'Detail Pegawai')
  const detailPanel = page.getByRole('heading', { name: 'Detail Pegawai' }).locator('xpath=ancestor::*[contains(@class, "bg-white")][1]')
  await expect(detailPanel.getByText(/Engineering Lead/)).toBeVisible()
  await expect(detailPanel.getByText(/Engineering Manager/)).toBeVisible()

  await testInfo.attach('employee-manager-detail-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
