# Employee Document Management Frontend

Status: **Implemented and synchronized**

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
- Mengubah window `expires_within_days` antara 7–365 hari.
- Membuka detail dokumen melalui endpoint detail backend.
- Melihat status masa berlaku, checksum, MIME type, uploader, dan version.
- Mengunduh file melalui endpoint private terautentikasi.

Employee tidak mendapatkan tombol upload, edit, replace, atau delete.

## Admin dan HR

Admin dan HR dapat:

- Membuka dokumen Employee dari tabel Management Pegawai.
- Membuka detail dokumen melalui endpoint Employee-specific.
- Mengunggah PDF, JPG, PNG, atau WEBP maksimal 10 MB.
- Mengubah metadata dokumen.
- Mengganti file tanpa mengubah ID dokumen.
- Melihat version increment.
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

Kategori berasal dari endpoint backend dan tidak di-hardcode sebagai sumber data utama. Frontend mengikuti batas backend untuk title, description, tanggal terbit, tanggal kedaluwarsa, tipe file, dan ukuran file.

## Expiry States

```text
valid
expiring
expired
without_expiry
```

Halaman menampilkan summary untuk total, berlaku, segera kedaluwarsa, kedaluwarsa, dan tanpa tanggal kedaluwarsa. Label summary menampilkan `warning_days` yang dikembalikan backend.

## Download and Multipart Contract

Backend mengekspos `Content-Disposition` melalui CORS agar frontend dapat mempertahankan filename dari server. Jika download gagal dan backend mengembalikan JSON sebagai Blob, frontend membaca Blob tersebut dan menampilkan `message` backend.

Upload dan replace menggunakan `multipart/form-data`. Axios/browser menyusun boundary request, sementara backend menerima field file dan metadata sesuai kontrak FormRequest.

## Components

```text
src/pages/documents/DocumentsPage.jsx
src/pages/documents/components/DocumentSummary.jsx
src/pages/documents/components/DocumentFilters.jsx
src/pages/documents/components/DocumentList.jsx
src/pages/documents/components/DocumentDetailModal.jsx
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

- Normalisasi paginator, detail, summary, dan kategori.
- Multipart FormData upload dan replace.
- Metadata mapping dan label normalization.
- File type dan maximum-size validation yang sama dengan backend.
- Blob download menggunakan filename dari `Content-Disposition`.
- Parsing pesan error backend dari failed Blob download.
- Self-service dan Admin/HR detail endpoints.
- Configurable expiry warning window.
- Admin/HR upload, metadata edit, dan file replacement.
- Accessible detail, upload, dan replace dialogs.
- Document-level overflow protection.
- Pixel 5 dengan Chromium.
- iPhone 13 dengan WebKit.
