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