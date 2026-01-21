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