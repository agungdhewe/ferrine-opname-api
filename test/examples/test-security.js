import axios from 'axios';
import crypto from 'crypto';

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

const testSecurity = async () => {
    const baseURL = 'http://localhost:3000/api/v1';
    const deviceId = '1';
    const deviceSecret = 'mydevicesecret'; // Ganti sesuai data di DB testing
    const body = {
        name: 'John Doe',
        action: 'test_scan',
        items: [1, 2, 3]
    };

    const timestamp = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const rawBody = sortObjectKeys(body);
    const signature = generateSignature(rawBody, timestamp, nonce, deviceSecret);

    console.log('Testing with:');
    console.log('- Timestamp:', timestamp);
    console.log('- Nonce:', nonce);
    console.log('- Signature:', signature);

    try {
        const response = await axios.post(`${baseURL}/test/signature`, body, {
            headers: {
                'X-Timestamp': timestamp,
                'X-Nonce': nonce,
                'X-Signature': signature,
                'X-Device-ID': deviceId,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testSecurity();
