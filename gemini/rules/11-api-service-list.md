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


