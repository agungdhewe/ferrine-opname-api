import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}/api/v1/auth`;

// Helper untuk Signature (Sesuai aturan GEMINI.md)
const generateSignature = (rawBody, timestamp, nonce, secret) => {
    const data = rawBody + timestamp + nonce;
    return crypto.createHmac('sha256', secret)
        .update(data)
        .digest('hex');
};

const sortObjectKeys = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return JSON.stringify(obj.map(sortObjectKeys));
    const sortedObj = {};
    Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = sortObjectKeys(obj[key]);
    });
    return JSON.stringify(sortedObj);
};

async function runDemo() {
    console.log('--- Authentication Service Demo ---');

    // 1. DATA TESTING (Sesuai GEMINI.md: Gunakan TEST_USER & TEST_USERPASSWORD dari env)
    const deviceId = process.env.TEST_DEVICE_ID || '1';
    const deviceSecret = process.env.TEST_DEVICE_SECRET || 'mydevicesecret';
    const username = process.env.TEST_USER || 'admin';
    const password = process.env.TEST_USERPASSWORD || 'rahasia123';

    const loginData = { username, password };
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const rawBody = sortObjectKeys(loginData);
    const signature = generateSignature(rawBody, timestamp, nonce, deviceSecret);

    try {
        console.log('\n[1] Melakukan Login...');
        const loginRes = await axios.post(`${API_URL}/login`, loginData, {
            headers: {
                'X-Timestamp': timestamp,
                'X-Nonce': nonce,
                'X-Signature': signature,
                'X-Device-ID': deviceId
            }
        });

        const { accessToken, refreshToken } = loginRes.data.data;
        console.log('✅ Login Berhasil!');
        console.log('Access Token:', accessToken.substring(0, 20) + '...');

        // 2. REFRESH TOKEN
        console.log('\n[2] Mencoba Refresh Token...');
        const refreshData = { refreshToken };
        const rtTimestamp = new Date().toISOString();
        const rtNonce = crypto.randomBytes(16).toString('hex');
        const rtSignature = generateSignature(sortObjectKeys(refreshData), rtTimestamp, rtNonce, deviceSecret);

        const refreshRes = await axios.post(`${API_URL}/refresh`, refreshData, {
            headers: {
                'X-Timestamp': rtTimestamp,
                'X-Nonce': rtNonce,
                'X-Signature': rtSignature,
                'X-Device-ID': deviceId
            }
        });
        console.log('✅ Refresh Berhasil! New Access Token:', refreshRes.data.data.accessToken.substring(0, 20) + '...');

        // 3. LOGOUT
        console.log('\n[3] Melakukan Logout...');
        const loTimestamp = new Date().toISOString();
        const loNonce = crypto.randomBytes(16).toString('hex');
        const loSignature = generateSignature('', loTimestamp, loNonce, deviceSecret);

        await axios.post(`${API_URL}/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Timestamp': loTimestamp,
                'X-Nonce': loNonce,
                'X-Signature': loSignature,
                'X-Device-ID': deviceId
            }
        });
        console.log('✅ Logout Berhasil!');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        console.log('\nTips: Pastikan server jalan (npm run dev) dan Redis/DB sudah online.');
    }
}

runDemo();
