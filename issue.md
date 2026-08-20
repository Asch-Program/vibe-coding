# Project Setup: Bun + ElysiaJS + Drizzle ORM + MySQL

## Deskripsi Tugas
Lakukan inisialisasi dan setup awal untuk project backend baru menggunakan **Bun** sebagai runtime, **ElysiaJS** sebagai web framework, **Drizzle ORM** untuk interaksi database, dan **MySQL** sebagai databasenya. 

Implementasikan instruksi high-level di bawah ini untuk menyiapkan fondasi project.

## Instruksi High-Level

### 1. Inisialisasi Project
- Inisialisasi project Bun baru di dalam direktori ini.
- Pastikan konfigurasi dasar TypeScript (`tsconfig.json`) dan `package.json` sudah terbuat dengan benar.

### 2. Instalasi Dependencies
- Install **ElysiaJS** beserta plugin dasar yang mungkin diperlukan.
- Install **Drizzle ORM** dan **Drizzle Kit**.
- Install driver MySQL yang kompatibel (misalnya `mysql2`).

### 3. Konfigurasi Database (Drizzle)
- Buat file konfigurasi koneksi database (database connection instance).
- Siapkan file `drizzle.config.ts` (atau ekuivalennya) untuk mengatur target schema dan konfigurasi credentials.
- Buat sebuah skema database sederhana (contoh: skema untuk tabel `users`).
- Tambahkan script pada `package.json` untuk menjalankan operasi migrasi (contoh script untuk men-generate dan meng-apply migrasi).

### 4. Setup Server (ElysiaJS)
- Buat entry point aplikasi (misal: `src/index.ts`).
- Inisialisasi server ElysiaJS dan pastikan server mendengarkan di port tertentu.
- Buat endpoint CRUD sederhana (contoh endpoint GET/POST ke `/users`) yang terintegrasi dengan instance Drizzle ORM untuk memvalidasi bahwa koneksi database dan routing berjalan dengan baik.

### 5. Manajemen Environment
- Siapkan file `.env` dan `.env.example` untuk menyimpan variabel konfigurasi seperti URI koneksi MySQL (`DATABASE_URL`).

## Acceptance Criteria (Kriteria Penerimaan)
1. Aplikasi dapat dijalankan di lokal menggunakan Bun (contoh: `bun run dev`) dengan dukungan hot-reload.
2. Server dapat menerima HTTP request dari client.
3. Schema database berhasil di-push atau di-migrasi ke instance MySQL.
4. Terdapat minimal satu endpoint yang berhasil melakukan operasi *Read* dan *Write* secara langsung ke database MySQL melalui Drizzle.
