import { expect, test } from '@playwright/test'
import { installProfileApiMocks } from './fixtures/profileApi'
import { expectModalFitsViewport, expectNoDocumentOverflow } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => {
  await installProfileApiMocks(page)
})

test('self profile and emergency contact form work on mobile', async ({ page }, testInfo) => {
  await page.goto('/profile')

  await expect(page.getByRole('heading', { name: 'Profil Saya' })).toBeVisible()
  await expect(page.getByText('Mobile Profile Employee')).toBeVisible()
  await expect(page.getByText('83%')).toBeVisible()
  await expect(page.getByText('Mobile Parent')).toBeVisible()
  await expectNoDocumentOverflow(page)

  const phone = page.getByLabel('Nomor Telepon')
  await phone.fill('089900001111')
  const updateRequestPromise = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname.endsWith('/profile/me'))
  await page.getByRole('button', { name: 'Simpan Profil' }).click()
  const updateRequest = await updateRequestPromise
  expect(updateRequest.postDataJSON()).toMatchObject({ phone: '089900001111' })
  await expect(page.getByText('Profil berhasil diperbarui.')).toBeVisible()

  await page.getByRole('button', { name: 'Tambah Kontak' }).click()
  await expectModalFitsViewport(page, 'Tambah Kontak Darurat')
  await page.getByLabel('Nama Lengkap').fill('Mobile Friend')
  await page.getByLabel('Hubungan').selectOption('friend')
  await page.getByLabel('Nomor Telepon').fill('0822222222')

  const contactRequestPromise = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/profile/me/emergency-contacts'))
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await contactRequestPromise
  await expect(page.getByText('Mobile Friend')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await testInfo.attach('self-profile-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})

test('administrative Employee profile and contact edit work on mobile', async ({ page }, testInfo) => {
  await page.goto('/employee/42/profile')

  await expect(page.getByRole('heading', { name: 'Profil Karyawan' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Kembali ke daftar karyawan' })).toBeVisible()
  await expect(page.getByText('Mobile Parent')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByTitle('Edit kontak').click()
  await expectModalFitsViewport(page, 'Edit Kontak Darurat')
  await expect(page.getByLabel('Jadikan kontak utama')).toBeChecked()
  await page.getByLabel('Nama Lengkap').fill('Updated Mobile Parent')

  const contactRequestPromise = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname.endsWith('/employees/42/emergency-contacts/7'))
  await page.getByRole('button', { name: 'Perbarui' }).click()
  const contactRequest = await contactRequestPromise
  expect(contactRequest.postDataJSON()).toMatchObject({ name: 'Updated Mobile Parent' })
  await expect(page.getByText('Updated Mobile Parent')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await testInfo.attach('admin-profile-mobile', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
})
