# Organization Master Data Mobile Acceptance

Status: **Passed**

## Device Matrix

| Device Profile | Browser Engine | Result |
|---|---|:---:|
| Pixel 5 | Chromium | ✅ |
| iPhone 13 | WebKit | ✅ |

Playwright menggunakan mobile viewport, touch support, device scale factor, dan mobile user agent dari device descriptor masing-masing.

## Tested Scope

### Navigation and Layout

- Mobile navigation drawer dapat dibuka dan digunakan.
- Main content menggunakan spacing mobile yang lebih ringkas.
- Halaman tidak menghasilkan document-level horizontal overflow.
- Tabel lebar tetap tersedia melalui internal horizontal scrolling.
- Modal tetap berada di dalam lebar viewport.
- Modal panjang menggunakan internal vertical scrolling pada layar pendek.

### Department

- Department tab tampil pada mobile.
- Department table dapat dibaca melalui horizontal scrolling.
- Department form dapat dibuka, diisi, dan ditutup.

### Position

- Position tab dapat diakses.
- Department relationship dan Position rows tampil.
- Position form dapat dibuka dan diisi.
- Position modal dapat discroll pada iPhone viewport sehingga seluruh action button dapat dijangkau.

### Branch / Work Location

- Branch tab dapat diakses.
- Branch table dan location data tampil.
- Branch form dapat membuka dan menerima code, name, coordinates, radius, dan timezone fields.

### Employee Direct Manager

- Employee table tampil pada mobile.
- Nama dan jabatan direct manager tampil di table.
- Existing manager otomatis terpilih saat edit.
- Employee yang sedang diedit tidak tersedia sebagai manager untuk dirinya sendiri.
- Detail Employee menampilkan manager name, position, dan employee number.
- Create Employee mengirim numeric Department, Position, Branch, dan Manager IDs.
- Filter berdasarkan manager tertentu bekerja.
- Filter `Tanpa Atasan Langsung` bekerja.

## Automated Scenarios

```text
tests/e2e/organization-master-mobile.spec.js
tests/e2e/employee-manager-display-mobile.spec.js
tests/e2e/employee-manager-form-mobile.spec.js
```

Setiap skenario dijalankan pada kedua device profile sehingga total terdapat enam mobile acceptance executions.

## Run Locally

```bash
npm install
npx playwright install chromium webkit
npm run test:e2e
```

## CI

Workflow:

```text
.github/workflows/mobile-acceptance.yml
```

Workflow mengunggah:

- Playwright HTML report.
- Test result attachments.
- Screenshots.
- Trace files.
- Failure videos apabila terjadi kegagalan.

Service worker diblok hanya pada konteks Playwright agar mocked API requests dapat diintersepsi secara konsisten. Konfigurasi PWA aplikasi tidak diubah.

## Responsive Fixes Found by Acceptance Testing

1. Main content menggunakan `p-4 sm:p-6` agar ruang layar mobile lebih efisien.
2. Mobile navigation button memiliki accessible name.
3. Position form modal menggunakan `max-h-[90vh]` dan `overflow-y-auto` agar action button tetap dapat dijangkau pada layar iPhone yang pendek.

## Result

Organization Master Data yang mencakup Department, Position, Branch, dan Employee Direct Manager dinyatakan selesai untuk backend, frontend, component tests, CI, dan automated mobile acceptance.
