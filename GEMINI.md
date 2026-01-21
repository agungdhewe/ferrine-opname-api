# 🤖 GEMINI Context Guide: StockOpname Server
Dokumen ini adalah panduan konteks bagi asisten AI (Gemini) untuk memahami aturan, standar, dan arsitektur proyek API Backend Stock Opname ini. Semua saran kode dan pengembangan fitur wajib mematuhi ketentuan di bawah ini.
---

---
## 🏗️ Project Overview & Architecture
- **Type:** API Stock Opname
- **Backend:** Node.js (Express.js) - Full ES6 Modules (`import/export`)
- **Database:** PostgreSQL 16 (Relational Integrity)
- **Cache/Session:** Redis (Speed & Token Blacklisting)
- **Scale:** Dirancang untuk horizontal scaling
- **Use case:** Stock Opname multi-device multi-store for Offline-first Android application (sync data via API)

---
## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Cache & Session:** Redis
- **Auth:** JSON Web Token (JWT) & bcrypt untuk hashing password
---
## Standar Penulisan Kode
- **Variabel & Fungsi:** Gunakan `camelCase`.
- **Error Handling:** Wajib menggunakan blok `try { ... } catch (error) { ... }` pada setiap fungsi.
- **Data Credentials:** dilarang keras menulis data sensitif di dalam kode. Gunakan file `.env` di root direktori project.
- **Dokumentasi:** Gunakan komentar JSDoc dalam **Bahasa Indonesia**.
- **Variabel:** Gunakan const untuk variabel yang tidak berubah dan let untuk variabel yang nilainya berubah; hindari penggunaan var.



---
## 🔐 Keamanan & Authorisasi
- **Layered Auth:** Gunakan Access Token (short-lived) dan Refresh Token (long-lived).
- **Session Management:** Simpan session di Redis untuk validasi refresh token dan mekanisme logout.
- **Abuse Prevention:** Terapkan `express-rate-limit` pada semua endpoint API.
- **Logging:** Gunakan sistem logging untuk setiap error dan aktivitas krusial guna keperluan debugging.
- **Nonce Validation:** Gunakan `nonce` (number used once) yang dikombinasikan dengan timestamp pada setiap request sensitif untuk mencegah Replay Attacks.
- **Signature Validation:** Gunakan `signature` (hash dari request body + timestamp + nonce + secret key dari masing-masing device) pada setiap request sensitif untuk mencegah Replay Attacks. Secret key di server harus diambil dari database berdasarkan `deviceId`.
- **Password Hashing:** Gunakan bcrypt untuk hashing password.
- Aturan Validasi Tambahan:
    - Sebelum melakukan hashing, `rawBody` harus dipastikan konsisten. Disarankan menggunakan string concatenation dari field utama atau melakukan `JSON.stringify` dengan urutan key yang terurut (alphabetical) untuk menghindari ketidakcocokan signature antara Android (Java/Kotlin) dan Server (Node.js).

- Setiap request sensitif (POST/PUT/DELETE) dari device Android wajib melalui validasi berikut di layer Middleware:

    - Komponen Header
        - `X-Timestamp`: ISO 8601 string. Server harus menolak jika selisih waktu > 5 menit dari jam server.
        - `X-Nonce`: String unik acak (UUID/Random string).
        - `X-Signature`: Hasil hash HMAC-SHA256.
        - `X-Device-ID`: ID device yang terdaftar.

    - Logika Validasi Signature
        - Signature dibentuk dengan pola:
            `hash_hmac('sha256', rawBody + timestamp + nonce, deviceSecret)`

    - Aturan Server:
        - Ambil `deviceSecret` dari database berdasarkan `deviceId`.
        - Re-generate signature di sisi server. Jika tidak cocok dengan `X-Signature`, return `401 Unauthorized`.
        - Cek `X-Nonce` di Redis. Jika nonce sudah ada, return `403 Forbidden` (Replay Attack).
        - Jika nonce belum ada, simpan ke Redis dengan TTL 5 menit.

    - Penanganan Error
        - Jika validasi gagal, berikan respon error yang jelas namun aman (misal: "Invalid Request Signature").
        - Log setiap kegagalan signature untuk audit keamanan.
---
## Struktur Kerja & Flow
- Setiap service yang dibuat dalam sistem ini **WAJIB memiliki dokumentasi resmi**
di dalam file `README.md` di root direktori project.
- File `README.md` ini harus berisi:
    - Deskripsi singkat tentang service.
    - Cara instalasi dan konfigurasi.
    - Contoh penggunaan dengan request dan response untuk masing-masing endpoint.
    - Penjelasan setiap parameter dan field.
    - Informasi tentang error codes yang mungkin muncul.
- Setiap service harus dibuatkan contoh penggunaannya dengan javascript ES6 di dalam direktori `examples`.
- setiap ada perubahan pada kontrak service, wajib update dokumentasi di file `README.md` dan contoh penggunaannya di direktori `examples`.
- credential untuk contoh penggunaan disimpan dalam file `.env.example` di direktori `examples`.
- Dilarang memodifikasi file-file yang ada di dalam direktori `gemini`.
- Dilarang memodifikasi file `GEMINI.md`.
- Dilarang keras memodifikasi DbContract, karena DbContract sudah dibuat berdasarkan aplikasi web opname yang sudah berjalan
- Setiap service harus dibuatkan contoh penggunaannya dengan javascript ES6 di dalam direktori `examples`.
- **Kredensial Contoh Penggunaan:** Jika contoh penggunaan (example) memerlukan proses login, wajib menggunakan environment variable `TEST_USER` dan `TEST_USERPASSWORD`.
- Kredensial tersebut harus didefinisikan di dalam file `.env.example` di direktori `examples` dengan nilai default:
    - `TEST_USER='admin'`
    - `TEST_USERPASSWORD='rahasia123'`
---
## Logical Data Model

Dokumen ini mendefinisikan **logical data model** dan **aturan (rules)**  
sebagai kontrak antara **Opname Web App**, **Backend API Service**, dan **Database**.

*(Setiap tabel menyertakan audit fields: createdBy, createdAt, updatedBy, updatedAt, isDeleted)*

*jika ada field disabled, berarti digunakan untuk menonaktifkan data, tanpa dihapus (tetap tampil di list)*

*jika ada field isDeleted, berarti digunakan untuk menghapus data secara logis, tanpa dihapus fisik (tidak tampil di list)*

format:
EntityName (`table_name`)
- fieldName : DataType [PK/FK] [Description]


### Device (`device`)
- deviceId : INT [PK] AUTO_INCREMENT
- name : TEXT [UNIQUE]
- secret : TEXT
- disabled : BOOL

### User (`user`)
- username (TEXT) [PK]
- fullname (TEXT)
- password (TEXT) [HASHED]
- isAdmin (BOOL)
- allowOpname (BOOL)
- allowReceiving (BOOL)
- allowTransfer (BOOL)
- allowPrintLabel (BOOL)
- disabled (BOOL)


### Item (`item`)
- itemId (TEXT) [PK]
- brandCode (TEXT)
- article (TEXT)
- material (TEXT)
- color (TEXT)
- size (TEXT)
- name (TEXT)
- disabled (BOOL)
- description (TEXT)
- category (TEXT)
- price (DECIMAL)
- sellPrice (DECIMAL)
- discount (DECIMAL)
- isSpecialPrice (BOOL)
- stockQty (INT)
- printQty (INT)
- pricingId (TEXT)


### Barcode (`barcode`)
- barcodeId (SERIAL) [PK]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT) 
- brandCode (TEXT)
- [Constraint]: Unique(barcode, brandCode)


### ProjectHeader (`project`)
- projectId (SERIAL) [PK]
- projectCode (TEXT) [UNIQUE]
- projectName (TEXT)
- dateStart (DATE)
- dateEnd (DATE)
- description (TEXT)
- workingType (TEXT)
- disabled (BOOL)
- siteCode (TEXT)
- brandCode (TEXT)
- isCompleted (BOOL)
- projectStatus (TEXT)

### ProjectUser (`project_user`)
- projectId (INT) [FK -> ProjectHeader.projectId]
- username (TEXT) [FK -> User.username]
- deviceId (INT) [FK -> Device.deviceId]
- lastSync (TIMESTAMP)

### ProjectDetail (`project_detil`)
- projectId (INT) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT)
- price (DECIMAL)
- sellPrice (DECIMAL)
- discount (DECIMAL)
- isSpecialPrice (BOOL)
- stockQty (INT)
- printQty (INT)
- pricingId (TEXT)



### ProjectResult (`project_result`)
- projectId (INT) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT)
- deviceId (INT) [FK -> Device.deviceId]
- username (TEXT) [FK -> User.username]
- timestamp (TIMESTAMP)
- scannedQty (INT)
- [Constraint]: Unique(projectId, deviceId, timestamp) -> Untuk keperluan UPSERT, disini digunakan timestamp karena data result merupakan streaming historical data scann dari device, dimana setiap device bisa melakukan scan suatu barcode yang sama berulang-ulang.

---
## Relasi Data
- User 1---N UserDevice N---1 Device
- Item 1---N Barcode
- ProjectHeader 1---N ProjectUser
- ProjectHeader 1---N ProjectDetail
- ProjectHeader 1---N ProjectResult
---
## Data Contract Rules

### DbContract
`DbContract` adalah satu-satunya sumber kebenaran (Single Source of Truth)
untuk:
- Nama tabel database
- Jika nama tabel tidak mengirfomasikan schema, maka akan digunakan schema public
- Nama kolom database
- Alias resmi yang digunakan di query
- Dilarang keras memodifikasi DbContract, karena DbContract sudah dibuat berdasarkan aplikasi web opname yang sudah berjalan


### Mandatory Rules
- DR1: Semua query database MUST menggunakan nama tabel dan kolom dari `DbContract`
- DR2: Hardcoded string untuk nama tabel atau kolom MUST NOT digunakan
- DR3: Query yang tidak menggunakan `DbContract` dianggap invalid
- DR4: Perubahan nama tabel atau kolom hanya boleh dilakukan di `DbContract`
- DR5: Review code MUST menolak query yang melanggar aturan ini
### DbContract Structure (Conceptual)

DbContract:
- Device.TABLE
- Device.Columns.deviceId
- Device.Columns.name
- Device.Columns.disabled

- User.TABLE
- User.Columns.username
- User.Columns.fullname
- User.Columns.password

### Forbidden Patterns
- Menuliskan nama tabel sebagai string literal di query
- Menuliskan nama kolom langsung di SQL string
- Menyusun SQL dengan nama field manual

### Enforcement
- Semua query harus melalui layer repository / DAO
- Code review wajib memverifikasi penggunaan DbContract
- Static analysis / lint rule direkomendasikan

---
## API Service Rules
- API Service adalah service yang menangani request dan response dari client
- Semua endpoint API harus menggunakan format URL `/api/v1/...`
- Semua endpoint API harus menggunakan format JSON untuk request dan response
- **Pagination:** Semua endpoint GET yang mengembalikan list wajib mendukung parameter `limit` dan `offset`.


---
## API Service List

### Authentication
- POST /api/v1/auth/login digunakan untuk login dari device
- POST /api/v1/auth/logout digunakan untuk logout dari device
- POST /api/v1/auth/refresh digunakan untuk refresh token dari device

### User
- GET /api/v1/user/:userId digunakan untuk mendapatkan data user berdasarkan id

### Project
- GET /api/v1/project/:projectId digunakan untuk mendapatkan data project berdasarkan id
- GET /api/v1/project/:projectId/user digunakan untuk mendapatkan data user berdasarkan id
- GET /api/v1/project/:projectId/detail?lastSync= digunakan untuk mendapatkan data detail project berdasarkan id, menggunakan middleware `compression` (Gzip) untuk semua response API guna menghemat bandwidth device.
- PUT /api/v1/project/:projectId/result/:resultId digunakan untuk streaming data result project berdasarkan id
- POST /api/v1/project/:projectId/result/stream digunakan untuk streaming data result project



---
## 🔄 Delta Sync Strategy
Untuk mendukung performa offline-first pada Android, sistem menggunakan strategi Delta Sync:

### Mekanisme Sync
1. Client mengirimkan request dengan parameter `lastSync` (ISO Timestamp).
2. Server mencari data yang memiliki `updatedAt` > `lastSync`.
3. Server mengembalikan data yang berubah, termasuk data dengan status `isDeleted: true` agar client dapat menghapus data lokal.

### Update Data Model (Audit Fields)
Setiap tabel wajib memiliki kolom berikut untuk mendukung Delta Sync:
- `updatedAt` : TIMESTAMP (Default: CURRENT_TIMESTAMP, Update: ON UPDATE CURRENT_TIMESTAMP)
- `isDeleted` : BOOL (Default: false)

### Database Optimization
- **Indexing:** Kolom `updatedAt` pada setiap tabel wajib memiliki index untuk mempercepat proses filter saat Delta Sync.
- **Initial Sync:** Jika parameter `lastSync` tidak disertakan (null), server wajib mengirimkan seluruh data (Full Sync).
---
## 📤 Streaming & Chunking Rules (Project Result)
Untuk efisiensi pengiriman data hasil scan dalam jumlah besar dari Android, gunakan mekanisme **Chunked Batch Upload**:

### Aturan Streaming:
1. **Endpoint:** `POST /api/v1/project/:projectId/result/stream`
2. **Chunking Logic:** - Client mengirimkan data dalam bentuk array of objects (batch).
   - Setiap request wajib menyertakan `chunkId` dan `isFinalChunk` (boolean).
   - Server harus melakukan **Atomic Transaction** per chunk (semua data dalam satu chunk berhasil masuk, atau gagal semua).
3. **Integrity:**
   - Gunakan `projectId` di URL untuk validasi konteks.
   - Gunakan `upsert` (Insert on Conflict) berdasarkan constraint `Unique(projectId, deviceId, timestamp)` untuk mencegah duplikasi jika chunk terkirim ulang karena gangguan sinyal.

### Request Body Schema:
{
  "chunkId": "string-uuid",
  "isFinalChunk": false,
  "data": [
    { "itemId": "...", "barcode": "...", "scannedQty": 5, "timestamp": "..." },
    ...
  ]
}
---
## 🧪 Standar Testing
- **Framework:** Gunakan `Jest` sebagai test runner dan `Supertest` untuk integration testing API.
- **Requirement:** Setiap pembuatan service API baru WAJIB disertai dengan file unit test atau integration test di direktori `tests`.
- **Cakupan Testing:**
    - **Success Case:** Memastikan response 200/201 dengan struktur JSON yang benar.
    - **Validation Case:** Memastikan input yang salah ditolak (400 Bad Request).
    - **Security Case:** Memastikan request tanpa signature/token ditolak (401/403).
    - **DbContract Check:** Memastikan query database tidak menggunakan string literal.
- **Mocking:** Gunakan mocking untuk library pihak ketiga seperti Redis atau database jika diperlukan untuk unit testing murni.

---
## Instruksi Khusus untuk AI
1. Jika saya meminta fitur baru, selalu prioritaskan aspek **keamanan** dan **integritas data**.
2. Berikan contoh kode yang sudah menyertakan **logging** dan **error handling**.
3. Jika ada perubahan skema database, ingatkan saya untuk melakukan migrasi pada PostgreSQL 16.
4. Gunakan gaya bahasa yang profesional dan teknis dalam Bahasa Indonesia.
5. Untuk setiap operasi yang melibatkan multiple-insert (seperti Chunking), gunakan fitur **Database Transaction** untuk menjaga integritas data (Atomicity).
6. Saat membuatkan contoh penggunaan (examples) yang membutuhkan autentikasi, gunakan variabel `TEST_USER` dan `TEST_USERPASSWORD` yang diambil dari `process.env`. Jangan pernah menuliskan string 'admin' atau 'rahasia123' secara hardcoded di dalam file contoh kode.
