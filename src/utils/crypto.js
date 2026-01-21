import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Mengurutkan key objek secara alfabetis dan mengembalikan string JSON.
 * Digunakan untuk konsistensi signature antara Android dan Server.
 * @param {Object} obj 
 * @returns {string}
 */
export const sortObjectKeys = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return JSON.stringify(obj.map(sortObjectKeys));

    const sortedObj = {};
    Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = sortObjectKeys(obj[key]);
    });
    return JSON.stringify(sortedObj);
};

/**
 * Membuat signature HMAC-SHA256 sesuai aturan GEMINI.md.
 * Pattern: rawBody + timestamp + nonce
 * @param {string} rawBody 
 * @param {string} timestamp 
 * @param {string} nonce 
 * @param {string} secret 
 * @returns {string}
 */
export const generateSignature = (rawBody, timestamp, nonce, secret) => {
    const data = rawBody + timestamp + nonce;
    return crypto.createHmac('sha256', secret)
        .update(data)
        .digest('hex');
};

/**
 * Hashing password menggunakan bcrypt.
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Membandingkan password dengan hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
