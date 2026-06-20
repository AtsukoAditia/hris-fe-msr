# Smart Attendance HRIS — Frontend Documentation

Dokumentasi ini adalah indeks teknis untuk repository frontend `hris-fe-msr`.

## Document Index

| Document | Purpose |
|---|---|
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Baseline UI dan integrasi aktual, gap, dan milestone aktif |
| [MODULES.md](MODULES.md) | Inventaris modul, halaman, role, dan status |
| [ROADMAP.md](ROADMAP.md) | Urutan pengembangan frontend yang disinkronkan dengan backend |
| [ROUTE_MATRIX.md](ROUTE_MATRIX.md) | Route aplikasi, role access, page, dan service utama |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Struktur React, aliran data, state, API, PWA, dan security boundary |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | Setup, component rules, testing, responsive requirements, dan Definition of Done |

## Source-of-Truth Order

Ketika terdapat perbedaan dokumentasi, gunakan urutan berikut:

1. `src/routes/index.jsx` untuk route aktif dan role guard.
2. `src/services/` untuk kontrak integrasi API.
3. Backend `routes/api_v1.php` untuk endpoint dan authorization source of truth.
4. Component/page tests untuk expected UI behavior.
5. Dokumen dalam folder ini untuk ringkasan dan rencana.

## Documentation Rules

Setiap modul baru atau perubahan integrasi harus memperbarui:

- `PROJECT_STATUS.md`
- `MODULES.md`
- `ROADMAP.md`
- `ROUTE_MATRIX.md`
- Dokumentasi backend yang berhubungan

Frontend route guard, hidden menu, dan disabled button hanya meningkatkan UX. Authorization tetap harus ditegakkan oleh backend.

## Current Milestone

**Basic Payroll Foundation** merupakan fokus berikutnya setelah Overtime Management selesai end-to-end.
