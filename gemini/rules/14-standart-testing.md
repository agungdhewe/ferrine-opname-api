## 🧪 Standar Testing
- **Framework:** Gunakan `Jest` sebagai test runner dan `Supertest` untuk integration testing API.
- **Requirement:** Setiap pembuatan service API baru WAJIB disertai dengan file unit test atau integration test di direktori `tests`.
- **Cakupan Testing:**
    - **Success Case:** Memastikan response 200/201 dengan struktur JSON yang benar.
    - **Validation Case:** Memastikan input yang salah ditolak (400 Bad Request).
    - **Security Case:** Memastikan request tanpa signature/token ditolak (401/403).
    - **DbContract Check:** Memastikan query database tidak menggunakan string literal.
- **Mocking:** Gunakan mocking untuk library pihak ketiga seperti Redis atau database jika diperlukan untuk unit testing murni.