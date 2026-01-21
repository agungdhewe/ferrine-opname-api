import pool from '../config/database.js';
import DbContract from '../config/DbContract.js';

const { User } = DbContract;

/**
 * Mendapatkan data user berdasarkan username.
 * @param {string} username 
 * @returns {Promise<Object|null>}
 */
export const getUserByUsername = async (username) => {
    try {
        const query = `
            SELECT * FROM ${User.TABLE} 
            WHERE ${User.Columns.username} = $1 
            AND ${User.Columns.isDeleted} = false
        `;
        const result = await pool.query(query, [username]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('[UserRepository Error]', error);
        throw error;
    }
};

/**
 * Memperbarui data user.
 * @param {string} username 
 * @param {Object} data 
 * @returns {Promise<boolean>}
 */
export const updateUser = async (username, data) => {
    try {
        const fields = Object.keys(data).map((key, index) => `${User.Columns[key]} = $${index + 2}`);
        const values = Object.values(data);
        const query = `
            UPDATE ${User.TABLE} 
            SET ${fields.join(', ')}, ${User.Columns.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${User.Columns.username} = $1
        `;
        const result = await pool.query(query, [username, ...values]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('[UserRepository Update Error]', error);
        throw error;
    }
};
