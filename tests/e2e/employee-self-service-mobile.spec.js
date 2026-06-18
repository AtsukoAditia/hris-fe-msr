import { expect, test } from '@playwright/test'
import { installEmployeeSelfServiceApiMocks } from './fixtures/employeeSelfServiceApi'
import { expectModalFitsViewport, expectNoDocumentOverflow } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installEmployeeSelfServiceApiMocks(page)
})

test('Employee request and reviewer flow remain usable on mobile', async ({ page }, testInfo) => {
  await page.goto('/profile/changes')
  await expect(page.getByRole('heading', { name: 'Perubahan Profil' })).toBeVisible()
  await expect(page.getByText('Permintaan #7')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByLabel('Kewarganegaraan').fill('Malaysia')
  await page.getByLabel('Alasan Perubahan').fill('Dokumen identitas terbaru sudah terbit.')
  await page.getByRole('button', { name: 'Ajukan Perubahan' }).click()
  await expect(page.getByText('Permintaan perubahan profil berhasil diajukan.')).toBeVisible()

  await page.getByRole('button', { name: /Permintaan #7/ }).click()
  await expectModalFitsViewport(page, 'Detail Permintaan #7')
  await page.getByRole('button', { name: 'Tutup' }).click()

  await page.goto('/profile-change-reviews')
  await expect(page.getByRole('heading', { name: 'Review Perubahan Profil' })).toBeVisible()
  await page.getByRole('button', { name: /Mobile HR/ }).click()
  await expectModalFitsViewport(page, 'Detail Permintaan #7')
  await page.getByLabel('Catatan Review').fill('Dokumen sudah diverifikasi.')
  await page.getByRole('button', { name: 'Setujui' }).click()
  await expect(page.getByText('Permintaan berhasil disetujui.')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await testInfo.attach('employee-self-service-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
