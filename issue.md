# Implementasi Fitur: User Registration & Login API

## Deskripsi

Implementasikan fitur registrasi dan login user menggunakan stack yang sudah ada (Bun + ElysiaJS + Drizzle ORM + MySQL). Fitur ini mencakup pembuatan tabel `users` baru, endpoint API untuk registrasi (dengan konsep email verification), dan endpoint API untuk login (dengan JWT access & refresh token). Password harus di-hash menggunakan **bcrypt**.

> **⚠️ PENTING:** Jangan pernah menampilkan field sensitif seperti `password` (baik plain-text maupun hash) di response body manapun. Response hanya boleh mengandung data yang aman untuk ditampilkan ke client.

---

## Prasyarat

- Project sudah ter-setup dengan Bun, ElysiaJS, Drizzle ORM, dan MySQL.
- Database MySQL sudah berjalan dan dapat diakses melalui `DATABASE_URL` di file `.env`.
- Install dependency tambahan yang dibutuhkan:

```bash
bun add bcryptjs jsonwebtoken uuid
bun add -D @types/bcryptjs @types/jsonwebtoken @types/uuid
```

- Tambahkan variabel berikut ke file `.env` dan `.env.example`:

```env
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN=3600
```

---

## Tahap 1: Ubah Struktur Folder

Refactor struktur folder `src/` menjadi seperti berikut:

```
src/
├── index.ts              # Entry point aplikasi (sudah ada, perlu dimodifikasi)
├── db/
│   ├── index.ts          # Koneksi database (sudah ada, tidak perlu diubah)
│   └── schema.ts         # Schema database (sudah ada, perlu dimodifikasi)
├── models/               # [BARU] Berisi model / tipe data
│   └── user-model.ts
├── routes/               # [BARU] Berisi routing ElysiaJS
│   └── user-routes.ts
├── services/             # [BARU] Berisi logic bisnis
│   └── user-service.ts
└── controllers/          # [BARU] Berisi controller
    └── user-controller.ts
```

**Konvensi penamaan file:** gunakan format `kebab-case` dengan suffix sesuai layer-nya, contoh: `user-routes.ts`, `user-service.ts`, `user-controller.ts`.

---

## Tahap 2: Definisikan Schema Tabel `users`

Modifikasi file `src/db/schema.ts`. Ganti schema `users` yang sudah ada dengan definisi berikut:

| Kolom         | Tipe              | Constraint                          |
| ------------- | ----------------- | ----------------------------------- |
| `id`          | `int`             | Auto Increment, Primary Key         |
| `uuid`        | `varchar(255)`    | NOT NULL, UNIQUE (format: `usr_` + UUID v4) |
| `username`    | `varchar(255)`    | NOT NULL                            |
| `email`       | `varchar(255)`    | NOT NULL, UNIQUE                    |
| `password`    | `varchar(255)`    | NOT NULL (simpan dalam bentuk hash) |
| `is_verified` | `boolean`         | DEFAULT `false`                     |
| `roles`       | `json`            | DEFAULT `["user"]`                  |
| `created_at`  | `timestamp`       | DEFAULT CURRENT_TIMESTAMP           |

- UUID di-generate saat registrasi menggunakan library `uuid` (v4), dengan prefix `usr_`. Contoh: `usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`.

Setelah schema diubah, jalankan perintah berikut untuk men-sync schema ke database:

```bash
bun run db:push
```

---

## Tahap 3: Buat Model

Buat file `src/models/user-model.ts`. File ini berisi tipe/interface TypeScript yang merepresentasikan data. Definisikan:

- Tipe untuk **request body registrasi**: `{ username, email, password }`.
- Tipe untuk **request body login**: `{ email, password }`.
- Tipe untuk **response body standar**: `{ status, message, data? }`.

---

## Tahap 4: Buat Service (Business Logic)

Buat file `src/services/user-service.ts`. File ini berisi semua logic bisnis:

### 4a. Fungsi `registerUser`
- Menerima parameter: `username`, `email`, `password`.
- Cek apakah email sudah terdaftar di database (query ke tabel `users` berdasarkan `email`).
  - Jika sudah ada → throw error atau return indikasi gagal.
  - Jika belum ada:
    1. Hash password menggunakan `bcryptjs`.
    2. Generate UUID dengan prefix `usr_` menggunakan library `uuid`.
    3. Insert data user baru ke database (dengan `is_verified: false` dan `roles: ["user"]`).
    4. Return data user yang **aman** (tanpa password): `uuid`, `email`, `is_verified`.

### 4b. Fungsi `loginUser`
- Menerima parameter: `email`, `password`.
- Cari user berdasarkan `email` di database.
  - Jika user tidak ditemukan → return indikasi gagal (invalid credentials).
  - Jika user ditemukan → bandingkan `password` yang dikirim dengan hash di database menggunakan `bcrypt.compare()`.
    - Jika cocok:
      1. Generate **access_token** (JWT, expire sesuai `JWT_EXPIRES_IN`). Payload berisi: `uuid`, `email`, `roles`.
      2. Generate **refresh_token** (JWT, expire lebih panjang, misal 7 hari). Payload berisi: `uuid`.
      3. Return token dan data user yang **aman** (tanpa password).
    - Jika tidak cocok → return indikasi gagal (invalid credentials).

---

## Tahap 5: Buat Controller

Buat file `src/controllers/user-controller.ts`. Controller bertugas menerima request, memanggil service, dan mengembalikan response HTTP yang sesuai.

### 5a. `registerController`
- Panggil `registerUser` dari service.
- Jika sukses → response **201 Created**:
  ```json
  {
    "status": "success",
    "message": "User registered successfully. Please verify your email.",
    "data": {
      "user_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "user@example.com",
      "is_verified": false
    }
  }
  ```
- Jika gagal (user sudah ada) → response **400 Bad Request**:
  ```json
  {
    "status": "error",
    "message": "User already exists"
  }
  ```

### 5b. `loginController`
- Panggil `loginUser` dari service.
- Jika sukses → response **200 OK**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "rfr_8x2931...",
      "expires_in": 3600,
      "user": {
        "uuid": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "John Doe",
        "roles": ["premium_user"]
      }
    }
  }
  ```
- Jika gagal (kredensial salah) → response **401 Unauthorized**:
  ```json
  {
    "status": "error",
    "message": "Invalid credentials"
  }
  ```

> **⚠️ PERHATIAN:** Pastikan tidak ada field `password` di seluruh response body. Baik registrasi maupun login, hanya kembalikan data yang aman.

---

## Tahap 6: Buat Routes

Buat file `src/routes/user-routes.ts`. Definisikan routing ElysiaJS untuk endpoint berikut:

| Method | Endpoint       | Deskripsi              | Request Body                            |
| ------ | -------------- | ---------------------- | --------------------------------------- |
| POST   | `/api/users`   | Registrasi user baru   | `{ username, email, password }`         |
| POST   | `/api/login`   | Login user             | `{ email, password }`                   |

- Gunakan validasi body menggunakan `t.Object()` dari Elysia untuk memastikan field yang dikirim sesuai.
- Hubungkan masing-masing route ke controller yang sesuai.

---

## Tahap 7: Integrasikan Routes ke Entry Point

Modifikasi file `src/index.ts`:

- Import route yang sudah dibuat dari `src/routes/user-routes.ts`.
- Pasang route tersebut ke instance Elysia menggunakan `.use()`.
- Hapus endpoint `/users` lama (GET dan POST) yang sudah tidak relevan.
- Pastikan server tetap listen di port `3000`.

---

## Tahap 8: Testing Manual

Setelah semua tahap selesai, jalankan server:

```bash
bun run dev
```

Lalu test menggunakan `curl` atau tools lain (Postman, Insomnia, dll):

### Test 1: Registrasi (Sukses)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "asch", "email": "asch@localhost", "password": "rahasia"}'
```
**Expected:** Status `201`, body berisi `status: "success"`, `data.user_id`, `data.email`, `data.is_verified: false`. **TIDAK ADA** field `password` di response.

### Test 2: Registrasi (Gagal - Duplicate Email)
Jalankan curl yang sama seperti Test 1 lagi.
**Expected:** Status `400`, body berisi `status: "error"`, `message: "User already exists"`.

### Test 3: Login (Sukses)
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "asch@localhost", "password": "rahasia"}'
```
**Expected:** Status `200`, body berisi `status: "success"`, `data.access_token`, `data.refresh_token`, `data.expires_in`, `data.user` (dengan `uuid`, `name`, `roles`). **TIDAK ADA** field `password` di response.

### Test 4: Login (Gagal - Password Salah)
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "asch@localhost", "password": "salah"}'
```
**Expected:** Status `401`, body berisi `status: "error"`, `message: "Invalid credentials"`.

### Test 5: Login (Gagal - Email Tidak Terdaftar)
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tidakada@localhost", "password": "rahasia"}'
```
**Expected:** Status `401`, body berisi `status: "error"`, `message: "Invalid credentials"`.

---

## Acceptance Criteria

- [ ] Struktur folder `src/` sudah mengikuti pola `routes`, `services`, `controllers`, `models`.
- [ ] Tabel `users` di MySQL memiliki kolom `id`, `uuid`, `username`, `email`, `password`, `is_verified`, `roles`, `created_at`.
- [ ] Password tersimpan di database dalam bentuk **hash bcrypt** (bukan plain text).
- [ ] UUID user menggunakan format `usr_` + UUID v4.
- [ ] **Tidak ada field `password`** yang tampil di response body manapun (registrasi maupun login).
- [ ] `POST /api/users` berhasil membuat user baru dan mengembalikan `201` beserta `user_id`, `email`, dan `is_verified`.
- [ ] `POST /api/users` mengembalikan `400` jika email sudah terdaftar.
- [ ] `POST /api/login` mengembalikan `200` beserta `access_token`, `refresh_token`, `expires_in`, dan data `user` (tanpa password).
- [ ] `POST /api/login` mengembalikan `401` jika email tidak ditemukan atau password salah.
- [ ] Semua 5 skenario testing manual di atas berhasil.
