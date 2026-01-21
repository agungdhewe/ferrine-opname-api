import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';

dotenv.config();

/**
 * Middleware untuk memvalidasi Access Token (JWT).
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access Token Required'
            });
        }

        // Cek apakah token ada di blacklist (Redis) - misal setelah logout
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                status: 'error',
                message: 'Token has been revoked'
            });
        }

        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Invalid or Expired Access Token'
                });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('[Auth Error]', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Authentication Error'
        });
    }
};

/**
 * Middleware khusus Admin.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Admin access required'
        });
    }
};
