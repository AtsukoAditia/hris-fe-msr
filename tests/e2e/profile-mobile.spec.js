import { expect, test } from '@playwright/test'
import { installProfileApiMocks } from './fixtures/profileApi'
import { expectModalFitsViewport, expectNoDocumentOverflow } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => installProfileApiMocks(page))

test('self profile and contact form work on mobile', async ({ page }) => {
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Profil Saya' })).toBeVisible()
  await expect(page.getByText('Mobile Profile Employee')).toBeVisible()
  await expect(page.getByText('83%')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByLabel('Nomor Telepon').fill('089900001111')
  const profileRequest = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname.endsWith('/profile/me'))
  await page.getByRole('button', { name: 'Simpan Profil' }).click()
  expect((await profileRequest).postDataJSON()).toMatchObject({ phone: '089900001111' })

  await page.getByRole('button', { name: 'Tambah Kontak' }).click()
  await expectModalFitsViewport(page, 'Tambah Kontak Darurat')
  const dialog = page.getByRole('dialog', { name: 'Tambah Kontak Darurat' })
  await dialog.getByLabel('Nama Lengkap').fill('Mobile Friend')
  await dialog.getByLabel('Hubungan').selectOption('friend')
  await dialog.getByLabel('Nomor Telepon').fill('0822222222')
  const contactRequest = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/profile/me/emergency-contacts'))
  await dialog.getByRole('button', { name: 'Simpan', exact: true }).click()
  await contactRequest
  await expect(page.getByText('Mobile Friend')).toBeVisible()
  await expectNoDocumentOverflow(page)
})

test('administrative profile contact edit works on mobile', async ({ page }) => {
  await page.goto('/employee/42/profile')
  await expect(page.getByRole('heading', { name: 'Profil Karyawan' })).toBeVisible()
  await expect(page.getByText('Mobile Parent')).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByTitle('Edit kontak').click()
  await expectModalFitsViewport(page, 'Edit Kontak Darurat')
  const dialog = page.getByRole('dialog', { name: 'Edit Kontak Darurat' })
  await expect(dialog.getByLabel('Jadikan kontak utama')).toBeChecked()
  await dialog.getByLabel('Nama Lengkap').fill('Updated Mobile Parent')
  const contactRequest = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname.endsWith('/employees/42/emergency-contacts/7'))
  await dialog.getByRole('button', { name: 'Perbarui' }).click()
  expect((await contactRequest).postDataJSON()).toMatchObject({ name: 'Updated Mobile Parent' })
  await expect(page.getByText('Updated Mobile Parent')).toBeVisible()
  await expectNoDocumentOverflow(page)
})
