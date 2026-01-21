## 🔐 Keamanan & Authorisasi
- **Layered Auth:** Gunakan Access Token (short-lived) dan Refresh Token (long-lived).
- **Session Management:** Simpan session di Redis untuk validasi refresh token dan mekanisme logout.
- **Abuse Prevention:** Terapkan `express-rate-limit` pada semua endpoint API.
- **Logging:** Gunakan sistem logging untuk setiap error dan aktivitas krusial guna keperluan debugging.
- **Nonce Validation:** Gunakan `nonce` (number used once) yang dikombinasikan dengan timestamp pada setiap request sensitif untuk mencegah Replay Attacks.
- **Signature Validation:** Gunakan `signature` (hash dari request body + timestamp + nonce + secret key dari masing-masing device) pada setiap request sensitif untuk mencegah Replay Attacks.
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