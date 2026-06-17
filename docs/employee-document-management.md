# Employee Document Management Frontend

Status: **Implemented**

## Routes

```text
/documents
/employee/:employeeId/documents
```

- `/documents` tersedia bagi seluruh user terautentikasi yang memiliki Employee record.
- `/employee/:employeeId/documents` tersedia untuk Admin dan HR.

## Self-Service

Employee dapat:

- Melihat summary dokumen.
- Mencari dan memfilter dokumen.
- Melihat status masa berlaku.
- Mengunduh file melalui endpoint private terautentikasi.

Employee tidak mendapatkan tombol upload, edit, replace, atau delete.

## Admin dan HR

Admin dan HR dapat:

- Membuka dokumen Employee dari tabel Management Pegawai.
- Mengunggah PDF, JPG, PNG, atau WEBP maksimal 10 MB.
- Mengubah metadata dokumen.
- Mengganti file tanpa mengubah ID dokumen.
- Melihat versi file.
- Menghapus dokumen dengan konfirmasi.
- Mengunduh file melalui endpoint private.

## Metadata

```text
category
title
description
labels
issue_date
expiry_date
is_confidential
```

Kategori berasal dari endpoint backend dan tidak di-hardcode sebagai sumber data utama.

## Expiry States

```text
valid
expiring
expired
without_expiry
```

Halaman menampilkan summary untuk total, berlaku, segera kedaluwarsa, kedaluwarsa, dan tanpa tanggal kedaluwarsa.

## Components

```text
src/pages/documents/DocumentsPage.jsx
src/pages/documents/components/DocumentSummary.jsx
src/pages/documents/components/DocumentFilters.jsx
src/pages/documents/components/DocumentList.jsx
src/pages/documents/components/DocumentFormModal.jsx
src/pages/documents/components/ReplaceDocumentModal.jsx
src/pages/documents/document.helpers.js
src/services/documentService.js
```

## Automated Tests

```text
src/pages/documents/document.helpers.test.js
src/pages/documents/DocumentsPage.test.jsx
tests/e2e/document-mobile.spec.js
tests/e2e/fixtures/documentApi.js
```

Coverage mencakup:

- Normalisasi paginator, summary, dan kategori.
- Multipart FormData upload dan replace.
- Metadata mapping dan label normalization.
- Blob download menggunakan filename dari `Content-Disposition`.
- Self-service document list dan download.
- Admin/HR upload, metadata edit, dan file replacement.
- Accessible dialog selectors.
- Document-level overflow protection.
- Pixel 5 dengan Chromium.
- iPhone 13 dengan WebKit.
