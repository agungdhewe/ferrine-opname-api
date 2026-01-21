import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getUserByUsername } from '../repositories/userRepository.js';
import { comparePassword } from '../utils/crypto.js';
import redisClient from '../config/redis.js';

dotenv.config();

/**
 * Generate Access Token.
 * @param {Object} payload 
 * @returns {string}
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
    });
};

/**
 * Generate Refresh Token.
 * @param {Object} payload 
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

/**
 * Login user dan generate tokens.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export const login = async (username, password) => {
    try {
        const user = await getUserByUsername(username);

        if (!user || user.disabled) {
            throw new Error('User not found or disabled');
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            throw new Error('Invalid credentials');
        }

        const payload = {
            username: user.username,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Simpan refresh token di Redis untuk validasi session
        const sessionKey = `session:${user.username}`;
        await redisClient.set(sessionKey, refreshToken, {
            EX: 7 * 24 * 60 * 60 // 7 hari sesuai default refresh token
        });

        return {
            accessToken,
            refreshToken,
            user: {
                username: user.username,
                fullname: user.fullname,
                isAdmin: user.isAdmin
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Refresh Access Token menggunakan Refresh Token.
 * @param {string} refreshToken 
 * @returns {Promise<Object>}
 */
export const refresh = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Validasi apakah refresh token masih aktif di Redis
        const sessionKey = `session:${decoded.username}`;
        const storedToken = await redisClient.get(sessionKey);

        if (storedToken !== refreshToken) {
            throw new Error('Invalid or expired session');
        }

        const payload = {
            username: decoded.username,
            fullname: decoded.fullname,
            isAdmin: decoded.isAdmin
        };

        const newAccessToken = generateAccessToken(payload);

        return {
            accessToken: newAccessToken
        };
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

/**
 * Logout user dan hapus session.
 * @param {string} username 
 * @param {string} accessToken 
 * @returns {Promise<void>}
 */
export const logout = async (username, accessToken) => {
    try {
        // Hapus session dari Redis
        await redisClient.del(`session:${username}`);

        // Blacklist Access Token (Opsional, tapi direkomendasikan jika ingin token segera mati)
        const expiredIn = 3600; // Misal 1 jam sesuai TTL access token
        await redisClient.set(`blacklist:${accessToken}`, '1', {
            EX: expiredIn
        });
    } catch (error) {
        console.error('[AuthService Logout Error]', error);
        throw error;
    }
};
