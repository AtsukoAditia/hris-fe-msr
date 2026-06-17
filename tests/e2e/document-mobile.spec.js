import { expect, test } from '@playwright/test'
import { installDocumentApiMocks } from './fixtures/documentApi'
import { expectModalFitsViewport, expectNoDocumentOverflow } from './fixtures/mobileAssertions'

test.beforeEach(async ({ page }) => installDocumentApiMocks(page))

test('self document list and secure download work on mobile', async ({ page }) => {
  await page.goto('/documents')

  await expect(page.getByRole('heading', { name: 'Dokumen Saya' })).toBeVisible()
  await expect(page.getByText('Mobile Employment Contract')).toBeVisible()
  await expect(page.getByText('Segera Kedaluwarsa')).toBeVisible()
  await expect(page.getByText('Rahasia')).toBeVisible()
  await expectNoDocumentOverflow(page)

  const requestPromise = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith('/documents/my/7/download'))
  await page.getByRole('button', { name: 'Unduh' }).click()
  await requestPromise
  await expectNoDocumentOverflow(page)
})

test('Admin upload and replace modals work on mobile', async ({ page }) => {
  await page.goto('/employee/42/documents')

  await expect(page.getByRole('heading', { name: 'Dokumen Karyawan' })).toBeVisible()
  await expect(page.getByText(/Mobile Document Employee/)).toBeVisible()
  await expectNoDocumentOverflow(page)

  await page.getByRole('button', { name: 'Unggah Dokumen' }).click()
  await expectModalFitsViewport(page, 'Unggah Dokumen Karyawan')
  const uploadDialog = page.getByRole('dialog', { name: 'Unggah Dokumen Karyawan' })
  await uploadDialog.getByLabel('File Dokumen').setInputFiles({
    name: 'mobile-upload.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('mobile upload'),
  })
  await uploadDialog.getByLabel('Kategori').selectOption('employment')
  await uploadDialog.getByLabel('Judul Dokumen').fill('Mobile Upload')
  const uploadRequest = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/employees/42/documents'))
  await uploadDialog.getByRole('button', { name: 'Unggah Dokumen' }).click()
  await uploadRequest
  await expectNoDocumentOverflow(page)

  await page.getByTitle('Ganti file').click()
  await expectModalFitsViewport(page, 'Ganti File Dokumen')
  const replaceDialog = page.getByRole('dialog', { name: 'Ganti File Dokumen' })
  await replaceDialog.getByLabel('File Baru').setInputFiles({
    name: 'mobile-replacement.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('replacement'),
  })
  const replaceRequest = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/employees/42/documents/7/replace'))
  await replaceDialog.getByRole('button', { name: 'Ganti File' }).click()
  await replaceRequest
  await expectNoDocumentOverflow(page)
})
