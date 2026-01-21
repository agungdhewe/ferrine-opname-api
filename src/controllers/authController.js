import * as authService from '../services/authService.js';

/**
 * Controller untuk login user.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        const result = await authService.login(username, password);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        console.error('[Login Controller Error]', error.message);
        const statusCode = error.message === 'Invalid credentials' || error.message === 'User not found or disabled' ? 401 : 500;
        res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Controller untuk logout user.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
export const logout = async (req, res) => {
    try {
        const { username } = req.user;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        await authService.logout(username, token);
        res.status(200).json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('[Logout Controller Error]', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
};

/**
 * Controller untuk refresh token.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        const result = await authService.refresh(refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Token refreshed',
            data: result
        });
    } catch (error) {
        console.error('[Refresh Controller Error]', error.message);
        res.status(403).json({
            status: 'error',
            message: error.message
        });
    }
};
