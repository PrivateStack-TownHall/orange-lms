# Summary

Ringkasan singkat frontend **Orange LMS** — apa isinya, cara menjalankannya, dan status pengembangannya. Dokumen ini melengkapi `README.md` dengan info yang lebih ringkas dan up-to-date (README lama masih menyebut port 5173 dan `.env.local`; project ini sebenarnya sudah pakai `.env.development` bawaan dengan port 5250).

---

## 🍊 Tentang Project

Orange LMS adalah aplikasi **Learning Management System** dengan 4 role pengguna:

| Role       | Akses Utama                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| **Owner**  | Akses penuh — kelola Admin, Mentor, Mentee, lihat Reports, Audit Log, User Activity |
| **Admin**  | Kelola Mentor & Mentee, kelas, meeting, task, dsb (tanpa akses Reports)             |
| **Mentor** | Kelola kelas yang diampu, meeting, task, materi, nilai submission                   |
| **Mentee** | Ikut kelas, lihat materi, kumpul tugas, lihat nilai                                 |

Tech stack: **React 19 + Vite 7 + Tailwind CSS v4 + Redux Toolkit + React Router v7 + Axios**.

---

## ⚙️ Prasyarat

Frontend ini **tidak berdiri sendiri** — perlu backend `server/` (Node.js/Express + PostgreSQL) berjalan lebih dulu, karena semua data (login, kelas, task, dst) diambil lewat REST API.

- Node.js 18+ (disarankan 20/22)
- Backend `server/` sudah jalan di `http://localhost:5000` (lihat `server/README.md` untuk cara setup database & migration)

---

## 🚀 Cara Menjalankan (Development)

```bash
# 1. Masuk folder ui
cd ui

# 2. Install dependencies
npm install

# 3. Environment sudah tersedia di .env.development, tidak perlu bikin baru.
#    Kalau mau custom, copy dari .env.example lalu sesuaikan:
#    cp .env.example .env.development

# 4. Jalankan dev server
npm run dev
```

Aplikasi akan berjalan di:

```
http://localhost:5250
```

(port ini diatur lewat `VITE_PORT` di `.env.development`, dibaca oleh `vite.config.js`)

Pastikan backend sudah aktif di `VITE_API_URL` (default: `http://localhost:5000/api`), kalau tidak, halaman akan render tapi data kosong / gagal fetch.

---

## 📦 Script yang Tersedia

| Command           | Fungsi                                |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Jalankan Vite dev server (hot reload) |
| `npm run build`   | Build production ke folder `dist/`    |
| `npm run preview` | Preview hasil build secara lokal      |
| `npm run lint`    | Jalankan ESLint                       |

---

## 🔑 Login untuk Testing

Kalau backend sudah di-seed (`npm run db:seed` di folder `server`), pakai akun berikut untuk masing-masing role (password semua `123`):

| Role   | Email                                                 |
| ------ | ----------------------------------------------------- |
| Owner  | vincent@mail.com                                      |
| Admin  | dino@mail.com / dina@mail.com                         |
| Mentor | michael@mail.com / jonathan@mail.com / sarah@mail.com |
| Mentee | ethan@mail.com                                        |

---

## 🗂️ Struktur Folder Penting

```
ui/src/
├── app/
│   ├── routes/          # definisi routing (per modul) + route guard (Protected/Public/RoleGuard)
│   ├── store/           # Redux store & slices (mis. authSlice)
│   └── providers/       # PopupProvider, dll
├── layouts/             # MainLayout (sidebar+navbar), AuthLayout
├── pages/                # halaman per modul: dashboard, classes, meetings, tasks,
│                         # notes, materials, mentors, mentees, admins, profile,
│                         # settings, notifications, audit-log, user-activity, reports
├── services/             # axios instance + service per modul (auth.service.js, dll)
├── components/           # komponen reusable (table, form, ui elements)
├── hooks/, helpers/, schemas/, constants/, config/, styles/, assets/
```

Routing didefinisikan modular per fitur di `src/app/routes/modules/*.routes.jsx`, digabung di `src/app/routes/index.jsx`. Halaman yang butuh role tertentu dibungkus `<RoleGuard roles={[...]}>`.

---

## 📄 Daftar Halaman (Routes)

| Path                                                                   | Halaman                            | Role yang bisa akses              |
| ---------------------------------------------------------------------- | ---------------------------------- | --------------------------------- |
| `/auth/login`                                                          | Login                              | Publik                            |
| `/dashboard`                                                           | Dashboard (beda tampilan per role) | Semua role login                  |
| `/classes`, `/classes/create`, `/classes/:id`, `/classes/edit/:id`     | Manajemen kelas                    | Semua                             |
| `/meetings`, `/meetings/create`, `/meetings/:id`, `/meetings/edit/:id` | Manajemen meeting                  | Semua                             |
| `/tasks`, `/tasks/create`, `/tasks/:id`, `/tasks/edit/:id`             | Manajemen task & submission        | Semua                             |
| `/notes` (+create/:id/edit)                                            | Catatan kelas                      | Semua                             |
| `/materials` (+create/:id/edit)                                        | Materi belajar                     | Semua                             |
| `/admins` (+create/:id/edit)                                           | Manajemen admin                    | **Owner**                         |
| `/mentors` (+create/:id/edit)                                          | Manajemen mentor                   | Owner, Admin                      |
| `/mentees` (+create/:id/edit)                                          | Manajemen mentee                   | Owner, Admin, Mentor (read)       |
| `/attendance`, `/history-classes`, `/task-criteria`, `/assessments`    | Modul V3                           | Semua (⚠️ lihat catatan di bawah) |
| `/profile`, `/profile/edit`                                            | Profil pengguna                    | Semua                             |
| `/settings`                                                            | Pengaturan                         | Semua                             |
| `/notifications`                                                       | Notifikasi                         | Semua                             |
| `/audit-log`                                                           | Log aktivitas sistem               | Owner, Admin                      |
| `/user-activity`                                                       | Log aktivitas pengguna             | Owner, Admin                      |
| `/reports`                                                             | Laporan                            | **Owner** saja                    |

---

## 🚧 Status Pengembangan

Diambil dari kondisi kode saat ini (bukan dari README lama):

**Sudah lengkap (CRUD + UI penuh):**

- ✅ Auth (Login)
- ✅ Dashboard per role
- ✅ Classes, Meetings, Tasks, Notes, Materials
- ✅ Admins, Mentors, Mentees
- ✅ Profile, Settings, Notifications
- ✅ Audit Log, User Activity, Reports

**Masih placeholder (routing ada, komponen halaman belum dibuat — masih `<div>...</div>`):**

- 🚧 Attendance (`/attendance`)
- 🚧 History Classes (`/history-classes`)
- 🚧 Task Criteria (`/task-criteria`)
- 🚧 Assessments (`/assessments`)

Modul-modul di atas sudah punya endpoint backend & tabel database yang lengkap (`server/src/routes`, `server/src/models`), tapi UI-nya belum diimplementasikan — jadi ini prioritas kerja berikutnya.

---

## 🔗 Terkait

- Backend: lihat `server/README.md`, `server/docs/APICONTRACT.md`, `server/docs/DATABASESCHEME.md`
- RBAC detail: `server/docs/RBAC.md`
