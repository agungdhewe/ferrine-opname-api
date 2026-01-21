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