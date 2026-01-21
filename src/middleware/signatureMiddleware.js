import { generateSignature, sortObjectKeys } from '../utils/crypto.js';
import redisClient from '../config/redis.js';
import { getDeviceById } from '../repositories/deviceRepository.js';
import dotenv from 'dotenv';

dotenv.config();

const TOLERANCE_MINUTES = parseInt(process.env.SIGNATURE_TOLERANCE_MINUTES || '5');

/**
 * Middleware untuk validasi signature, nonce, dan timestamp.
 * Sesuai aturan di GEMINI.md bagian 'Keamanan & Authorisasi'.
 */
export const validateSignature = async (req, res, next) => {
    try {
        const timestamp = req.header('X-Timestamp');
        const nonce = req.header('X-Nonce');
        const signature = req.header('X-Signature');
        const deviceId = req.header('X-Device-ID');

        // 1. Validasi Komponen Header
        if (!timestamp || !nonce || !signature || !deviceId) {
            return res.status(401).json({
                status: 'error',
                message: 'Missing security headers'
            });
        }

        // 2. Validasi Timestamp (ISO 8601)
        const requestTime = new Date(timestamp);
        const serverTime = new Date();
        const diffMinutes = Math.abs(serverTime - requestTime) / (1000 * 60);

        if (isNaN(requestTime.getTime()) || diffMinutes > TOLERANCE_MINUTES) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired timestamp'
            });
        }

        // 3. Cek Nonce di Redis (Replay Attack Prevention)
        const nonceKey = `nonce:${nonce}`;
        const isNonceExist = await redisClient.get(nonceKey);
        if (isNonceExist) {
            return res.status(403).json({
                status: 'error',
                message: 'Duplicate request (Replay Attack detected)'
            });
        }

        // 4. Ambil Device Secret
        const device = await getDeviceById(deviceId);
        if (!device || device.disabled) {
            return res.status(401).json({
                status: 'error',
                message: 'Device not registered or disabled'
            });
        }

        // 5. Validasi Signature
        // Sesuai aturan: signature = hash_hmac('sha256', rawBody + timestamp + nonce, deviceSecret)
        // rawBody di server diambil dari sorted JSON body jika ada
        const rawBody = req.body && Object.keys(req.body).length > 0
            ? sortObjectKeys(req.body)
            : '';

        const expectedSignature = generateSignature(rawBody, timestamp, nonce, device.secret);

        if (signature !== expectedSignature) {
            console.error(`[Security] Signature mismatch for Device: ${deviceId}`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid Request Signature'
            });
        }

        // 6. Simpan Nonce ke Redis dengan TTL (misal 5 menit)
        await redisClient.set(nonceKey, '1', {
            EX: TOLERANCE_MINUTES * 60
        });

        next();
    } catch (error) {
        console.error('[Security Error]', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Security Validation Error'
        });
    }
};
