# 🧠 NeuroDesk

### Aplikasi Manajemen Tugas dan Workspace Modern

NeuroDesk adalah aplikasi workspace berbasis web yang dirancang untuk membantu pengguna mengatur tugas, mengelola aktivitas kerja, dan meningkatkan produktivitas melalui dashboard yang modern dan intuitif.

Aplikasi ini dikembangkan menggunakan Laravel, React, dan Inertia.js, dengan menggabungkan backend yang kuat serta antarmuka pengguna yang interaktif dan responsif.

---

## ✨ Fitur Utama

- 🔐 **Sistem Autentikasi** — Registrasi, login, logout, dan reset password.
- 📊 **Dashboard** — Halaman utama untuk pengguna yang telah login.
- ✅ **Manajemen Tugas** — Mengelola dan mengorganisir tugas.
- 👤 **Manajemen Profil** — Memperbarui informasi profil pengguna.
- 🔒 **Pengaturan Keamanan** — Pengelolaan password dan dukungan autentikasi dua faktor (2FA).
- 📱 **Antarmuka Responsif** — Tampilan modern yang menyesuaikan berbagai ukuran layar.
- 🧪 **Pengujian Otomatis** — Pengujian fitur autentikasi, dashboard, profil, dan pengaturan keamanan.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| Laravel | Framework backend |
| PHP | Bahasa pemrograman sisi server |
| React | Library untuk membangun antarmuka |
| TypeScript | Bahasa pemrograman frontend |
| Inertia.js | Integrasi Laravel dengan React |
| Tailwind CSS | Framework styling berbasis utility |
| Vite | Build tool frontend |
| SQLite / MySQL | Sistem basis data |
| Git & GitHub | Version control dan pengelolaan repository |

---

## 📸 Tampilan Aplikasi

Screenshot aplikasi akan ditambahkan pada bagian ini.

<!-- Tambahkan screenshot aplikasi setelah proses pengambilan gambar -->

---

## ⚙️ Instalasi dan Menjalankan Project

### Persyaratan

Pastikan perangkat sudah memiliki:

- PHP
- Composer
- Node.js
- npm
- Database yang didukung Laravel

### 1. Clone Repository

```bash
git clone https://github.com/alawialthaf63-droid/NeuroDesk.git
```

### 2. Masuk ke Direktori Project

```bash
cd NeuroDesk
```

### 3. Instal Dependensi

```bash
composer install
npm install
```

### 4. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database pada file `.env`.

### 5. Jalankan Migrasi Database

```bash
php artisan migrate
```

### 6. Build Asset Frontend

```bash
npm run build
```

### 7. Jalankan Aplikasi

```bash
composer run dev
```

Buka alamat lokal yang ditampilkan pada terminal untuk mengakses aplikasi.

---

## 🧪 Pengujian Aplikasi

NeuroDesk dilengkapi dengan pengujian otomatis untuk memastikan fitur-fitur utama berjalan dengan baik.

Jalankan pengujian menggunakan perintah:

```bash
php artisan test
```

### Hasil Pengujian Terakhir

| Keterangan | Hasil |
|---|---:|
| Pengujian Berhasil | 40 |
| Assertions | 138 |
| Kegagalan | 0 |
| Durasi | 13,69 detik |

Seluruh 40 pengujian berhasil dijalankan tanpa kegagalan.

---

## 🚀 Status Project

NeuroDesk merupakan project pengembangan pribadi yang dibuat untuk meningkatkan keterampilan dalam pengembangan aplikasi web, memahami arsitektur aplikasi modern, serta menerapkan teknologi Laravel dan React dalam project nyata.

---

## 👨‍💻 Pengembang

**Althaf Alawi**

- GitHub: [@alawialthaf63-droid](https://github.com/alawialthaf63-droid)

---

<p align="center">
  Dikembangkan menggunakan Laravel, React, dan Inertia.js
</p>
