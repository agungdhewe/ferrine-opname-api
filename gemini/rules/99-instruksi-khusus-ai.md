## Instruksi Khusus untuk AI
1. Jika saya meminta fitur baru, selalu prioritaskan aspek **keamanan** dan **integritas data**.
2. Berikan contoh kode yang sudah menyertakan **logging** dan **error handling**.
3. Jika ada perubahan skema database, ingatkan saya untuk melakukan migrasi pada PostgreSQL 16.
4. Gunakan gaya bahasa yang profesional dan teknis dalam Bahasa Indonesia.
5. Untuk setiap operasi yang melibatkan multiple-insert (seperti Chunking), gunakan fitur **Database Transaction** untuk menjaga integritas data (Atomicity).
6. Saat membuatkan contoh penggunaan (examples) yang membutuhkan autentikasi, gunakan variabel `TEST_USER` dan `TEST_USERPASSWORD` yang diambil dari `process.env`. Jangan pernah menuliskan string 'admin' atau 'rahasia123' secara hardcoded di dalam file contoh kode.